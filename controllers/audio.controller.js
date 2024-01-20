import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import mm from 'music-metadata';
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

Ffmpeg.setFfmpegPath('/opt/homebrew/Cellar/ffmpeg/6.0_1/bin/ffmpeg');

export const getAudios = async (req, res) => {
  try {
    const audios = await Audio.find()
      .populate('metadata.artist', 'name')
      .populate('metadata.album', 'title');
    res.json(audios);
  } catch (err) {
    res.status(500).send({message: err.message});
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
    const audio = await Audio.findById(audioId)
      .populate('metadata.artist', 'name')
      .populate('metadata.album', 'title');
    res.json(audio);
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

    if (updateData.filename) audio.filename = updateData.filename;
    if (updateData.s3Key) audio.s3Key = updateData.s3Key;

    const metadataFields = ['album', 'artist', 'date', 'genre', 'picture'];
    metadataFields.forEach(field => {
      if (updateData[field]) {
        audio.metadata[field] = updateData[field];
      }
    });

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
    const {common} = await mm.parseFile(file.path).then(metadata => metadata);

    const existingAudio = await Audio.findOne({filename: file.originalname});

    if (existingAudio) {
      fs.unlinkSync(file.path);
      res.status(400).json({message: 'Audio already exists in the database'});
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

    const artistName = common.artist || 'Various Artists';
    const albumTitle = common.album || 'Unknown Album';
    const audioGenre = common.genre || 'Unknown Genre';
    const audioDate = common.date || '1900';

    const artist = await Artist.findOneAndUpdate(
      {name: artistName},
      {name: artistName},
      {upsert: true, new: true},
    );

    const album = await Album.findOneAndUpdate(
      {title: albumTitle, artist: artist._id},
      {
        title: albumTitle,
        artist: artist._id,
        picture: common.picture?.length
          ? {
              data: common.picture[0].data,
              format: common.picture[0].format,
            }
          : {
              data: fs.readFileSync(path.join(__dirname, '../assets/404.jpeg')),
              format: 'image/jpeg',
            },
        releaseDate: new Date(audioDate),
        genre: audioGenre,
      },
      {upsert: true, new: true},
    );

    const newAudio = new Audio({
      filename: file.originalname,
      metadata: {
        album: album._id,
        artist: artist._id,
        date: audioDate,
        genre: audioGenre,
        picture: common.picture?.length
          ? {
              data: common.picture[0].data,
              format: common.picture[0].format,
            }
          : {
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
