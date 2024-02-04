import Artist from '../models/artist.model.js';
import Audio from '../models/audio.model.js';
import Album from '../models/album.model.js';

export const getArtists = async (req, res) => {
  try {
    const artists = await Artist.find();
    res.json(artists);
  } catch (err) {
    res.status(500).send({message: err.message});
  }
};

export const getLastArtist = async (req, res) => {
  try {
    const lastArtist = await Artist.findOne().sort({_id: -1});
    res.json(lastArtist);
  } catch (err) {
    res.status(500).send({message: err.message});
  }
};

export const getAllArtists = async (req, res) => {
  try {
    const artists = await Artist.find();
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
    const updateData = {
      _id: req.params.id,
      name: req.body.title,
    };

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
      name: req.body.name,
    };

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

    await Artist.findByIdAndDelete(artistId);
    res.send({message: 'Artist deleted successfully'});
  } catch (err) {
    res.status(500).send({message: err.message});
  }
};
