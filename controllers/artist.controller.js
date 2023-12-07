import Artist from '../models/artist.model.js';

export const getArtists = async (req, res) => {
  try {
    const artists = await Artist.find();
    res.json(artists);
  } catch (err) {
    res.status(500).send({message: err.message});
  }
};
