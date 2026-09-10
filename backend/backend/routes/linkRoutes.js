const express = require("express");
const router = express.Router();
const { linkPatient, getMyPatients } = require("../controllers/linkController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, linkPatient);
router.get("/patients", protect, getMyPatients);

module.exports = router;
