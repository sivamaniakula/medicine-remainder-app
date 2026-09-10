const CaregiverPatientLink = require("../models/CaregiverPatientLink");
const User = require("../models/User");

// POST /api/links
// Links the logged-in caregiver to a patient by the patient's phone number.
// Only caregivers can create links (enforced below).
const linkPatient = async (req, res) => {
  try {
    if (req.user.role !== "caregiver") {
      return res.status(403).json({ message: "Only caregivers can link patients" });
    }

    const { patientPhone } = req.body;
    if (!patientPhone) {
      return res.status(400).json({ message: "patientPhone is required" });
    }

    const patient = await User.findOne({ phone: patientPhone, role: "patient" });
    if (!patient) {
      return res.status(404).json({ message: "No patient found with that phone number" });
    }

    // Avoid duplicate links (the schema also enforces this at the DB level)
    const existingLink = await CaregiverPatientLink.findOne({
      caregiverId: req.user._id,
      patientId: patient._id,
    });
    if (existingLink) {
      return res.status(409).json({ message: "This patient is already linked to you" });
    }

    const link = await CaregiverPatientLink.create({
      caregiverId: req.user._id,
      patientId: patient._id,
    });

    return res.status(201).json({ link, patient: { _id: patient._id, name: patient.name, phone: patient.phone } });
  } catch (err) {
    console.error("Link patient error:", err.message);
    return res.status(500).json({ message: "Server error while linking patient" });
  }
};

// GET /api/links/patients
// Returns all patients linked to the logged-in caregiver.
const getMyPatients = async (req, res) => {
  try {
    if (req.user.role !== "caregiver") {
      return res.status(403).json({ message: "Only caregivers can view linked patients" });
    }

    const links = await CaregiverPatientLink.find({ caregiverId: req.user._id }).populate(
      "patientId",
      "name phone preferredLanguage preferredChannel"
    );

    const patients = links.map((link) => link.patientId);
    return res.status(200).json(patients);
  } catch (err) {
    console.error("Get patients error:", err.message);
    return res.status(500).json({ message: "Server error while fetching patients" });
  }
};

module.exports = { linkPatient, getMyPatients };
