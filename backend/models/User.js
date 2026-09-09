const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["caregiver", "patient"], required: true },
    preferredLanguage: { type: String, enum: ["en", "te"], default: "en" },
    preferredChannel: {
      type: String,
      enum: ["app", "whatsapp", "voice", "sms"],
      default: "app",
    },
    fcmToken: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
