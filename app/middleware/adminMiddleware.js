const jwt = require("jsonwebtoken");
const { User } = require("../models/User");

const verifyToken = async (req, res, next) => {
    const authHeader = req.header("Authorization");
    const authToken = authHeader && authHeader.split(" ")[1];
    if (!authToken) return res.status(401).json({ success: false, message: "Can't find access token" });

    try {
        const decoded = jwt.verify(authToken, process.env.ACCESS_TOKEN_KEY);
        const user = await User.findById(decoded.userId).select("-password -__v");
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        } else if (!user.isAdmin) {
            return res.status(403).json({ success: false, message: "You don't have access to this" });
        }
        req.userId = decoded.userId;
        next();
    } catch (error) {
        // console.log(error);
        res.status(403).json({ success: false, message: "Access token invalid" });
    }
};

module.exports = verifyToken;
