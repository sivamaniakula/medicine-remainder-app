const mongoose = require("mongoose");

// A "User" can be either a caregiver or a patient.
// The "role" field is what distinguishes them and what the frontend
// will use to decide which dashboard/screens to show.
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true, // no two users can register with the same phone number
      trim: true,
    },
    password: {
      type: String,
      required: true, // this will store the HASHED password, never plain text
    },
    role: {
      type: String,
      enum: ["caregiver", "patient"],
      required: true,
    },
    preferredLanguage: {
      type: String,
      enum: ["en", "te"], // English or Telugu
      default: "en",
    },
    preferredChannel: {
      type: String,
      enum: ["app", "whatsapp", "voice"],
      default: "app",
    },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

module.exports = mongoose.model("User", userSchema);
