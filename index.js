import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import redis from 'redis';
import 'express-async-errors';
import connectToDatabase from './middlewares/mongodb.js';

import s3Routes from './router/s3.routes.js';
import audioRoutes from './router/audio.routes.js';
import artistRoutes from './router/artist.routes.js';
import albumRoutes from './router/album.routes.js';
import adminRoutes from './router/admin.routes.js';

dotenv.config();
connectToDatabase();

// Redis
const redisClient = redis.createClient();
redisClient.on('error', err => console.log('Redis error:', err));

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/aws', s3Routes);
app.use('/api/audio', audioRoutes);
app.use('/api/artist', artistRoutes);
app.use('/api/album', albumRoutes);
app.use('/api/admin', adminRoutes);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Serveur NodeJS sur le port ${port}...`));
