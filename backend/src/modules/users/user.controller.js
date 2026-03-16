const { response } = require('express');
const service = require('./user.service');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

async function getAllUsers(req, res) {
  const users = await service.getAllUsers();
  res.status(200).json(users);
}

async function createUser(req, res) {
  const { name, email, password } = req.body;
  const hashPassword = await bcrypt.hash(password, 10);

  const user = await service.createUser(name, email, hashPassword);
  res.status(201).json({
    message: 'User Craeted',
    data: {
      name,
      email
    }
  });
}

async function loginUser(req, res) {
  const { email, password } = req.body;
  const user = await service.getUserByEmail(email);

  // user not found
  if (!user) {
    return res.status(401).json({
      message: 'Invalid Credentials'
    });
  }

  // password not match
  const validPassword = bcrypt.compare(password, user.password)
  if (!validPassword) {
    return res.status(401).json({
      message: 'Invalid Credentials'
    });
  }

  try {
    const token = jwt.sign({
      id: user.id,
      email: user.email
    },
      process.env.JWT_KEY,
      {
        expiresIn: '1h'
      });
    return res.status(200).json({
      message: 'Login successfull',
      token
    });
  }
  catch (err) {
    return res.status(500).json({
      message: 'Server Error'
    });
  }

}

module.exports = {
  getAllUsers,
  createUser,
  loginUser
};