import userService from './user.service.js';
import { sendSuccess } from '../../utils/response.helper.js';

async function getAllUsers(req, res, next) {
  try {
    const users = await userService.getAllUsers();
    sendSuccess(res, 200, 'Users fetched', users);
  } catch (err) {
    next(err);
  }
}

async function getUser(req, res, next) {
  try {
    const { name, email } = req.user;
    sendSuccess(res, 200, 'Profile fetched', { name, email });
  } catch (err) {
    next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const { name, email, password } = req.body;
    await userService.createUser(name, email, password);
    sendSuccess(res, 201, 'User created', { name, email });
  } catch (err) {
    next(err);
  }
}

async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;
    const token = await userService.loginUser(email, password);
    sendSuccess(res, 200, 'Login successful', { token });
  } catch (err) {
    next(err);
  }
}

const userController = {
  getAllUsers,
  getUser,
  createUser,
  loginUser
};

export default userController;