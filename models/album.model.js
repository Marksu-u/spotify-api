import mongoose from 'mongoose';

const {Schema, model} = mongoose;

const albumSchema = new Schema({
  title: {type: String, required: true},
  artist: {
    type: Schema.Types.ObjectId,
    ref: 'Artist',
    required: true,
  },
  picture: [
    {
      data: Buffer,
      format: String,
    },
  ],
  releaseDate: Date,
  genre: String,
});

export default model('Album', albumSchema);
