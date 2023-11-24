import mongoose from 'mongoose';

const {Schema, model} = mongoose;

const albumSchema = new Schema({
  title: {
    type: String,
    required: true,
    maxLenght: 255,
  },
});

const Album = model('Album', albumSchema);

export default Album;
