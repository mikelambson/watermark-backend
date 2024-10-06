import express from 'express';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import manage from './userManagement.js';

const auth = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Replace with your JWT secret

// Middleware to handle authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

auth.use('/manage', manage)

// Register new user
auth.post('/register', async (req, res) => {
  const { login, password, role } = req.body;

  if (!login || !password || !role) {
    return res.status(400).json({ error: 'login, password, and role are required.' });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.users.findUnique({ where: { login } });
    if (existingUser) return res.status(400).json({ error: 'User already exists.' });

    // Hash the password using Argon2
    const hashedPassword = await argon2.hash(password);

    // Create new user
    const user = await prisma.users.create({
      data: {
        login,
        password: hashedPassword,
        roleId: role, // Assuming role is an ID of the Roles table
      },
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Login user
auth.post('/login', async (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ error: 'Login and password are required.' });
  }

  try {
    // Find user by login, include their roles
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
      return res.status(400).json({ error: 'Invalid login or password.' });
    }

    // Verify password using Argon2
    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid login or password.' });
    }

    // Check if the user is active
    if (!user.active) {
      return res.status(403).json({ error: 'User account is inactive.' });
    }
    const userInfo = {
      id: user.id,
      login: user.login,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      email: user.email,
      title: user.title,
      tcid_staff: user.tcid_staff,
      protected: user.protected,
      active: user.active,
      temppass: user.temppass,
    };
    // Check for the user's role(s)
    const roles = user.roleId.map(roleEntry => ({
      roleId: roleEntry.role.id,
      roleName: roleEntry.role.name,
      superAdmin: roleEntry.role.superAdmin,
      protected: roleEntry.role.protected,
    }));

    const isSuperAdmin = roles.some(role => role.superAdmin);
    const isProtected = roles.some(role => role.protected);

    // Generate JWT with role information
    const token = jwt.sign(
      {
        userId: user.id,
        login: user.login,
        roles, // Include roles in the token
        isSuperAdmin,
        isProtected
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send response with token
    res.json(
      { 
        token, 
        message: 'Login successful',
        userInfo,
        roles 

      });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});


// Update user metadata
auth.put('/meta', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { preferences, connectedAccounts } = req.body;

  try {
    // Update user metadata
    const updatedMeta = await prisma.userMeta.upsert({
      where: { userId },
      update: { preferences, connectedAccounts },
      create: { userId, preferences, connectedAccounts }
    });

    res.json(updatedMeta);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

export default auth;
