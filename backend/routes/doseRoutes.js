const express = require("express");
const router = express.Router();
const { getTodayDoses, getDoseHistory, updateDoseStatus } = require("../controllers/doseController");
const { protect } = require("../middleware/authMiddleware");

router.get("/patient/:patientId/today", protect, getTodayDoses);
router.get("/patient/:patientId/history", protect, getDoseHistory);
router.patch("/:id", protect, updateDoseStatus);

module.exports = router;
