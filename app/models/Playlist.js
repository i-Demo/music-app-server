const mongoose = require("mongoose");
const joi = require("joi");
const Schema = mongoose.Schema;

const PlaylistSchema = new Schema(
    {
        _id: String,
        name: { type: String, required: true },
        user: { type: Schema.Types.ObjectId, ref: "users", required: true },
        userName: { type: String, required: true },
        userAvatar: { type: String, default: "" },
        desc: { type: String, default: "" },
        image: { type: String, default: "" },
        type: { type: String, default: "" },
        genre: { type: String, default: "" },
        songs: { type: [Object], default: [] },
        region: { type: String, default: "" },
    },
    {
        timestamps: true,
    }
);

const validate = (playList) => {
    const schema = joi.object({
        name: joi.string().required(),
        desc: joi.string().required(),
        image: joi.string().required(),
        type: joi.string().required(),
        genre: joi.string().required(),
        region: joi.string().required(),
    });
    return schema.validate(playList);
};

const Playlist = mongoose.model("playlists", PlaylistSchema);

module.exports = { Playlist, validate };
