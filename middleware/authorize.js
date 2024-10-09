// middleware/authorize.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Middleware to check roles and permissions using sessionId
const authorize = (requiredPermissions = []) => {
    return async (req, res, next) => {
      const { sessionId } = req.headers;
  
    if (!sessionId) {
        return res.status(403).send("Session not provided or invalid.");
    }

     // Fetch the user associated with the sessionId
    const session = await prisma.activeSession.findUnique({
        where: { id: sessionId },
        include: {
            user: {
                include: {
                    userRoles: {
                        include: {
                            role: {
                                include: {
                                    rolePermissions: {
                                        include: { permission: true }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!session || !session.user) {
        return res.status(403).send("Invalid session or user not found.");
    }

    const user = session.user;

    // Check if any role has the superAdmin flag
    const isSuperAdmin = userRoles.some(userRole => userRole.role.superAdmin);

    // Grant access immediately if the user is a superAdmin
    if (isSuperAdmin) {
        return next(); // SuperAdmins are always authorized
      }

    // Gather user's granted permissions
    const userPermissions = new Set();
    user.userRoles.forEach(userRole => {
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
  };
};

export { authorize };
