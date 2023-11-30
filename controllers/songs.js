import Song from '../models/song';

export const listSongs = async (req, res) => {
  const songs = await Song.find({});
  res.send(songs);
};

export const getSongs = async (req, res) => {
  const song = await Song.findById(req.params.id);
  if (!song) return res.status(404).send('Song not found');
  res.send(song);
};

export const createSong = async (req, res) => {
  const newSong = new Song(req.body);
  await newSong.save();
  res.status(201).send(newSong);
};

export const updateSong = async (req, res) => {
  const song = await Song.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!song) return res.status(404).send('Song not found');
  res.send(song);
};

export const deleteSong = async (req, res) => {
  const song = await Song.findByIdAndDelete(req.params.id);
  if (!song) return res.status(404).send('Song not found');
  res.send(song);
};
