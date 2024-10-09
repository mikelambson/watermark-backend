// middleware/authorize.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Middleware to check roles and permissions using sessionId
const authorize = (requiredPermissions = []) => {
    return async (req, res, next) => {
        const sessionId = req.headers.sessionid;
        
        // Check if sessionId is undefined or empty
        if (!sessionId || sessionId.trim() === "") {
            return res.status(400).send("Session ID is required. Please provide a valid session ID in the request headers.");
        }

        try {
            // Fetch the user associated with the sessionId
            const session = await prisma.activeSessions.findUnique({
                where: { id: sessionId },
                include: { user: true } // Include user to access user details
            });
        
            // Check if the session exists
            if (!session || !session.user) {
                return res.status(401).send("Invalid session. Please log in again.");
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
                    where: { userId: req.user.id },
                    include: {
                        role: {
                            include: {
                                RolePermissions: { // Ensure this matches your Prisma model correctly
                                    include: { permission: true }
                                }
                            }
                        }
                    }
                });
            
            // Check if any role has the superAdmin flag
            const isSuperAdmin = userRoles.some(userRole => userRole.role.superAdmin);

            // Grant access immediately if the user is a superAdmin
            if (isSuperAdmin) {
                return next(); // SuperAdmins are always authorized
            }

            // Gather user's granted permissions
            const userPermissions = new Set();
            userRoles.forEach(userRole => { // Corrected from user.userRoles
                userRole.role.rolePermissions.forEach(rp => {
                    if (rp.granted) userPermissions.add(rp.permission.name);
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
