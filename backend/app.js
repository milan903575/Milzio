const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const logger = require('./src/middleware/logger.middleware');

require('dotenv').config();
require('./src/config/db');
const router = require('./src/router');


const port = process.env.PORT || 3001;


app.use(express.json());

app.use(cors({
  origin: "http://127.0.0.1:5500"
}));

app.use('/api', logger);

app.use("/uploads", express.static(path.resolve("uploads")));

app.use('/api', router);



app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});