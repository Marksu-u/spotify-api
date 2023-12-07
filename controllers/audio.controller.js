import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import mm from 'music-metadata';
import fs from 'fs';
import Ffmpeg from 'fluent-ffmpeg';
import Audio from '../models/audio.model.js';
import Album from '../models/album.model.js';
import Artist from '../models/artist.model.js';

dotenv.config();
const s3 = new AWS.S3();

Ffmpeg.setFfmpegPath('/opt/homebrew/Cellar/ffmpeg/6.0_1/bin/ffmpeg');

export const getAudios = async (req, res) => {
  try {
    const audios = await Audio.find();
    res.json(audios);
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
    await s3.deleteObject(s3Params).promise();

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

    const outputFilePath = `${file.path}.m4a`;
    await new Promise((resolve, reject) => {
      Ffmpeg(file.path)
        .toFormat('m4a')
        .on('end', resolve)
        .on('error', reject)
        .save(outputFilePath);
    });

    const artistName = common.artist || 'Various Artists';
    const albumTitle = common.album || 'Unknown Album';
    const audioGenre = common.genre || 'Unknown Genre';
    const audioDate = common.date || '2023';

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
          : undefined,
      },
    });
    await newAudio.save();

    const s3Key = `audio-files/${newAudio._id}`;
    newAudio.s3Key = s3Key;
    await newAudio.save();

    const s3Params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `audio-files/${newAudio._id}.m4a`,
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
  } catch (err) {
    res.status(500).send({message: err.message});
  }
};
