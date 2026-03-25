const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const logger = require('./src/middleware/logger.middleware');

require('dotenv').config();
require('./src/config/db');
const router = require('./src/router');

const port = process.env.PORT || 3000;

const corsOptions = {
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/MilzioAI')) return next();
  logger[0](req, res, next);
});

app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/MilzioAI')) return next();
  logger[1](req, res, next);
});

app.use('/uploads', express.static(path.resolve('uploads')));
app.use('/api', router);

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
