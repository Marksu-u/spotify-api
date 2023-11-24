import dotenv from 'dotenv';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import connectToDatabase from './database.js';
import songRoutes from './routes/songs.js';

dotenv.config();
const app = express();

connectToDatabase();
app.use(cors());
app.use(express.json());
app.use('/api/songs/', songRoutes);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Serveur NodeJS sur le port ${port}...`));
