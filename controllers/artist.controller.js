import Artist from '../models/artist.model.js';
import Audio from '../models/audio.model.js';
import Album from '../models/album.model.js';

export const getArtists = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 16;

  try {
    const artists = await Artist.find()
      .sort({_id: 1})
      .limit(limit)
      .skip((page - 1) * limit);
    res.json(artists);
  } catch (err) {
    res.status(500).send({message: err.message});
  }
};

export const getSingleArtist = async (req, res) => {
  try {
    const artistId = req.params.id;
    const artist = await Artist.findById(artistId);

    if (!artist) {
      return res.status(404).send({message: 'Artist not found'});
    }

    res.json(artist);
  } catch (err) {
    res.status(500).send({message: err.message});
  }
};

export const editArtist = async (req, res) => {
  try {
    const artistId = req.params.id;
    const updateData = req.body;

    const artist = await Artist.findById(artistId);
    if (!artist) {
      return res.status(404).send({message: 'Artist not found'});
    }

    Object.keys(updateData).forEach(key => {
      artist[key] = updateData[key];
    });

    await artist.save();
    res.send({message: 'Artist updated successfully', artist});
  } catch (err) {
    res.status(500).send({message: err.message});
  }
};

export const createArtist = async (req, res) => {
  try {
    const artistData = {
      name: req.body.title,
    };
    console.log(artistData);

    const existingArtist = await Artist.findOne({name: artistData.name});
    if (existingArtist) {
      return res
        .status(409)
        .send({message: 'An artist with this name already exists'});
    }

    const newArtist = new Artist(artistData);
    await newArtist.save();

    res.status(201).send({message: 'Artist created successfully', newArtist});
  } catch (err) {
    res.status(500).send({message: err.message});
  }
};

export const deleteArtist = async (req, res) => {
  try {
    const artistId = req.params.id;
    const artist = await Artist.findById(artistId);

    if (!artist) {
      return res.status(404).send({message: 'Artist not found'});
    }

    const relatedAlbums = await Album.countDocuments({artist: artistId});
    const relatedAudios = await Audio.countDocuments({
      'metadata.artist': artistId,
    });

    if (relatedAlbums > 0 || relatedAudios > 0) {
      return res.status(400).send({
        message:
          'Artist cannot be deleted as they still have associated albums or songs.',
      });
    }

    await artist.remove();
    res.send({message: 'Artist deleted successfully'});
  } catch (err) {
    res.status(500).send({message: err.message});
  }
};
