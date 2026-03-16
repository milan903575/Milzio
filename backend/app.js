const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
require('./src/config/db');
const router = require('./src/router');


const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors({
  origin: "http://127.0.0.1:5500"
}));
app.use(router);



app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});