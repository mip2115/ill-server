const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Song = require("../../models/Song");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator/check");

// @route   GET api/songs/me
// @desc    Get current songs by user
// access   Private
router.get("/me", auth, async (req, res) => {
  try {
    // show me MY songs
    // so remember that in auth, we take in the req and we set the user id to the decoded
    // id, so we've got it here.
    // just match the song to the user id
    const songs = await Song.find({ user: req.user.id });

    if (!songs) {
      return res.status(400).json({ msg: "No songs for this user" });
    }
    if (songs.length == 0) return res.json({ msg: "No songs found" });
    else res.json(songs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   POST api/songs
// @desc    Create or update a song
// access   Private
router.post(
  "/",
  [
    auth,
    [
      check("name", "Name is required")
        .not()
        .isEmpty(),
      check("audio_link", "Audio link is required")
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;

    // build the object up
    const songFields = {};

    songFields.user = req.user.id;
    songFields.name = name;
    songFields.audio_link = "text_link";
    songFields.event = "test_event";
    songFields.length = "test_length";

    try {
      const song = new Song(songFields);
      await song.save();
      res.json(song);
    } catch (err) {
      console.err(err.message);
      res.status(500).send("server error");
    }
  }
);

// @route   GET api/songs
// @desc    Get all songs
// access   Public
router.get("/", async (req, res) => {
  try {
    // populate from user collection and give me the corresponding names.
    // so originally 'user' was pointing towards user id.
    // i think it just replaced that field with every field listed belonging to user
    const songs = await Song.find().populate("user", ["name"]);
    res.json(songs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/songs/user/:user_id
// @desc    Get all songs by a specific user id
// access   Public
router.get("/user/:user_id", async (req, res) => {
  try {
    // what I would actually do here is put it through some middleware and find
    // which
    const songs = await Song.find({ user: req.params.user_id });
    if (songs.length == 0) res.json({ msg: "No songs for this user" });
    else res.json(songs);
  } catch (err) {
    console.error(err.message);
    // console.dir(err);
    if (err.kind == "ObjectId") res.json({ msg: "The user is not valid" });
    res.status(500).send("Server error");
  }
});

// @route   DELETE api/songs
// @desc    Delete ALL user and songs (the logged in user)
// access   Private

// TODO – Make sure to delete the user too
router.delete("/:song_id", auth, async (req, res) => {
  try {
    const song = await Song.findById({ _id: req.params.song_id });
    if (req.user.id != song.user) {
      return res.json({ msg: "You do not own this song" });
    }
    await Song.findOneAndRemove({ _id: req.params.song_id });
    res.json({ msg: "Deleted sucesfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
