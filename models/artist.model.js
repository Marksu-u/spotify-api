import mongoose from 'mongoose';

const {Schema, model} = mongoose;

const artistSchema = new Schema({
  name: {type: String, required: true},
});

export default model('Artist', artistSchema);
