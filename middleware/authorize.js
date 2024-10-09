// middleware/authorize.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Middleware to check roles and permissions
const authorize = (requiredPermissions = [], allowSuperAdmin = false) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(403).send("User not authenticated");
    }

    // Fetch all roles for the authenticated user, including the superAdmin flag and associated permissions
    const userRoles = await prisma.userRoles.findMany({
      where: { userId: req.user.id },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: { permission: true }
            }
          }
        }
      }
    });

    // Check if any role has the superAdmin flag
    const isSuperAdmin = userRoles.some(userRole => userRole.role.superAdmin);

    // If superAdmin access is allowed, grant full access
    if (allowSuperAdmin && isSuperAdmin) {
      return next();
    }

    // Gather user's granted permissions
    const userPermissions = new Set();
    userRoles.forEach(userRole => {
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
