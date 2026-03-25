const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const repository = require('./user.repository');

async function getAllUsers() {
  return await repository.getAllUsers();
}

async function createUser(name, email, password) {
  const hashPassword = await bcrypt.hash(password, 10);
  return await repository.createUser(name, email, hashPassword);
}

async function getUserByEmail(email) {
  return await repository.getUserByEmail(email);
}

async function loginUser(email, password) {
  const user = await repository.getUserByEmail(email);
  if (!user) return null;

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return null;

  const token = jwt.sign({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  },
    process.env.JWT_KEY,
    {
      expiresIn: '1h'
    }
  );

  return token;
}

module.exports = {
  getAllUsers,
  createUser,
  getUserByEmail,
  loginUser
};
