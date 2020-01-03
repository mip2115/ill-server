const mongoose = require("mongoose");
const SongSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // user who uploaded song
    ref: "user", // ref to user model
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  length: {
    type: String,
    required: true,
  },
  date_created: {
    type: Date,
    default: Date.now,
  },
  audio_link: {
    type: String,
    required: true,
  },
  event: {
    // which event did this song take part of
    type: String,
    required: true,
  },
});

module.exports = Song = mongoose.model("song", SongSchema);
