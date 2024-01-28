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

export const getAlbumWithAudios = async (req, res) => {
  const albumId = req.params.id;
  try {
    const albums = await Album.findById(albumId)
      .populate('artist', 'name')
      .populate('audio', 'title');
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
    const {title, artist, releaseDate, genre} = req.body;

    const album = await Album.findById(albumId);
    if (!album) {
      return res.status(404).send({message: 'Album not found'});
    }

    album.title = title;
    album.artist = artist;
    album.releaseDate = releaseDate;
    album.genre = JSON.parse(genre);

    if (req.file) {
      const newPictureData = {
        data: fs.readFileSync(req.file.path),
        format: req.file.mimetype,
      };
      album.picture = [newPictureData];
    }

    await album.save();
    res.status(200).send({message: 'Album updated successfully', album});
  } catch (err) {
    res.status(500).send({message: err.message});
  }
};

export const createAlbum = async (req, res) => {
  try {
    const {title, genre, artist, releaseDate} = req.body;
    const genreArray = JSON.parse(genre);
    console.log(artist);

    const pictureData = req.file
      ? {
          data: fs.readFileSync(req.file.path),
          format: req.file.mimetype,
        }
      : {
          data: fs.readFileSync(path.join(__dirname, '../assets/404.jpeg')),
          format: 'image/jpeg',
        };

    const newAlbum = new Album({
      title,
      genre: genreArray,
      artist,
      picture: [pictureData],
      releaseDate,
    });

    console.log(newAlbum);

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

    await Album.findByIdAndDelete(albumId);
    res.send({message: 'Album deleted successfully'});
  } catch (err) {
    res.status(500).send({message: err.message});
  }
};
