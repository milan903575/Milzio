const repository = require('./user.repository');

async function getAllUsers() {
  return await repository.getAllUsers();
}

async function createUser(name, email, password) {
  return await repository.createUser(name, email, password);
}

async function getUserByEmail(email) {
  return await repository.getUserByEmail(email);
}

module.exports = {
  getAllUsers,
  createUser,
  getUserByEmail
};