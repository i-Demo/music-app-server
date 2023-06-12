const { User, validate } = require("../models/User");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const joi = require("joi");
const uploadImage = require("../cloudinary/uploadImage");

class AuthController {
    // @ [GET] api/auth
    // access Public
    async loadUser(req, res, next) {
        try {
            const user = await User.findById(req.userId).select("-password -__v -updatedAt");
            if (!user) return res.status(400).json({ success: false, message: "User not found" });
            res.status(200).json({ success: true, user });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    // @ [GET] api/auth/check-mail
    // access Public
    async checkMail(req, res, next) {
        const schema = joi.object({
            email: joi.string().email().required(),
        });
        const { error } = schema.validate(req.query);
        if (error) return res.status(400).send({ message: error.details[0].message });

        try {
            const user = await User.findOne(req.query);
            //Check for existing user
            if (user) {
                return res.status(400).json({ success: false, message: "Email can be used" });
            }
            res.status(200).json({ success: true, message: "Email is already exist" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    // @ [POST] api/auth/register
    // access Public
    async register(req, res, next) {
        // Validate Data
        const { error } = validate(req.body);
        if (error) return res.status(400).json({ success: false, message: error.details[0].message });

        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email });
            //Check for existing user
            if (user) {
                return res.status(400).json({ success: false, message: "Email is already exist" });
            }

            // If Ok, create new user
            const hashedPassword = await argon2.hash(password);
            let newUser = new User({ ...req.body, password: hashedPassword });
            await newUser.save();
            // Returning token
            const accessToken = jwt.sign({ userId: newUser._id }, process.env.ACCESS_TOKEN_KEY);

            newUser.password = undefined;
            newUser.__v = undefined;

            res.status(201).json({
                success: true,
                message: "Register User Success!",
                accessToken,
                user: newUser,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal server error!" });
        }
    }

    // @ [POST] api/auth/login
    // access Public
    async login(req, res, next) {
        // Validate Data
        const { error } = validate(req.body);
        if (error) return res.status(400).json({ success: false, message: error.details[0].message });

        const { email, password } = req.body;

        try {
            let user = await User.findOne({ email });
            // Check for existing user
            if (!user) return res.status(400).json({ success: false, message: "Missing username and/or password" });

            // Check for incorrect password
            const passwordValid = await argon2.verify(user.password, password);
            if (!passwordValid)
                return res.status(400).json({ success: false, message: "Missing username and/or password" });

            // Returning Token
            const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_KEY);

            user.password = undefined;
            user.__v = undefined;

            res.status(200).json({
                success: true,
                message: "Login Successfully!",
                accessToken,
                user,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    // @ [PUT] api/auth/updateProfile
    // access Private
    async updateProfile(req, res, next) {
        try {
            const { avatar, name, gender, birthday } = req.body;
            const user = await User.findById(req.userId).select("-password -__v -updatedAt");
            user.name = name;
            user.gender = gender;
            user.birthday = birthday;
            if (avatar === user.avatar || !avatar) {
                user.avatar = avatar;
            } else {
                const url = await uploadImage(avatar, req.userId);
                user.avatar = url;
            }
            const newUser = await user.save();
            return res.status(200).json({ success: true, user: newUser });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    // @ [GET] api/auth/:id
    // Get User by Id
    async getUser(req, res, next) {
        try {
            const user = await User.findById(req.params.id).select("-password -__v -updatedAt");
            if (!user) return res.status(400).json({ success: false, message: "User not found" });
            res.status(200).json({ success: true, user });
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }
}

module.exports = new AuthController();
