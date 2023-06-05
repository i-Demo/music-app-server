const express = require("express");
const router = express.Router();
const authMiddleware = require("../app/middleware/authMiddleware.js");
const TypeController = require("../app/controllers/TypeController.js");

router.get("/", authMiddleware, TypeController.getTypes);

router.post("/", authMiddleware, TypeController.createType);


module.exports = router;
