import Album from '../models/album.model.js';
import Audio from '../models/audio.model.js';
import Artist from '../models/artist.model.js';

export const getAlbums = async (req, res) => {
  try {
    const albums = await Album.find();
    res.json(albums);
  } catch (err) {
    res.status(500).send({message: err.message});
  }
};

export const getSingleAlbum = async (req, res) => {
  try {
    const albumId = req.params.id;
    const album = await Album.findById(albumId);
    res.json(album);
  } catch (err) {
    res.status(500).send({message: err.message});
  }
};

export const editAlbum = async (req, res) => {
  try {
    const albumId = req.params.id;
    const updateData = req.body;

    const album = await Album.findById(albumId);
    if (!album) {
      return res.status(404).send({message: 'Album not found'});
    }

    if (updateData.artist) {
      const artistExists = await Artist.exists({_id: updateData.artist});
      if (!artistExists) {
        return res.status(404).send({message: 'Artist not found'});
      }
    }
    Object.keys(updateData).forEach(key => {
      album[key] = updateData[key];
    });

    await album.save();

    res.send({message: 'Album updated successfully', album});
  } catch (err) {
    res.status(500).send({message: err.message});
  }
};

export const createAlbum = async (req, res) => {
  try {
    const albumData = req.body;
    if (albumData.artist) {
      const artistExists = await Artist.exists({_id: albumData.artist});
      if (!artistExists) {
        return res.status(404).send({message: 'Artist not found'});
      }
    }

    const existingAlbum = await Album.findOne({
      title: albumData.title,
      artist: albumData.artist,
    });

    if (existingAlbum) {
      return res
        .status(409)
        .send({message: 'An album with this title and artist already exists'});
    }

    const newAlbum = new Album(albumData);
    await newAlbum.save();

    res.status(201).send({message: 'Album created successfully', newAlbum});
  } catch (err) {
    res.status(500).send({message: err.message});
  }
};

export const deleteAlbum = async (req, res) => {
  try {
    const albumId = req.params.id;
    const album = await Album.findById(albumId);

    if (!album) {
      return res.status(404).send({message: 'Album not found'});
    }

    const relatedAudios = await Audio.countDocuments({
      'metadata.album': albumId,
    });

    if (relatedAudios > 0) {
      return res.status(400).send({
        message: 'Album cannot be deleted as it still has associated songs.',
      });
    }

    await album.remove();
    res.send({message: 'Album deleted successfully'});
  } catch (err) {
    res.status(500).send({message: err.message});
  }
};
