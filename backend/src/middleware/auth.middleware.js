const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({
      message: 'No Token Provided'
    });
  }

  try {
    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.user = decoded;

    next();

  }
  catch (err) {
    return res.status(401).json({
      message: 'Invalid Token or Token is Expired'
    });
  }
}

module.exports = { authMiddleware };