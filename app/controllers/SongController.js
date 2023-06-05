const mongoose = require("mongoose");
const { Song, validate } = require("../models/Song");
const { User } = require("../models/User");
const uploadImage = require("../cloudinary/uploadImage");
const uploadSong = require("../cloudinary/uploadSong");

class SongController {
    // @ [POST] api/songs
    // Create Song
    async createSong(req, res, next) {
        const { error } = validate(req.body);
        if (error) return res.status(400).json({ success: false, message: error.details[0].message });
        const { image, song } = req.body;

        try {
            let newSong = new Song({ _id: new mongoose.Types.ObjectId().toHexString(), ...req.body });
            const [urlImage, urlSong] = await Promise.all([
                uploadImage(image, newSong._id),
                uploadSong(song, newSong._id),
            ]);
            newSong.song = urlSong;
            newSong.image = urlImage;
            await newSong.save();
            return res.status(201).json({ success: true, message: "Create Song Success", song: newSong });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal server error!" });
        }
    }

    // Update song
    async updateSong(req, res, next) {
        try {
            const song = await Song.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
            });
            if (!song) {
                return res.status(404).json({ success: false, message: "Can't not find song" });
            }
            res.status(200).json({ success: true, message: "Updated song successfully", data: song });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal server error!" });
        }
    }

    // Delete song
    async deleteSong(req, res, next) {
        try {
            await Song.findByIdAndDelete(req.params.songId);
            res.status(200).json({ success: true, message: "Song deleted successfully" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal server error!" });
        }
    }

    // [PUT] api/songs/like-song
    // Like song
    async likeSong(req, res, next) {
        try {
            let resMessage = "";
            const data = await Promise.all([User.findById(req.userId), Song.findById(req.body.songId)]);
            if (!data[1]) return res.status(400).send({ success: false, message: "Song does not exist" });
            const index = data[0].likedSongs.findIndex((song) => song.id === data[1]._id);
            if (index === -1) {
                data[0].likedSongs.unshift({ id: data[1]._id, addedAt: Date.now() });
                resMessage = "Added song to your liked songs";
            } else {
                data[0].likedSongs.splice(index, 1);
                resMessage = "Removed song from your liked songs";
            }
            const newUser = await data[0].save();

            res.status(200).json({ success: true, message: resMessage, user: newUser });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal server error!" });
        }
    }

    // [GET] api/songs/liked-songs
    // Liked song
    async likedSongs(req, res, next) {
        try {
            const user = await User.findById(req.userId);
            if (user.likedSongs.length === 0) {
                return res.status(200).json({ success: true, songs: [] });
            }
            const idLikedSongs = user.likedSongs.map((song) => song.id);
            const songsAddedAt = user.likedSongs.map((song) => song.addedAt);
            const songs = await Song.find({ _id: idLikedSongs });
            const likedSongs = user.likedSongs.map((song) => {
                const index = songs.findIndex((songInfo) => songInfo._id === song.id);
                return songs[index];
            });
            res.status(200).send({ success: true, songs: likedSongs, addedAt: songsAddedAt });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal server error!" });
        }
    }

    // [GET] api/songs/new-song
    // Get New Song
    async newSongs(req, res, next) {
        try {
            const { limit, ...condition } = req.query;
            const songs = await Song.find(condition).sort({ createdAt: -1 }).limit(limit);
            res.status(200).send({ success: true, songs: songs });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal server error!" });
        }
    }
}

module.exports = new SongController();
