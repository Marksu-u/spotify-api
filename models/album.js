const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxLenght: 255,
  },
});

module.exports = mongoose.model('Album', albumSchema);
