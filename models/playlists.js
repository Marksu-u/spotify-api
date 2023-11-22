const mongoose = require("mongoose");

const playlistsSchema = new mongoose.Schema({
	name: { type: String, required: true },
	user: { type: ObjectId, ref: "user", required: true },
	desc: { type: String },
	songs: { type: Array, default: [] },
	img: { type: String },
});

module.exports = { playlistsSchema };