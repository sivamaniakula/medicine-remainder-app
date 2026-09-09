const express = require("express");
const router = express.Router();
const {
  createMedication,
  getMedicationsForPatient,
  getMedicationById,
  updateMedication,
  deleteMedication,
} = require("../controllers/medicationController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createMedication);
router.get("/patient/:patientId", protect, getMedicationsForPatient);
router.get("/:id", protect, getMedicationById);
router.put("/:id", protect, updateMedication);
router.delete("/:id", protect, deleteMedication);

module.exports = router;
