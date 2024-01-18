import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import Album from '../models/album.model.js';
import Audio from '../models/audio.model.js';
import Artist from '../models/artist.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAlbums = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;

  try {
    const albums = await Album.find()
      .populate('artist', 'name')
      .sort({_id: 1})
      .limit(limit)
      .skip((page - 1) * limit);
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
      picture: albumData.picture?.length
        ? {
            data: albumData.picture[0].data,
            format: albumData.picture[0].format,
          }
        : {
            data: fs.readFileSync(path.join(__dirname, '../assets/404.jpeg')),
            format: 'image/jpeg',
          },
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

    await Album.findByIdAndDelete();
    res.send({message: 'Album deleted successfully'});
  } catch (err) {
    res.status(500).send({message: err.message});
  }
};
