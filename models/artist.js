import mongoose from 'mongoose';

const {Schema, model} = mongoose;

const artistSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxLenght: 255,
  },
});

const Artist = model('Artist', artistSchema);

export default Artist;
