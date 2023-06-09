const mongoose = require("mongoose");
const { Playlist, validate } = require("../models/Playlist");
const { User } = require("../models/User");
const { Song } = require("../models/Song");
const joi = require("joi");
const uploadImage = require("../cloudinary/uploadImage");

// const uploadSong = require("../cloudinary/uploadSong");

class PlaylistController {
    // @ [POST] api/playlists
    // Create Playlist
    async createPlaylist(req, res, next) {
        try {
            const user = await User.findById(req.userId).select("-password -__v -updatedAt");
            if (user.isAdmin) {
                const { error } = validate(req.body);
                if (error) return res.status(400).send({ message: error.details[0].message });
            } else {
                const schema = joi.object({
                    name: joi.string().required(),
                    isPublic: joi.boolean(),
                });
                const { error } = schema.validate(req.body);
                if (error) return res.status(400).send({ message: error.details[0].message });
            }
            const { name, isPublic } = req.body;
            const newPlaylist = new Playlist({
                ...req.body,
                _id: new mongoose.Types.ObjectId().toHexString(),
                name: name,
                user: req.userId,
                userName: user.name,
                userAvatar: user.avatar,
            });
            user.myPlaylists.unshift({ _id: newPlaylist._id, name: newPlaylist.name });
            user.playlists.unshift(newPlaylist._id);
            if (isPublic || user.isAdmin) user.publicPlaylists.unshift(newPlaylist._id);
            const { image } = req.body;
            if (image) {
                await uploadImage(image, newPlaylist._id).then((url) => {
                    newPlaylist.image = url;
                });
            }
            Promise.all([newPlaylist.save(), user.save()])
                .then(([newPlaylist, user]) => {
                    res.status(201).json({ success: true, user: user, playlist: newPlaylist });
                })
                .catch((err) => {
                    console.log(err);
                    return res.status(500).json({ error: err });
                });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    // @ [PUT] api/playlists/edit/:id
    // Edit Playlist by id
    async editPlaylist(req, res, next) {
        try {
            const schema = joi.object({
                name: joi.string().required(),
                desc: joi.string().allow(""),
                image: joi.string().allow(""),
            });
            const { error } = schema.validate(req.body);
            if (error) return res.status(400).send({ success: false, message: error.details[0].message });

            const playlist = await Playlist.findById(req.params.id);
            if (!playlist) return res.status(404).send({ success: false, message: "Playlist not found" });
            const user = await User.findById(req.userId);

            if (!user._id.equals(playlist.user))
                return res.status(403).send({ success: false, message: "You don't have access to edit!" });

            const { image, name, desc } = req.body;
            if (image === playlist.image || !image) {
                playlist.image = req.body.image;
            } else {
                const url = await uploadImage(image, playlist._id);
                playlist.image = url;
            }
            if (name !== playlist.name) {
                playlist.name = req.body.name;
                const index = user.myPlaylists.findIndex((myPlaylist) => myPlaylist._id === req.params.id);
                user.myPlaylists[index].name = name;
            }
            console.log(user);
            playlist.desc = desc;
            const newPlaylist = await playlist.save();
            const newUser = await user.save();
            res.status(200).send({
                success: true,
                message: "Updated successfully",
                user: newUser,
                playlist: newPlaylist,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    // @ [PUT] api/playlists/add-song
    // Add Song to Playlist
    async addSong(req, res, next) {
        try {
            const schema = joi.object({
                playlistId: joi.string().required(),
                songId: joi.string().required(),
            });
            const { error } = schema.validate(req.body);
            if (error) return res.status(400).send({ success: false, message: error.details[0].message });

            const data = await Promise.all([User.findById(req.userId), Playlist.findById(req.body.playlistId)]);

            if (!data[0]._id.equals(data[1].user))
                return res.status(403).send({ success: false, message: "You don't have access to add!" });

            const index = data[1].songs.findIndex((song) => song.id === req.body.songId);
            if (index === -1) {
                data[1].songs.push({ id: req.body.songId, addedAt: Date.now() });
                await data[1].save();
                res.status(200).send({ success: true, message: "Added to Playlist" });
            } else {
                res.status(200).send({ success: true, message: "Song already exits" });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    // @ [PUT] api/playlists/remove-song
    // Remove Song to Playlist
    async removeSong(req, res, next) {
        try {
            const schema = joi.object({
                playlistId: joi.string().required(),
                songId: joi.string().required(),
            });
            const { error } = schema.validate(req.body);
            if (error) return res.status(400).send({ success: false, message: error.details[0].message });

            const data = await Promise.all([User.findById(req.userId), Playlist.findById(req.body.playlistId)]);

            if (!data[0]._id.equals(data[1].user))
                return res.status(403).send({ success: false, message: "You don't have access to remove!" });
            const index = data[1].songs.findIndex((song) => song.id === req.body.songId);
            if (index === -1) {
                res.status(200).send({ success: false, message: "Song doesn't exist" });
            } else {
                data[1].songs.splice(index, 1);
                const newPlaylist = await data[1].save();
                res.status(200).send({ success: true, message: "Removed Song", playlist: newPlaylist });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    // @ [GET] api/playlists
    // Get Playlists
    async getPlaylists(req, res, next) {
        try {
            const { limit, ...params } = req.query;
            const playlists = await Playlist.find(params).sort({ _id: -1 }).limit(limit);
            res.status(200).json({ success: true, playlists: playlists });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    // @ [GET] api/playlists/random
    // Get random Playlists
    async getRandomPlaylists(req, res, next) {
        try {
            const { limit, ...params } = req.query;
            const size = Number(limit);
            const playlists = await Playlist.aggregate([{ $match: params }, { $sample: { size: size } }]).sort({
                _id: -1,
            });
            res.status(200).json({ success: true, playlists: playlists });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    // @ [GET] api/playlists/:id
    // Get Songs of Playlist by id
    async getPlaylist(req, res, next) {
        try {
            const playlist = await Playlist.findById(req.params.id);
            if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });
            const songsId = playlist.songs.map((song) => song.id);
            const addedAt = playlist.songs.map((song) => song.addedAt);
            const songs = await Song.find({ _id: songsId });
            const songsSort = playlist.songs.map((songData) => {
                return songs.filter((song) => song._id === songData.id)[0];
            });
            res.status(200).json({ success: true, playlist: playlist, songs: songsSort, addedAt: addedAt });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    // @ [GET] api/playlists/user-update
    // Update Playlist when user update profile
    async userUpdate(req, res, next) {
        try {
            const { myPlaylists, userName, userAvatar } = req.body;
            const myPlaylistsID = myPlaylists.map((playlist) => playlist._id);
            const playlists = await Playlist.updateMany(
                { _id: myPlaylistsID },
                { userName: userName, userAvatar: userAvatar },
                { new: true }
            );
            if (!playlists) return res.status(404).json({ success: false, message: "Playlist not found" });
            res.status(200).json({ success: true, playlist: playlists });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    // @ [PUT] api/playlists/toggle-public/:id
    // Add/Remove Public of Playlists
    async togglePublic(req, res, next) {
        try {
            let resMessage = "";
            const data = await Promise.all([User.findById(req.userId), Playlist.findById(req.params.id)]);
            if (!data[0]) return res.status(404).json({ success: false, message: "User not found" });
            if (!data[1]) return res.status(404).json({ success: false, message: "Playlist not found" });
            const index = data[0].publicPlaylists.indexOf(req.params.id);
            if (index === -1) {
                data[0].publicPlaylists.unshift(req.params.id);
                resMessage = "Added playlist to your public profile";
            } else {
                data[0].publicPlaylists.splice(index, 1);
                resMessage = "Removed playlist from your public profile";
            }
            const newUser = await data[0].save();

            res.status(200).json({ success: true, message: resMessage, user: newUser });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    // @ [PUT] api/playlists/toggle-playlist/:id
    // Add/Remove playlist of library
    async togglePlaylist(req, res, next) {
        try {
            let resMessage = "";
            const data = await Promise.all([User.findById(req.userId), Playlist.findById(req.params.id)]);
            if (!data[0]) return res.status(404).json({ success: false, message: "User not found" });
            if (!data[1]) return res.status(404).json({ success: false, message: "Playlist not found" });
            const index = data[0].playlists.indexOf(req.params.id);
            console.log(index);
            if (index === -1) {
                data[0].playlists.unshift(req.params.id);
                data[0].publicPlaylists.unshift(req.params.id);
                resMessage = "Added playlist to library";
            } else {
                data[0].playlists.splice(index, 1);
                data[0].publicPlaylists.splice(index, 1);
                resMessage = "Removed playlist from library";
            }
            const newUser = await data[0].save();

            res.status(200).json({ success: true, message: resMessage, user: newUser });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    // @ [DELETE] api/playlists/:id
    // Delete Playlist by id
    async deletePlaylist(req, res, next) {
        try {
            const data = await Promise.all([User.findById(req.userId), Playlist.findById(req.params.id)]);
            if (!data[0]._id.equals(data[1].user))
                return res.status(403).json({ success: false, message: "You don't have access to delete!" });

            const index = data[0].playlists.indexOf(req.params.id);
            const index1 = data[0].myPlaylists.findIndex((myPlaylist) => myPlaylist._id === req.params.id);
            const index2 = data[0].publicPlaylists.indexOf(req.params.id);
            data[0].playlists.splice(index, 1);
            data[0].myPlaylists.splice(index1, 1);
            if (index2 !== -1) data[0].publicPlaylists.splice(index2, 1);
            const result = await Promise.all([data[0].save(), data[1].deleteOne()]);
            res.status(200).send({ success: true, message: "Deleted playlist", user: result[0] });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    // @ [GET] api/playlists/get-by-type/:type
    // Get Playlists by Type and Group Genre
    async getPlaylistsByType(req, res, next) {
        try {
            const result = await Playlist.aggregate([
                { $match: { type: req.params.type } },
                { $group: { _id: "$genre", playlists: { $addToSet: "$$CURRENT" } } },
                {
                    $project: {
                        genre: "$_id",
                        _id: 0,
                        playlists: 1,
                    },
                },
            ]);
            res.status(200).json({ success: true, result: result });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }
}

module.exports = new PlaylistController();
