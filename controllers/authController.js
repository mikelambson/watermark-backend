// src/controllers/authController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { hashPassword, verifyPassword } = require('../middleware/passwordUtils');

const login = async (req, res) => {
  const { login, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email: login } });
  
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
  await prisma.activeSession.create({
    data: {
      userId: user.id,
      sessionId,
    }
  });

  res.cookie('sessionId', sessionId, { httpOnly: true });

  res.json({
    id: user.id,
    login: user.login,
    firstName: user.firstName,
    lastName: user.lastName,
  });
};

const logout = async (req, res) => {
  await prisma.activeSession.deleteMany({
    where: { userId: req.user.id }
  });
  res.clearCookie('sessionId');
  res.send("Logged out");
};

module.exports = { login, logout };
