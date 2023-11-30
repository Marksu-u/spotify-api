import Artist from '../models/artist';

export const listArtists = async (req, res) => {
  const artists = await Artist.find({});
  res.send(artists);
};

export const getArtist = async (req, res) => {
  const artist = await Artist.findById(req.params.id);
  if (!artist) return res.status(404).send('Artist not found');
  res.send(artist);
};

export const createArtist = async (req, res) => {
  const newArtist = new Artist(req.body);
  await newArtist.save();
  res.status(201).send(newArtist);
};

export const updateArtist = async (req, res) => {
  const artist = await Artist.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!artist) return res.status(404).send('Artist not found');
  res.send(artist);
};

export const deleteArtist = async (req, res) => {
  const artist = await Artist.findByIdAndDelete(req.params.id);
  if (!artist) return res.status(404).send('Artist not found');
  res.send(artist);
};
