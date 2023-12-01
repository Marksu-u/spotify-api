import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import redis from 'redis';
import 'express-async-errors';
import connectToDatabase from './middlewares/mongodb.js';

import s3Router from './router/s3Router.js';

dotenv.config();

// MongoDB setup
connectToDatabase();

// Redis
const redisClient = redis.createClient();
redisClient.on('error', err => console.log('Redis error:', err));

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/aws', s3Router);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Serveur NodeJS sur le port ${port}...`));
