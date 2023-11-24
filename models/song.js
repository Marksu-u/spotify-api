import mongoose from 'mongoose';

const {Schema, model} = mongoose;

const songSchema = new Schema({
  title: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 50,
  },
  artist: {
    type: String,
    required: true,
    maxLength: 255,
  },
});

const Song = model('Song', songSchema);

export default Song;
