require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const linkRoutes = require("./routes/linkRoutes");
const medicationRoutes = require("./routes/medicationRoutes");
const doseRoutes = require("./routes/doseRoutes");
const alertRoutes = require("./routes/alertRoutes");
const { startScheduler } = require("./services/schedulerService");

// Connect to MongoDB Atlas before starting the server
connectDB();

const app = express();

app.use(cors()); // allows the React dashboard / React Native app to call this API
app.use(express.json()); // parses incoming JSON request bodies into req.body

// Mount routes
// Auth: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
app.use("/api/auth", authRoutes);

// Links: POST /api/links (link a patient), GET /api/links/patients (list linked patients)
app.use("/api/links", linkRoutes);

// Medications: full CRUD under /api/medications
app.use("/api/medications", medicationRoutes);

// Doses: GET today/history, PATCH status
app.use("/api/doses", doseRoutes);

// Alerts: GET feed, PATCH resolve
app.use("/api/alerts", alertRoutes);

// Simple health check route - useful to confirm the server is up
app.get("/", (req, res) => {
  res.json({ message: "Medicine Reminder API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // Start the cron-based scheduling engine once the server is up.
  startScheduler();
});
