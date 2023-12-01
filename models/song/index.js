import mongoose from 'mongoose';

const trackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album',
    required: true,
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: true,
  },
  genre: [String],
  date: String,
  image: {
    data: Buffer,
    contentType: String, // type of the image (e.g., 'image/jpeg')
  },
  s3Key: {
    type: String,
    required: true,
  },
});

const Track = mongoose.model('Track', trackSchema);

export default Track;
