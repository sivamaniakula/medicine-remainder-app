const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Helper: creates a signed JWT containing the user's ID.
// This token is what the client stores and sends back on future requests
// to prove who they are, instead of sending username/password every time.
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d", // token stays valid for 30 days
  });
};

// POST /api/auth/register
// Creates a new caregiver or patient account.
const registerUser = async (req, res) => {
  try {
    const { name, phone, password, role, preferredLanguage, preferredChannel } = req.body;

    // Basic validation
    if (!name || !phone || !password || !role) {
      return res.status(400).json({ message: "name, phone, password, and role are required" });
    }

    if (!["caregiver", "patient"].includes(role)) {
      return res.status(400).json({ message: "role must be 'caregiver' or 'patient'" });
    }

    // Check for existing user with this phone number
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(409).json({ message: "A user with this phone number already exists" });
    }

    // Hash the password before saving - NEVER store plain text passwords.
    // bcrypt "salts" the password automatically so identical passwords
    // don't produce identical hashes.
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      phone,
      password: hashedPassword,
      role,
      preferredLanguage: preferredLanguage || "en",
      preferredChannel: preferredChannel || "app",
    });

    // Respond with user info (minus password) + a token so the client
    // can log the user in immediately after registering.
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      preferredChannel: user.preferredChannel,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Register error:", err.message);
    return res.status(500).json({ message: "Server error during registration" });
  }
};

// POST /api/auth/login
// Validates phone + password, returns a JWT if correct.
const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "phone and password are required" });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      // Deliberately vague message - don't reveal whether phone exists
      return res.status(401).json({ message: "Invalid phone number or password" });
    }

    // bcrypt.compare hashes the plain-text input and checks it against
    // the stored hash - this is how we verify passwords without ever
    // storing or comparing plain text.
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid phone number or password" });
    }

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      preferredChannel: user.preferredChannel,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ message: "Server error during login" });
  }
};

// GET /api/auth/me
// Protected route - returns the currently logged-in user's info.
// req.user is attached by the authMiddleware after verifying the JWT.
const getCurrentUser = async (req, res) => {
  return res.status(200).json(req.user);
};

module.exports = { registerUser, loginUser, getCurrentUser };
