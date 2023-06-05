const { Playlist } = require("../models/Playlist");
const { Song } = require("../models/Song");
const { User } = require("../models/User");

class SearchController {
    // @ [GET] api/search
    // Search API/ Get Songs, Playlists, Users from search
    async search(req, res, next) {
        try {
            const { search } = req.query;
            if (search !== "") {
                const songs = await Song.find({ $text: { $search: search } }, { score: { $meta: "textScore" } }).sort({
                    score: { $meta: "textScore" },
                });
                const playlists = await Playlist.find(
                    { $text: { $search: search } },
                    { score: { $meta: "textScore" } }
                ).sort({
                    score: { $meta: "textScore" },
                });
                const users = await User.find({ $text: { $search: search } }, { score: { $meta: "textScore" } }).sort({
                    score: { $meta: "textScore" },
                });
                const result = { songs, playlists, users };
                res.status(200).json({ success: true, result: result });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }
}

module.exports = new SearchController();
