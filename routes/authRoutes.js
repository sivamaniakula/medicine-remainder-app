const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getCurrentUser, updateFcmToken } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public routes - no token needed
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes - require a valid JWT in the Authorization header
router.get("/me", protect, getCurrentUser);
router.patch("/fcm-token", protect, updateFcmToken);

module.exports = router;
