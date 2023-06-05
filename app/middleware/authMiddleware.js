const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const authToken = authHeader && authHeader.split(" ")[1];
  if (!authToken)
    return res
      .status(401)
      .json({ success: false, message: "Can't find access token" });

  try {
    const decoded = jwt.verify(authToken, process.env.ACCESS_TOKEN_KEY);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    // console.log(error);
    res.status(403).json({ success: false, message: "Access token invalid" });
  }
};

module.exports = verifyToken;
