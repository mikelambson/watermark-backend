import express from 'express';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { authorize } from '../../middleware/authorize.js';

const prisma = new PrismaClient();
const manage = express.Router();


// Get all users with related tables
manage.get('/users', authorize(['can_manage_users']),  async (req, res) => {
  // console.log("getting users")
    try {
      const users = await prisma.Users.findMany({
        include: {
          // Include all fields except the password
          
          password: false,
          
          roleId: {
            include: {
              role: true,  // Include related roles
            },
          },              
            TwoFactorAuth: true,      // Include TwoFactorAuth if applicable
            LdapAuth: true,           // Include LdapAuth if applicable
            ActiveSessions: true,      // Include ActiveSessions if applicable
            PasswordResets: true,     // Include PasswordResets if applicable
            UserMeta: true,           // Include UserMeta if applicable
          },
      });
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  

// Add a new user
manage.post('/users', authorize(['can_manage_users']), async (req, res) => {
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
manage.put('/users/:id', authorize(['can_manage_users']), async (req, res) => {
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
manage.delete('/users/:id', authorize(['can_manage_users']), async (req, res) => {
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
manage.put('/profile', authorize(['can_manage_users, can_update_self']), async (req, res) => {
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
