import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Hash the password
    const hashedPassword = await argon2.hash('admin');

    // Find the sysadmin role
    const role = await prisma.Roles.findUnique({
      where: { name: 'sysadmin' },
    });

    if (!role) {
      console.error('Role sysadmin not found');
      return;
    }

    // Create the admin user
    const newUser = await prisma.Users.create({
      data: {
        login: 'admin',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com', // or any email you prefer
      },
    });

    // Assign the sysadmin role to the user in the UserRoles table
    await prisma.UserRoles.create({
      data: {
        userId: newUser.id, // Use the newly created user's ID
        roleId: role.id,     // Use the found role's ID
        assignedBy: 'system', // Indicate that this was done programmatically
      },
    });

    console.log('Admin user created:', newUser);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
