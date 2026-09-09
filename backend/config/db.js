const mongoose = require("mongoose");

// Connects to MongoDB Atlas using the URI from .env
// If this fails, double check MONGO_URI in your .env file and that your
// current IP is allow-listed in Atlas (Network Access tab).
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // stop the server if DB connection fails
  }
};

module.exports = connectDB;
