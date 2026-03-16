function authorize(role) {
  return (req, res, next) => {
    if (req.user.role != role) {
      return res.status(403).json({
        message: 'You Dont Have Access'
      });
    }
    next();
  }
}

module.exports = { authorize };