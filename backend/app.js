import express from 'express';
import cors from 'cors';
import path from 'path';
import logger from './src/middleware/logger.middleware.js';
import router from './src/router.js';
import 'dotenv/config';
import './src/config/db.js';

const app = express();

const port = process.env.PORT;

const corsOptions = {
  origin: [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    process.env.FRONTEND_URL
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());


app.use('/api', logger.consoleLogger, logger.fileLogger);
app.use('/uploads', express.static(path.resolve('uploads')));
app.use('/api', router);

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
