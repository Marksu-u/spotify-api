import mongoose from 'mongoose';

const artistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

const Artist = mongoose.model('Artist', artistSchema);

export default Artist;
