const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 50,
  },
  artist: {
    type: String,
    required: true,
    maxLength: 255,
  },
});

module.exports = mongoose.model('Song', songSchema);
