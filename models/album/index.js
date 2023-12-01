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
  date: {
    type: String,
  },
  genre: [String],
  image: {
    data: Buffer,
    contentType: String, // type of the image (e.g., 'image/jpeg')
  },
});

const Album = mongoose.model('Album', albumSchema);

export default Album;
