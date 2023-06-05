const mongoose = require("mongoose");
const { Type, validate } = require("../models/Type");
const uploadImage = require("../cloudinary/uploadImage");

class TypeController {
    // [POST] api/types
    // Create Type
    async createType(req, res, next) {
        const { error } = validate(req.body);
        if (error) return res.status(400).json({ success: false, message: error.details[0].message });

        const { image } = req.body;
        try {
            let newType = new Type({ _id: new mongoose.Types.ObjectId().toHexString(), ...req.body });
            const urlImage = await uploadImage(image, newType._id);
            newType.image = urlImage;
            await newType.save();
            return res.status(201).json({ success: true, message: "Create Type Success", type: newType });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal server error!" });
        }
    }
    // [GET] api/types
    // Get all Type
    async getTypes(req, res, next) {
        try {
            const { ...params } = req.query;
            const types = await Type.find(params);
            return res.status(201).json({ success: true, types: types });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal server error!" });
        }
    }
}

module.exports = new TypeController();
