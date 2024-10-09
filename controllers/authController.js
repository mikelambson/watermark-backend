// src/controllers/authController.js
import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword } from '../middleware/passwordHashing.js';
import { v4 as uuid } from 'uuid'; // Ensure to import uuid if you haven't

const prisma = new PrismaClient();

const login = async (req, res) => {
  const { login, password } = req.body;

//   const user = await prisma.user.findUnique({ where: { login } });
  const user = await prisma.users.findUnique({
    where: { login },
    include: {
      roleId: {
        include: {
          role: true
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
  expiresAt.setHours(expiresAt.getHours() + 1);

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

  res.cookie('sessionId', sessionId, { httpOnly: true });

  res.json({
    id: user.id,
    login: user.login,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user.roleId.map(role => role.role.name),
  });
};

const logout = async (req, res) => {
  await prisma.activeSession.deleteMany({
    where: { userId: req.user.id }
  });
  res.clearCookie('sessionId');
  res.send("Logged out");
};

// Export the functions directly for easier import
export { login, logout };

