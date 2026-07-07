import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userRepository from './user.repository.js';
import AppError from '../../utils/app.error.js';

async function getAllUsers() {
  return await userRepository.getAllUsers();
}

async function createUser(name, email, password) {
  const existingUser = await userRepository.getUserByEmail(email);
  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  const hashPassword = await bcrypt.hash(password, 10);
  return await userRepository.createUser(name, email, hashPassword);
}

async function getUserByEmail(email) {
  return await userRepository.getUserByEmail(email);
}

async function loginUser(email, password) {
  const user = await userRepository.getUserByEmail(email);
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    process.env.JWT_KEY,
    { expiresIn: '1h' }
  );

  return token;
}

const userService = {
  getAllUsers,
  createUser,
  getUserByEmail,
  loginUser
};

export default userService;