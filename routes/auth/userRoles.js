import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authorize } from '../../middleware/authorize.js';

const prisma = new PrismaClient();
const roles = express.Router();



// Get all roles
roles.get('/', authorize(['can_manage_roles']), async (req, res) => {
    try {
        const roles = await prisma.roles.findMany();
        res.json(roles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new role
roles.post('/', authorize(['can_manage_roles']), async (req, res) => {
    const role = new Role({
        name: req.body.name
    });

    try {
        const newRole = await prisma.roles.create({
            data: {
            name: req.body.name
            }
        });
        res.status(201).json(newRole);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a role
roles.put('/:id', authorize(['can_manage_roles']), async (req, res) => {
    try {
        const role = await prisma.roles.findUnique({
            where: { id: parseInt(req.params.id) }
        });
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        role.name = req.body.name;
        const updatedRole = await role.save();
        res.json(updatedRole);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a role
roles.delete('/:id', authorize(['can_manage_roles']), async (req, res) => {
    try {
        const role = await prisma.roles.findUnique({
            where: { id: parseInt(req.params.id) }
        });
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        await role.remove();
        res.json({ message: 'Role deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default roles;