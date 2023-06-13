const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const joi = require("joi");

const SongSchema = new Schema(
    {
        _id: String,
        name: { type: String, required: true },
        song: { type: String, required: true },
        artist: { type: String, required: true },
        image: { type: String, required: true },
        album: { type: { _id: String, name: String } },
        duration: { type: Number, required: true },
        lyrics: { type: String, default: "" },
        country: { type: String, default: "" },
        plays: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

const validate = (song) => {
    const schema = joi.object({
        name: joi.string().required(),
        song: joi.string().required(),
        artist: joi.string().required(),
        image: joi.string().required(),
        duration: joi.number().required(),
        lyrics: joi.string().allow(""),
        country: joi.string().allow(""),
    });
    return schema.validate(song);
};

const Song = mongoose.model("songs", SongSchema);

module.exports = { Song, validate };
