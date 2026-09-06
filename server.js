require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

// Connect to MongoDB Atlas before starting the server
connectDB();

const app = express();

app.use(cors()); // allows the React dashboard / React Native app to call this API
app.use(express.json()); // parses incoming JSON request bodies into req.body

// Mount auth routes under /api/auth
// e.g. POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
app.use("/api/auth", authRoutes);

// Simple health check route - useful to confirm the server is up
app.get("/", (req, res) => {
  res.json({ message: "Medicine Reminder API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
