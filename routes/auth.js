const express = require("express");
const router = express.Router();
const AuthController = require("../app/controllers/AuthController.js");
const authMiddleware = require("../app/middleware/authMiddleware.js");

// @ [GET] api/auth/check-mail
// access Public
router.get("/check-mail", AuthController.checkMail);

// @ [GET] api/auth
// access Public
router.get("/:id", authMiddleware, AuthController.getUser);

// @ [GET] api/auth
// access Public
router.get("/", authMiddleware, AuthController.loadUser);

// @ [POST] api/auth/register
// access Public
router.post("/register", AuthController.register);

// @ [POST] api/auth/login
// access Public
router.post("/login", AuthController.login);

// @ [PUT] api/auth/updateProfile
// access Private
router.put("/update-profile", authMiddleware, AuthController.updateProfile);

module.exports = router;
