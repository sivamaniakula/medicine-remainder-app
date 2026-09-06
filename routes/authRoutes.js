const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getCurrentUser } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public routes - no token needed
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected route - requires a valid JWT in the Authorization header
router.get("/me", protect, getCurrentUser);

module.exports = router;
