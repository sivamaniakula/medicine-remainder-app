const CaregiverPatientLink = require("../models/CaregiverPatientLink");
const User = require("../models/User");
const { isCaregiverLinkedToPatient } = require("../utils/accessControl");

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

// PATCH /api/links/patient/:patientId/settings
// Lets a linked caregiver update a patient's preferredChannel and/or
// preferredLanguage - this is what the dashboard's channel picker calls,
// since patients (especially feature-phone users) may never set this
// themselves. Only caregivers actually linked to this patient may do this.
const updatePatientSettings = async (req, res) => {
  try {
    if (req.user.role !== "caregiver") {
      return res.status(403).json({ message: "Only caregivers can update patient settings" });
    }

    const { patientId } = req.params;
    const { preferredChannel, preferredLanguage } = req.body;

    const allowed = await isCaregiverLinkedToPatient(req.user._id, patientId);
    if (!allowed) {
      return res.status(403).json({ message: "Not authorized to update this patient" });
    }

    if (preferredChannel && !["app", "whatsapp", "voice"].includes(preferredChannel)) {
      return res.status(400).json({ message: "preferredChannel must be 'app', 'whatsapp', or 'voice'" });
    }
    if (preferredLanguage && !["en", "te"].includes(preferredLanguage)) {
      return res.status(400).json({ message: "preferredLanguage must be 'en' or 'te'" });
    }

    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    if (preferredChannel) patient.preferredChannel = preferredChannel;
    if (preferredLanguage) patient.preferredLanguage = preferredLanguage;
    await patient.save();

    return res.status(200).json({
      _id: patient._id,
      name: patient.name,
      phone: patient.phone,
      preferredChannel: patient.preferredChannel,
      preferredLanguage: patient.preferredLanguage,
    });
  } catch (err) {
    console.error("Update patient settings error:", err.message);
    return res.status(500).json({ message: "Server error while updating patient settings" });
  }
};

module.exports = { linkPatient, getMyPatients, updatePatientSettings };
