import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import connectToDatabase from './middlewares/mongodb.js';

import s3Routes from './router/s3.routes.js';
import audioRoutes from './router/audio.routes.js';
import artistRoutes from './router/artist.routes.js';
import albumRoutes from './router/album.routes.js';
import adminRoutes from './router/admin.routes.js';

dotenv.config();
connectToDatabase();

const app = express();

const allowedOrigins = [
  'https://marksu-u.github.io/spotify-back/',
  'https://marksu-u.github.io/spotify-front/',
];

const corsOptions = (req, callback) => {
  let corsOptions;
  if (allowedOrigins.includes(req.header('Origin'))) {
    corsOptions = {origin: true};
  } else {
    corsOptions = {origin: false};
  }
  callback(null, corsOptions);
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/aws', s3Routes);
app.use('/api/audio', audioRoutes);
app.use('/api/artist', artistRoutes);
app.use('/api/album', albumRoutes);
app.use('/api/admin', adminRoutes);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Serveur NodeJS sur le port ${port}...`));
