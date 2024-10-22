// src/controllers/authController.js
import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword } from '../middleware/passwordHashing.js';
import { v4 as uuid } from 'uuid'; // Ensure to import uuid if you haven't
import { SetCookies, ClearCookies } from '../middleware/cookies.js';


const prisma = new PrismaClient();

const login = async (req, res) => {
  const { login, password } = req.body;

//   const user = await prisma.user.findUnique({ where: { login } });
  const user = await prisma.users.findUnique({
    where: { login },
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
  });
  
  if (!user) {
    return res.status(401).send("User not found");
  }

  const isValidPassword = await verifyPassword(user.password, password);
  if (!isValidPassword) {
    return res.status(401).send("Invalid credentials");
  }

  if (!user.active) {
    return res.status(403).send("Account is inactive");
  }

  const sessionId = uuid(); // Generate a unique session ID
  const userAgent = req.headers['user-agent'] || null; // Get user agent
  const ipAddress = req.ip || null; // Get IP address

  // Set session expiration time (e.g., 1 hour from now)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  // Create the session in the database
  await prisma.activeSessions.create({
    data: {
      id: sessionId, // Use the UUID as the session ID
      userId: user.id,
      userAgent,
      ipAddress,
      expiresAt,
      isActive: true, // Mark the session as active
    },
  });

   // Construct permissions array
   const permissions = [];
   let isSuperAdmin = false;

    // Iterate through roles to check for superAdmin and collect permissions
  user.roleId.forEach(role => {
    if (role.role.superAdmin && !isSuperAdmin) {
      isSuperAdmin = true; // Set the flag to true only once
    }
    permissions.push(...role.role.RolePermissions); // Collect all permissions
  });

  const userLogin = user.login;
  // Set cookies using the middleware
  SetCookies({ res, sessionId, userLogin });

  // Adjust permissions array based on superAdmin status
  const responsePermissions = isSuperAdmin ? [ 'superAdmin', ...permissions ] : permissions;

  res.json({
    id: user.id,
    login: user.login,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user.roleId.map(role => role.role.name),
    permissions: responsePermissions,
  });
};

const logout = async (req, res) => {
    try {
      const { userId, sessionId } = req.body;
  
      // Check if neither userId nor sessionId is provided
      if (!userId && !sessionId) {
        return res.status(400).json({ message: "Either userId or sessionId is required" });
      }
  
      // If userId is provided, log out all sessions for the user
      if (userId) {
        await prisma.activeSessions.deleteMany({
          where: { userId }
        });
      }
  
      // If sessionId is provided, log out the specific session
      if (sessionId) {
        await prisma.activeSessions.deleteMany({
          where: { id: sessionId } // Use `id` to refer to the sessionId in your ActiveSession model
        });
      }
      
      ClearCookies(res)
    
  
      // Send a response indicating success
      res.status(200).json({ message: "Successfully logged out" });
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ message: "An error occurred during logout" });
    }
  };

// Export the functions directly for easier import
export { login, logout };

