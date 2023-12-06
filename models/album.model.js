import mongoose from 'mongoose';

const {Schema, model} = mongoose;

const albumSchema = new Schema({
  title: {type: String, required: true},
  artist: {
    type: Schema.Types.ObjectId,
    ref: 'Artist',
    required: true,
  },
  releaseDate: Date,
  genre: [String],
});

export default model('Album', albumSchema);
