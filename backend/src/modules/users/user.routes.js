const router = require('express').Router();


router.get('/', (req, res) => {
  res.send('All users');
});

router.post('/register', (req, res) => {
  res.json({
    message: 'Hey data recieved.!',
    data: req.body
  });
});



module.exports = router;