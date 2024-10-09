// src/middleware/passwordUtils.js
const argon2 = require('argon2');

const hashPassword = async (password) => {
  return await argon2.hash(password);
};

const verifyPassword = async (hashedPassword, plainPassword) => {
  return await argon2.verify(hashedPassword, plainPassword);
};

module.exports = { hashPassword, verifyPassword };
