// routes/auth/authRoutes.js
import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { login, logout } from '../../controllers/authController.js';
import manage from './userManagement.js';
import profile from './profile.js';
import { PrismaClient } from '@prisma/client';
import { SetCookies, ClearCookies }  from '../../middleware/cookies.js';

const auth = express.Router();
const prisma = new PrismaClient();

// Define authentication routes
auth.post('/login', login);
// auth.post('/logout', authenticate, logout);
auth.post('/logout', logout);
auth.use('/manage', manage)
auth.use('/profile', profile)

auth.get('/session', async (req, res) => {
    console.log('Cookies: ', req.cookies);
    const { sessionId } = req.cookies;
  
    if (!sessionId) {
      return res.status(401).json({ message: 'Session ID missing' });
    }

  
    // Fetch session from database
    const session = await prisma.activeSessions.findUnique({
      where: { id: sessionId },
      include: { 
        user: {
            include: {
                roleId: {
                    include: {
                        role: {
                            include: {
                                RolePermissions: true
                            }
                        }
                    }
                }
            }
        }
     }},
    );
    
    if (!session) {
        return res.status(401).json({ message: 'user incorrect/bad session' });
    }

    const permissions = [];
    let isSuperAdmin = false;
    
    session.user.roleId.forEach(role => {
        if (role.role.superAdmin && !isSuperAdmin) {
          isSuperAdmin = true; // Set the flag to true only once
        }
        permissions.push(...role.role.RolePermissions); // Collect all permissions
    });

    const responsePermissions = isSuperAdmin ? [ 'superAdmin', ...permissions ] : permissions;

    const sessionAuth = {
        id: session.user.id,
        login: session.user.login,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        roles: session.user.roleId.map(role => role.role.name),
        permissions: responsePermissions,
    }

    // Update session expiration time
    const newExpiresAt = new Date();
    newExpiresAt.setHours(newExpiresAt.getHours() + 24); // Extend by 1 hour

    await prisma.activeSessions.update({
    where: { id: sessionId },
    data: { expiresAt: newExpiresAt },
    });
    
    const userLogin = session.user.login;
    // Set cookies using the middleware
    SetCookies({ res, sessionId, userLogin });
   
  
    return res.status(200).json( sessionAuth );
});

// Export the auth router
export default auth;
