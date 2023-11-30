import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import AWS from 'aws-sdk';
import mongoose from 'mongoose';
import redis from 'redis';
import 'express-async-errors';

import artistRouter from './router/artistRouter';
import songRouter from './router/songRouter';
import albumRouter from './router/albumRouter';

dotenv.config();

// AWS Configuration
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// MongoDB setup
mongoose
  .connect(
    process.env.MONGODB_URI || 'mongodb://localhost:27017/my-audio-api',
    {useNewUrlParser: true, useUnifiedTopology: true},
  )
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const redisClient = redis.createClient();
redisClient.on('error', err => console.log('Redis error:', err));

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/artists', artistRouter);
app.use('/api/songs', songRouter);
app.use('/api/albums', albumRouter);

// Middleware for S3 bucket connection
app.use(async (req, res, next) => {
  try {
    const s3 = new AWS.S3();
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
    };
    await s3.headBucket(params).promise();
    console.log('Connexion réussie au bucket S3 !');
    next();
  } catch (error) {
    console.error('Erreur de connexion au bucket S3 :', error);
    res.status(500).send('Erreur de connexion au bucket S3');
  }
});

// Basic CRUD routes (placeholders)
app.get('/artists', (req, res) => res.send('List of artists'));
app.post('/artists', (req, res) => res.send('Add an artist'));

// toute de test
app.get('/', (req, res) => {
  res.send('Bonjour ! Ceci est une route de test.');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('ça marche pas sale zig');
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Serveur NodeJS sur le port ${port}...`));
