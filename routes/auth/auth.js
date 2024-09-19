import express from 'express';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
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

// Register new user
router.post('/register', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required.' });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists.' });

    // Hash the password using Argon2
    const hashedPassword = await argon2.hash(password);

    // Create new user
    const user = await prisma.users.create({
      data: {
        email,
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
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Find user
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'User not found.' });

    // Check password using Argon2
    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid password.' });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get user metadata
router.get('/meta', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    // Fetch user metadata
    const userMeta = await prisma.userMeta.findUnique({ where: { userId } });
    if (!userMeta) return res.status(404).json({ error: 'User metadata not found.' });

    res.json(userMeta);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Update user metadata
router.put('/meta', authenticateToken, async (req, res) => {
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

export default router;
