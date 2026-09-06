const express = require("express");
const router = express.Router();
const { linkPatient, getMyPatients, updatePatientSettings } = require("../controllers/linkController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, linkPatient);
router.get("/patients", protect, getMyPatients);
router.patch("/patient/:patientId/settings", protect, updatePatientSettings);

module.exports = router;
