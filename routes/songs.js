import express from 'express';

import Song from '../models/song.js';
const router = express.Router();

// Get all songs
router.get('/', async (req, res) => {
  const songs = await Song.find();
  res.status(200).send({data: songs});
});

export default router;
