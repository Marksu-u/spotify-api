const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLenght: 255,
  },
});

module.exports = mongoose.model('Artist', artistSchema);
