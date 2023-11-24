const router = require('express').Router();

const {Song} = require('../models/song');

// Get all songs
router.get('/', async (req, res) => {
  const songs = await Song.find();
  res.status(200).send({data: songs});
});

module.exports = router;
