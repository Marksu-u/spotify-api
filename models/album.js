import mongoose from 'mongoose';

const albumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: true,
  },
  releaseDate: Date,
  coverImage: String,
});

const Album = mongoose.model('Album', albumSchema);

export default Album;
