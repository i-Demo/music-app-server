const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const joi = require("joi");

const UserSchema = new Schema(
    {
        email: { type: String, required: true, unique: true, immutable: true },
        password: { type: String, required: true },
        name: { type: String, required: true },
        avatar: { type: String, default: "" },
        gender: { type: String, default: "" },
        birthday: { type: String, default: "" },
        likedSongs: { type: [Object], default: [] },
        playlists: { type: [String], default: [] },
        myPlaylists: { type: [{ _id: String, name: String }], default: [] },
        publicPlaylists: { type: [String], default: [] },
        isAdmin: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

const validate = (user) => {
    const schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required(),
        name: joi.string(),
        birthday: joi.string(),
        gender: joi.string().valid("male", "female", "other"),
    });
    return schema.validate(user);
};

const User = mongoose.model("users", UserSchema);

module.exports = { User, validate };
