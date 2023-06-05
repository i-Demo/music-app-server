const express = require("express");
const router = express.Router();
const authMiddleware = require("../app/middleware/authMiddleware.js");
const PlaylistController = require("../app/controllers/PlaylistController.js");

// @ [POST] api/playlists
// access Private
router.post("/", authMiddleware, PlaylistController.createPlaylist);

// @ [GET] api/playlists
// access Private
router.get("/", authMiddleware, PlaylistController.getPlaylists);

// @ [GET] api/playlists
// access Private
router.get("/random", authMiddleware, PlaylistController.getRandomPlaylists);

// @ [GET] api/playlists/:id
// access Private
router.get("/:id", authMiddleware, PlaylistController.getPlaylist);

// @ [PUT] api/playlists/user-update
// access Private
router.put("/user-update", authMiddleware, PlaylistController.userUpdate);

// @ [PUT] api/playlists/toggle-public/:id
// access Private
router.put("/toggle-public/:id", authMiddleware, PlaylistController.togglePublic);

// @ [PUT] api/playlists/toggle-playlist/:id
// access Private
router.put("/toggle-playlist/:id", authMiddleware, PlaylistController.togglePlaylist);

// @ [PUT] api/playlists/add-song
// access Private
router.put("/add-song", authMiddleware, PlaylistController.addSong);

// @ [PUT] api/playlists/remove-song
// access Private
router.put("/remove-song", authMiddleware, PlaylistController.removeSong);

// @ [PUT] api/playlists/toggle-song
// access Private
router.put("/edit/:id", authMiddleware, PlaylistController.editPlaylist);

// @ [DELETE] api/playlists/:id
// access Private
router.delete("/:id", authMiddleware, PlaylistController.deletePlaylist);

// @ [GET] api/playlists/get-by-type/:type
// access Private
router.get("/get-by-type/:type", authMiddleware, PlaylistController.getPlaylistsByType);

module.exports = router;
