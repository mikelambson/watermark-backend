// routes/auth/authRoutes.js
import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { login, logout } from '../../controllers/authController.js';
import manage from './userManagement.js';

const auth = express.Router();

// Define authentication routes
auth.post('/login', login);
// auth.post('/logout', authenticate, logout);
auth.post('/logout', logout);
auth.use('/manage', manage)

// Export the auth router
export default auth;
