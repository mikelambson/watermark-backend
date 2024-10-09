// src/middleware/passwordUtils.js
import argon2 from 'argon2';

const hashPassword = async (password) => {
  return await argon2.hash(password);
};

const verifyPassword = async (hashedPassword, plainPassword) => {
  return await argon2.verify(hashedPassword, plainPassword);
};

export { hashPassword, verifyPassword };
