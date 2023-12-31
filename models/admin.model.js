import mongoose from 'mongoose';

const {Schema, model} = mongoose;

const adminUserSchema = new Schema({
  username: {type: String, required: true},
  email: {type: String, required: true},
  password: {type: String, required: true},
});

export default model('Admin', adminUserSchema);
