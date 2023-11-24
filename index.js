require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const connexion = require('./database');

const songRoutes = require('./routes/songs');

const app = express();
connexion();
app.use(cors());
app.use(express.json());

app.use('/api/songs/', songRoutes);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Serveur NodeJS sur le port ${port}...`));
