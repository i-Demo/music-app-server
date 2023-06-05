const express = require("express");
const router = express.Router();
const adminMiddleware = require("../app/middleware/adminMiddleware.js");
const authMiddleware = require("../app/middleware/authMiddleware.js");
const SongController = require("../app/controllers/SongController.js");

// @ [POST] api/songs
// access Private
router.post("/", adminMiddleware, SongController.createSong);

// @ [PUT] api/songs/update-song
// access Private
router.put("/update-song/:id", adminMiddleware, SongController.updateSong);

// @ [GET] api/songs/new-song
// access Private
router.get("/new-song", authMiddleware, SongController.newSongs);

// @ [GET] api/songs/liked-songs
// access Private
router.get("/liked-songs", authMiddleware, SongController.likedSongs);

// @ [PUT] api/songs/like-song
// access Private
router.put("/like-song", authMiddleware, SongController.likeSong);


module.exports = router;
