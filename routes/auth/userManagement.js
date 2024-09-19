import express from 'express';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();
const manage = express.Router();

// Middleware to check for admin privileges
const checkAdmin = async (req, res, next) => {
  const userRole = req.user.role; // Assuming req.user is set after authentication
  if (userRole.superAdmin) {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden' });
};

// Add a new user
manage.post('/users', checkAdmin, async (req, res) => {
  const { login, password, email, fullname, roleId } = req.body;
  try {
    const existingUser = await prisma.Users.findUnique({ where: { login } });
    if (existingUser) {
      return res.status(400).json({ message: 'Login already exists' });
    }
    
    const hashedPassword = await argon2.hash(password);
    const newUser = await prisma.Users.create({
      data: {
        login,
        password: hashedPassword,
        email,
        fullname,
        roleId,
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update a user
manage.put('/users/:id', checkAdmin, async (req, res) => {
  const { id } = req.params;
  const { email, fullname, login, roleId } = req.body;

  try {
    const existingUser = await prisma.Users.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await prisma.Users.update({
      where: { id },
      data: {
        email,
        fullname,
        login,
        roleId,
      },
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete a user
manage.delete('/users/:id', checkAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const userToDelete = await prisma.Users.findUnique({ where: { id } });
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    // SuperAdmin can delete any user
    if (!req.user.role.superAdmin && userToDelete.protected) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.Users.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// User profile management
manage.put('/profile', async (req, res) => {
  const { userId } = req.user; // Assuming userId is available in req.user
  const { name, email, login, userMeta } = req.body;

  try {
    const updatedProfile = await prisma.Users.update({
      where: { id: userId },
      data: {
        fullname: name,
        email,
        login,
        userMeta, // Assuming userMeta is a field on Users
      },
    });
    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default manage;
