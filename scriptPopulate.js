import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Ffmpeg from 'fluent-ffmpeg';
import mm from 'music-metadata';
import Audio from './models/audio.model.js';
import Artist from './models/artist.model.js';
import Album from './models/album.model.js';
import connectToDatabase from './middlewares/mongodb.js';

Ffmpeg.setFfmpegPath('/opt/homebrew/Cellar/ffmpeg/6.0_1/bin/ffmpeg');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const s3 = new AWS.S3();

dotenv.config();
connectToDatabase();

const localDirectory = '../library';
const MAX_FILES = 100;

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory()
        ? walkSync(dirFile, filelist)
        : filelist.concat(dirFile);
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.error('Skipping:', dirFile, ' - Broken symlink');
      } else throw err;
    }
  });
  return filelist;
}

async function processAudioFile(filePath) {
  try {
    const originalname = path.basename(filePath);
    console.log(`Processing file: ${filePath}`);

    try {
      const {common} = await mm.parseFile(filePath);

      const existingAudio = await Audio.findOne({filename: originalname});
      if (existingAudio) {
        console.log(`Audio already exists in the database: ${originalname}`);
        return;
      }

      let outputFilePath = filePath;
      const fileExtension = path.extname(originalname).toLowerCase();

      if (fileExtension !== '.m4a') {
        outputFilePath = `${filePath}.m4a`;
        await new Promise((resolve, reject) => {
          Ffmpeg(filePath)
            .audioCodec('aac')
            .toFormat('ipod')
            .on('end', () => resolve(outputFilePath))
            .on('error', err => {
              console.error('Error during conversion:', err);
              reject(err);
            })
            .save(outputFilePath);
        });
      }

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
                data: fs.readFileSync(
                  path.join(__dirname, './assets/404.jpeg'),
                ),
                format: 'image/jpeg',
              },
          releaseDate: new Date(audioDate),
          genre: audioGenre,
        },
        {upsert: true, new: true},
      );

      const newAudio = new Audio({
        filename: originalname,
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
                data: fs.readFileSync(
                  path.join(__dirname, './assets/404.jpeg'),
                ),
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

      await s3.upload(s3Params).promise();
      console.log(`Uploaded ${originalname} to S3`);

      if (outputFilePath !== filePath) {
        fs.unlinkSync(outputFilePath);
      }
    } catch (error) {
      console.error('Error processing file:', originalname, error);
    }
  } catch (error) {
    console.error('Error processing file:', filePath, error);
  }
}

async function populateDatabaseFromDirectory() {
  try {
    const files = walkSync(localDirectory).slice(0, MAX_FILES);
    console.log(files);
    console.log(MAX_FILES);
    console.log(localDirectory);
    for (const filePath of files) {
      await processAudioFile(filePath);
    }
    console.log('Finished processing files');
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    mongoose.disconnect();
  }
}

populateDatabaseFromDirectory();
