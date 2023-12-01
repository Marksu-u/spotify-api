import Song from '../../models/song/index.js';

export const listSongs = async (req, res) => {
  try {
    const songs = await Song.find({});
    res.send(songs);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getSongs = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).send('Song not found');
    res.send(song);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const createSong = async (req, res) => {
  try {
    const newSong = new Song(req.body);
    await newSong.save();
    res.status(201).send(newSong);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const updateSong = async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!song) return res.status(404).send('Song not found');
    res.send(song);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const deleteSong = async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) return res.status(404).send('Song not found');
    res.send(song);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
