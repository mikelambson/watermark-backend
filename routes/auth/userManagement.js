import express from 'express';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { authorize } from '../../middleware/authorize.js';

const prisma = new PrismaClient();
const manage = express.Router();


// Get all users with related tables
manage.get('/users', authorize(['can_manage_users']), async (req, res) => {
  try {
    // Extract optional `tcid_staff` filter from query parameters
    const { tcid_staff } = req.query;

    // Build the Prisma query filters dynamically
    const filters = {};
    if (tcid_staff !== undefined) {
      // Convert `tcid_staff` from string to boolean
      filters.tcid_staff = tcid_staff === 'true';
    }

    const users = await prisma.Users.findMany({
      where: filters, // Apply filters dynamically
      include: {
        password: false, // Exclude password from the response
        roleId: {
          include: {
            role: true, // Include related roles
          },
        },
        TwoFactorAuth: true, // Include TwoFactorAuth if applicable
        LdapAuth: true,      // Include LdapAuth if applicable
        ActiveSessions: true,// Include ActiveSessions if applicable
        PasswordResets: true,// Include PasswordResets if applicable
        UserMeta: true,      // Include UserMeta if applicable
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
  const {
    login,
    password,
    firstName,
    middleName,
    lastName,
    email,
    title,
    tcid_staff,
    active,
    roleId,
  } = req.body;

  const sessionId = req.cookies?.sessionId; // Extract session ID from cookies

  try {
    // Validate session ID
    if (!sessionId) {
      return res.status(401).json({ message: 'Unauthorized: No session ID provided.' });
    }

    // Retrieve updaterId from activeSessions
    const activeSession = await prisma.activeSessions.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    });

    if (!activeSession) {
      return res.status(401).json({ message: 'Unauthorized: Invalid session ID.' });
    }

    const updaterId = activeSession.userId; // Extract userId from the session

    // Validate required fields
    if (!login || !password) {
      return res.status(400).json({ message: 'Login and password are required.' });
    }

    // Check if the user already exists
    const existingUser = await prisma.Users.findUnique({ where: { login } });
    if (existingUser) {
      return res.status(400).json({ message: 'Login already exists.' });
    }

    // Hash the password
    const hashedPassword = await argon2.hash(password);

    // Create the new user
    const newUser = await prisma.Users.create({
      data: {
        login,
        password: hashedPassword,
        firstName: firstName || null,
        middleName: middleName || null,
        lastName: lastName || null,
        email: email || null,
        title: title || null,
        tcid_staff: tcid_staff ?? false,
        active: active ?? true,
        temppass: password,
        roleId: roleId || null,
      },
    });

    // Log the creation in AuthAuditLogs
    await prisma.AuthAuditLogs.create({
      data: {
        userId: updaterId, // The user performing the creation
        action: 'create_user', // Description of the action
        details: {
          createdUserId: newUser.id, // ID of the user created
          createdFields: req.body, // Original fields provided in the request
        },
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
  const { id } = req.params; // User being updated
  const updateData = req.body; // Fields to update
  const sessionId = req.cookies?.sessionId; // Extract sessionId from cookies

  try {
    // Ensure sessionId exists
    if (!sessionId) {
      return res.status(401).json({ message: 'Unauthorized: No session ID provided.' });
    }

    // Retrieve updaterId from activeSessions
    const activeSession = await prisma.activeSessions.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    });

    if (!activeSession) {
      return res.status(401).json({ message: 'Unauthorized: Invalid session ID.' });
    }

    const updaterId = activeSession.userId; // Extract userId from the session

    // Ensure at least one field to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No fields provided to update.' });
    }

    // Find the user to update
    const existingUser = await prisma.Users.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // If the user is protected, only allow superAdmins to modify
    if (existingUser.protected && !req.user.role.superAdmin) {
      return res.status(403).json({ message: 'Forbidden: Cannot modify a protected user.' });
    }

    // Hash password if it's part of the update
    if (updateData.password) {
      updateData.password = await argon2.hash(updateData.password);
    }

    // Perform the update
    const updatedUser = await prisma.Users.update({
      where: { id },
      data: updateData,
    });

    // Log the update in AuthAuditLogs
    await prisma.AuthAuditLogs.create({
      data: {
        userId: updaterId, // The user performing the update
        action: 'update_user', // Description of the action
        details: {
          targetId: id, // ID of the user being updated
          updatedFields: updateData, // Fields that were updated
        },
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
