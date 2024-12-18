// middleware/authorize.js
import { PrismaClient } from '@prisma/client';
import { verifyPassword } from './passwordHashing.js';
import { decrypt } from './simpleCrypto.js';

const prisma = new PrismaClient();

// Middleware to check roles and permissions using sessionId
const authorize = (requiredPermissions = []) => {
    return async (req, res, next) => {
        let decryptedLoginField;
        const sessionId = req.cookies.sessionId;
        const loginField = req.cookies.loginField;
        
        
        // Check if sessionId is undefined or empty
        if (!sessionId || sessionId.trim() === "") {
            return res.status(403).render('forbidden', { message: 'FORBIDDEN' });
        } 
        if (!loginField || loginField === undefined) {
            return res.status(403).render('forbidden', { message: 'FORBIDDEN' });
        }

        // Split the IV and encrypted data
        const [iv, encryptedData] = loginField.split(':');
        
        // Decrypt the login field
        try{
        decryptedLoginField = decrypt(encryptedData, iv);
        } catch {
            console.log("Tampered Cookie")
            return res.status(403).render('forbidden', { message: 'FORBIDDEN' });
        }

        try {
            // Fetch the user associated with the sessionId
            const session = await prisma.activeSessions.findUnique({
                where: { id: sessionId },
                include: { user: true } // Include user to access user details
            });
            
                    
            // Check if the session exists
            if ( !session || !session.user ) {
                return res.status(401).send("Invalid session. Please log in again.");
            }
            
            if (decryptedLoginField !== session.user.login) {
                return res.status(403).render('forbidden', { message: `FORBIDDEN | ${loginField} = ${session.user.login}` });
            }
        
            // Check if the session is inactive or expired
            const currentTime = new Date();
            if (!session.isActive || (session.expiresAt && session.expiresAt < currentTime)) {
                // If the session is not active or is expired
                await prisma.activeSessions.delete({ where: { id: sessionId } }); // Delete the invalid session
                return res.status(401).send("Session expired or inactive. Please log in again.");
            }
        
            req.user = session.user; 

            
            // Fetch all roles for the authenticated user, including the superAdmin flag and associated permissions
            const userRoles = await prisma.userRoles.findMany({
                where: { userId: req.user.id }, // Assuming `req.user.id` is the logged-in user's ID
                include: {
                    role: {
                        include: {
                            RolePermissions: { // Correct case based on your schema
                                include: { permission: true }, // Fetch permission details
                            },
                        },
                    },
                },
            });
            
            // Check if any role has the superAdmin flag
            const isSuperAdmin = userRoles.some(userRole => userRole.role.superAdmin);

            // Grant access immediately if the user is a superAdmin
            if (isSuperAdmin) {
                return next(); // SuperAdmins are always authorized
            }

            // Gather user's granted permissions
            const userPermissions = new Set();
            userRoles.forEach(userRole => {
                const rolePermissions = userRole.role?.RolePermissions || [];
                rolePermissions.forEach(rp => {
                    if (rp.granted && rp.permission?.name) {
                        userPermissions.add(rp.permission.name);
                    }
                });
            });
            
            // Check if user has all required permissions
            const hasRequiredPermissions = requiredPermissions.every(permission => userPermissions.has(permission));
            
            if (!hasRequiredPermissions) {
                return res.status(403).send("Access denied. Insufficient permissions.");
            }

            next();
        } catch (error) { // Added error parameter for better debugging
            console.error("Authorization error:", error);
            return res.status(403).send("Something went wrong");
        }
    };
};

export { authorize };
