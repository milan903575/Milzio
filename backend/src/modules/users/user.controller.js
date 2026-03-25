const service = require('./user.service');

async function getAllUsers(req, res) {
  const users = await service.getAllUsers();
  res.status(200).json(users);
}

async function getUser(req, res) {
  const { name, email } = req.user;
  res.status(200).json({
    message: 'Profile fetched',
    name,
    email
  });
}

async function createUser(req, res) {
  const { name, email, password } = req.body;
  await service.createUser(name, email, password);
  res.status(201).json({
    message: 'User created',
    data: {
      name,
      email
    }
  });
}

async function loginUser(req, res) {
  const { email, password } = req.body;
  const token = await service.loginUser(email, password);

  if (!token) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.status(200).json({
    message: 'Login successful',
    token
  });
}

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  loginUser
};
