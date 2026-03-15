const express = require('express');
const app = express();
require('dotenv').config();
const router = require('./src/router.js');


const port = process.env.PORT || 3001;

app.use(express.json());
app.use(router);



app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});