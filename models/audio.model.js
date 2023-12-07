import mongoose from 'mongoose';

const {Schema, model} = mongoose;

const audioSchema = new Schema({
  filename: {type: String, required: true},
  metadata: {
    album: {
      type: Schema.Types.ObjectId,
      ref: 'Album',
    },
    artist: {
      type: Schema.Types.ObjectId,
      ref: 'Artist',
    },
    date: String,
    genre: [String],
    picture: [
      {
        data: Buffer,
        format: String,
      },
    ],
  },
  s3Key: {type: String},
});

export default model('Audio', audioSchema);
