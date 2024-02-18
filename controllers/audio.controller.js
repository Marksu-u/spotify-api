import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import Ffmpeg from 'fluent-ffmpeg';
import Audio from '../models/audio.model.js';
import Album from '../models/album.model.js';
import Artist from '../models/artist.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const s3 = new AWS.S3();

Ffmpeg.setFfmpegPath('/opt/homebrew/Cellar/ffmpeg/6.1.1_2/bin/ffmpeg');

export const getAudios = async (req, res) => {
  try {
    const albums = await Album.find().select(
      '_id title picture releaseDate artist',
    );
    const albumsWithAudios = await Promise.all(
      albums.map(async album => {
        const artist = await Artist.findById(album.artist);
        const audios = await Audio.find({'metadata.album': album._id}).select(
          'filename metadata.genre',
        );

        return {
          _id: album._id,
          title: album.title,
          picture: album.picture,
          releaseDate: album.releaseDate,
          artistId: artist._id,
          name: artist.name,
          audios: audios.map(audio => ({
            _id: audio._id,
            title: audio.filename,
            genre: audio.metadata.genre,
          })),
        };
      }),
    );
    res.json(albumsWithAudios);
  } catch (err) {
    console.error('Error occurred: ', err.message);
    res.status(500).send({message: err.message});
  }
};

export const getLastAudio = async (req, res) => {
  try {
    const lastAudio = await Audio.findOne().sort({_id: -1});

    if (!lastAudio) {
      return res.status(404).send({message: 'No audio found'});
    }

    const album = await Album.findById(lastAudio.metadata.album).select(
      '_id title picture releaseDate artist',
    );

    if (!album) {
      return res.status(404).send({message: 'Album not found for the audio'});
    }

    const artist = await Artist.findById(album.artist);
    const audioDetail = {
      _id: album._id,
      title: album.title,
      picture: album.picture,
      releaseDate: album.releaseDate,
      artistId: artist._id,
      name: artist.name,
      audios: [
        {
          _id: lastAudio._id,
          title: lastAudio.filename,
          genre: lastAudio.metadata.genre,
        },
      ],
    };

    res.json(audioDetail);
  } catch (error) {
    console.error('Error occurred: ', error.message);
    res.status(500).send({message: error.message});
  }
};

export const getAudiosByArtist = async (req, res) => {
  try {
    const artistId = req.params.id;
    const audios = await Audio.find({'metadata.artist': artistId})
      .populate('metadata.artist', 'name')
      .populate('metadata.album', 'title');

    if (audios.length === 0) {
      return res.status(404).send({message: 'No audios found for this artist'});
    }

    res.json(audios);
  } catch (err) {
    res.status(500).send({message: err.message});
  }
};

export const getAudiosByAlbum = async (req, res) => {
  try {
    const albumId = req.params.id;
    const audios = await Audio.find({'metadata.album': albumId})
      .populate('metadata.artist', 'name')
      .populate('metadata.album', 'title');

    if (audios.length === 0) {
      return res.status(404).send({message: 'No audios found for this album'});
    }

    res.json(audios);
  } catch (err) {
    res.status(500).send({message: err.message});
  }
};

export const getSingleAudio = async (req, res) => {
  try {
    const audioId = req.params.id;
    const singleAudio = await Audio.findById(audioId);

    if (!singleAudio) {
      return res.status(404).send({message: 'No audio found'});
    }

    const album = await Album.findById(singleAudio.metadata.album).select(
      '_id title picture releaseDate artist',
    );

    if (!album) {
      return res.status(404).send({message: 'Album not found for the audio'});
    }

    const artist = await Artist.findById(album.artist);
    const audioDetail = {
      _id: album._id,
      title: album.title,
      picture: album.picture,
      releaseDate: album.releaseDate,
      artistId: artist._id,
      name: artist.name,
      audios: [
        {
          _id: singleAudio._id,
          title: singleAudio.filename,
          genre: singleAudio.metadata.genre,
        },
      ],
    };

    res.json(audioDetail);
  } catch (err) {
    res.status(500).send({message: err.message});
  }
};

export const editAudio = async (req, res) => {
  try {
    const audioId = req.params.id;
    const updateData = req.body;

    const audio = await Audio.findById(audioId);
    if (!audio) {
      return res.status(404).send({message: 'Audio not found'});
    }

    if (updateData.title) {
      audio.filename = updateData.title;
    }

    if (updateData.albumId) {
      audio.metadata.album = updateData.albumId;
    }

    await audio.save();

    res.json({message: 'Audio updated successfully', audio});
  } catch (err) {
    res.status(500).send({message: err.message});
  }
};

export const deleteAudio = async (req, res) => {
  try {
    const audioId = req.params.id;
    const audio = await Audio.findById(audioId);

    if (!audio) {
      return res.status(404).send({message: 'Audio not found'});
    }

    const s3Params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: audio.s3Key,
    };

    try {
      await s3.deleteObject(s3Params).promise();
    } catch (s3Error) {
      console.error('Error deleting object in S3:', s3Error);
    }

    await Audio.findByIdAndDelete(audioId);

    res.send({message: 'Audio and corresponding S3 file deleted successfully'});
  } catch (err) {
    res.status(500).send({message: err.message});
  }
};

export const uploadAudio = async (req, res) => {
  try {
    const file = req.file;
    console.log(file.path);
    const audioFilename = req.body.title;
    const albumID = req.body.albumId;

    const existingAudio = await Audio.findOne({filename: audioFilename});

    if (existingAudio) {
      fs.unlinkSync(file.path);
      res.status(400).json({message: 'Audio already exists in the database'});
      return;
    }

    const album = await Album.findById(albumID);
    if (!album) {
      fs.unlinkSync(file.path);
      res.status(404).json({message: 'Album not found'});
      return;
    }

    const outputFilePath = `${file.path}.m4a`;
    await new Promise((resolve, reject) => {
      Ffmpeg(file.path)
        .audioCodec('aac')
        .toFormat('ipod')
        .on('end', resolve)
        .on('error', err => {
          console.error('Error during conversion:', err);
          reject(err);
        })
        .save(outputFilePath);
    });

    const artist = await Artist.findById(album.artist);

    const newAudio = new Audio({
      filename: audioFilename,
      metadata: {
        album: album._id,
        artist: artist._id,
        date: album.releaseDate,
        genre: album.genre,
        picture: album.picture || {
          data: fs.readFileSync(path.join(__dirname, '../assets/404.jpeg')),
          format: 'image/jpeg',
        },
      },
    });
    await newAudio.save();

    const s3Key = `audio-files/${newAudio._id}.m4a`;
    newAudio.s3Key = s3Key;
    await newAudio.save();

    const s3Params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
      Body: fs.createReadStream(outputFilePath),
    };

    const s3Upload = await s3.upload(s3Params).promise();
    fs.unlinkSync(file.path);
    fs.unlinkSync(outputFilePath);

    res.json({
      message: 'File uploaded successfully',
      audioDetails: newAudio,
      s3Url: s3Upload.Location,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error processing file');
  }
};

export const streamAudio = async (req, res) => {
  try {
    const audioId = req.params.id;
    const audio = await Audio.findById(audioId);

    if (!audio) {
      return res.status(404).send({message: 'Audio not found'});
    }

    audio.streamed += 1;
    await audio.save();

    const s3Params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: audio.s3Key,
    };

    const headData = await s3.headObject(s3Params).promise();
    const fileSize = headData.ContentLength;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunksize = end - start + 1;
      const fileStream = s3
        .getObject({...s3Params, Range: `bytes=${start}-${end}`})
        .createReadStream();

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'audio/mpeg',
      });

      fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
      });

      s3.getObject(s3Params).createReadStream().pipe(res);
    }
  } catch (err) {
    console.error('Error in streaming audio:', err);
    res.status(500).send({message: 'Error in streaming audio'});
  }
};

export const getStreamingCount = async (req, res) => {
  try {
    const audioId = req.params.id;
    const audio = await Audio.findById(audioId);

    if (!audio) {
      return res.status(404).send({message: 'Audio not found'});
    }
    res.json(audio.streamed);
  } catch (err) {
    console.error('Error while getting streamed amount:', err);
    res.status(500).send({message: 'Error while getting streamed amount'});
  }
};
