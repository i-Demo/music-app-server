const mongoose = require("mongoose");
const joi = require("joi");
const Schema = mongoose.Schema;

const TypeSchema = new Schema({
    _id: String,
    type: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
});

const validate = (playList) => {
    const schema = joi.object({
        type: joi.string().required(),
        name: joi.string().required(),
        image: joi.string().required(),
    });
    return schema.validate(playList);
};

const Type = mongoose.model("types", TypeSchema);

module.exports = { Type, validate };
