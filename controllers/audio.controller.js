import AWS from 'aws-sdk';
import mm from 'music-metadata';
import fs from 'fs';
import Audio from '../models/audio.model.js';
import Album from '../models/album.model.js';
import Artist from '../models/artist.model.js';

const s3 = new AWS.S3();

export const getAudios = async (req, res) => {
  try {
    const audios = await Audio.find();
    res.json(audios);
  } catch (err) {
    res.status(500).send({message: err.message});
  }
};

export const uploadAudio = async (req, res) => {
  try {
    const file = req.file;
    const {common} = await mm.parseFile(file.path).then(metadata => metadata);

    // Find or create the artist
    const artist = await Artist.findOneAndUpdate(
      {name: common.artist},
      {name: common.artist},
      {upsert: true, new: true},
    );

    // Find or create the album with a reference to the artist
    const album = await Album.findOneAndUpdate(
      {title: common.album, artist: artist._id},
      {
        title: common.album,
        artist: artist._id,
        releaseDate: new Date(common.date),
        genre: common.genre,
      },
      {upsert: true, new: true},
    );

    // Create a new Audio document
    const newAudio = new Audio({
      filename: file.originalname,
      metadata: {
        album: album._id,
        artist: artist._id,
        date: common.date,
        genre: common.genre,
        picture: common.picture?.length
          ? {
              data: common.picture[0].data,
              format: common.picture[0].format,
            }
          : undefined,
      },
    });
    await newAudio.save();

    // Upload vers AWS
    const s3Params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `audio-files/${newAudio._id}-${file.originalname}`,
      Body: fs.createReadStream(file.path),
    };

    const s3Upload = await s3.upload(s3Params).promise();

    // On supprime le fichier local après traitement
    fs.unlinkSync(file.path);

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
