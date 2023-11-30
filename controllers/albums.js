import Album from '../models/album';

export const listAlbums = async (req, res) => {
  const albums = await Album.find({});
  res.send(albums);
};

export const getAlbums = async (req, res) => {
  const song = await Album.findById(req.params.id);
  if (!song) return res.status(404).send('Album not found');
  res.send(song);
};

export const createAlbum = async (req, res) => {
  const newAlbum = new Album(req.body);
  await newAlbum.save();
  res.status(201).send(newAlbum);
};

export const updateAlbum = async (req, res) => {
  const album = await Album.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!album) return res.status(404).send('Album not found');
  res.send(album);
};

export const deleteAlbum = async (req, res) => {
  const album = await Album.findByIdAndDelete(req.params.id);
  if (!album) return res.status(404).send('Album not found');
  res.send(album);
};
