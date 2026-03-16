const service = require('./user.service');

async function getAllUsers(req, res) {
  const users = await service.getAllUsers();
  res.status(200).json(users);
}

async function createUser(req, res) {
  const { name, email, password } = req.body;
  const user = await service.createUser(name, email, password);
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
  if (user.password !== password) {
    return res.status(401).json({
      message: 'Invalid Credentials'
    });
  }

  res.status(200).json({
    message: 'Login successfull'
  });
}

module.exports = {
  getAllUsers,
  createUser,
  loginUser
};