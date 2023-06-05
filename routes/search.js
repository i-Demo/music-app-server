const express = require("express");
const router = express.Router();
const authMiddleware = require("../app/middleware/authMiddleware.js");
const SearchController = require("../app/controllers/SearchController.js");

router.get("/", authMiddleware, SearchController.search);

module.exports = router;
