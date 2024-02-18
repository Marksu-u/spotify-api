import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import Album from '../models/album.model.js';
import Audio from '../models/audio.model.js';
import Artist from '../models/artist.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAlbums = async (req, res) => {
  try {
    const albums = await Album.find().select(
      '_id title picture releaseDate genre artist',
    );

    const albumsWithArtist = await Promise.all(
      albums.map(async album => {
        const artist = await Artist.findById(album.artist).select('_id name');

        return {
          _id: album._id,
          title: album.title,
          picture: album.picture,
          releaseDate: album.releaseDate,
          genre: album.genre,
          artist: {
            _id: artist._id,
            name: artist.name,
          },
        };
      }),
    );

    res.json(albumsWithArtist);
  } catch (err) {
    console.error('Error occurred: ', err.message);
    res.status(500).send({message: err.message});
  }
};

export const getLastAlbum = async (req, res) => {
  try {
    const lastAlbum = await Album.findOne()
      .sort({_id: -1})
      .select('_id title picture releaseDate genre artist');

    if (!lastAlbum) {
      return res.status(404).send({message: 'No albums found'});
    }

    const artist = await Artist.findById(lastAlbum.artist).select('_id name');
    const albumDetail = {
      _id: lastAlbum._id,
      title: lastAlbum.title,
      picture: lastAlbum.picture,
      releaseDate: lastAlbum.releaseDate,
      genre: lastAlbum.genre,
      artist: {
        _id: artist._id,
        name: artist.name,
      },
    };

    res.json(albumDetail);
  } catch (err) {
    console.error('Error occurred: ', err.message);
    res.status(500).send({message: err.message});
  }
};

export const getSingleAlbum = async (req, res) => {
  try {
    const albumId = req.params.id;
    const album = await Album.findById(albumId);
    if (!album) {
      return res.status(404).send({message: 'Album not found'});
    }

    const artist = await Artist.findById(album.artist).select('_id name');
    if (!artist) {
      return res.status(404).send({message: 'Artist not found'});
    }

    const albumDetail = {
      _id: album._id,
      title: album.title,
      picture: album.picture,
      releaseDate: album.releaseDate,
      genre: album.genre,
      artist: {
        _id: artist._id,
        name: artist.name,
      },
    };

    res.json(albumDetail);
  } catch (err) {
    console.error('Error occurred: ', err.message);
    res.status(500).send({message: err.message});
  }
};

export const editAlbum = async (req, res) => {
  try {
    const albumId = req.params.id;
    const updateData = req.body;
    const album = await Album.findById(albumId);
    if (!album) {
      return res.status(404).json({message: 'Album not found'});
    }

    if (updateData.title) {
      album.title = updateData.title;
    }
    if (updateData.artistId) {
      album.artist = updateData.artistId;
    }
    if (updateData.releaseDate) {
      album.releaseDate = updateData.releaseDate;
    }
    if (updateData.genre) {
      album.genre = updateData.genre;
    }

    if (req.file) {
      const newPictureData = {
        data: fs.readFileSync(req.file.path),
        contentType: req.file.mimetype,
      };
      album.picture = newPictureData;
    }

    await album.save();

    res.json({message: 'Album updated successfully', album});
  } catch (err) {
    res.status(500).json({message: err.message});
  }
};

export const createAlbum = async (req, res) => {
  try {
    const {title, genre, artistId, releaseDate} = req.body;

    const pictureData = req.file
      ? {
          data: fs.readFileSync(req.file.path),
          format: req.file.mimetype,
        }
      : {
          data: fs.readFileSync(path.join(__dirname, '../assets/404.jpeg')),
          format: 'image/jpeg',
        };

    console.log(artistId);

    const newAlbum = new Album({
      title,
      genre,
      artist: artistId,
      picture: [pictureData],
      releaseDate,
    });

    await newAlbum.save();
    res
      .status(201)
      .send({message: 'Album created successfully', album: newAlbum});
  } catch (err) {
    console.error(err);
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

    await Album.findByIdAndDelete(albumId);
    res.send({message: 'Album deleted successfully'});
  } catch (err) {
    res.status(500).send({message: err.message});
  }
};
