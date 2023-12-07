import Album from '../models/album.model.js';

export const getAlbums = async (req, res) => {
  try {
    const albums = await Album.find();
    res.json(albums);
  } catch (err) {
    res.status(500).send({message: err.message});
  }
};
