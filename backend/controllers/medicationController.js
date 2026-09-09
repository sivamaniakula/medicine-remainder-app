const Medication = require("../models/Medication");
const { isCaregiverLinkedToPatient } = require("../utils/accessControl");

// Helper: confirms req.user is allowed to act on the given patientId.
// A caregiver must be linked to the patient; a patient can only act on themselves.
const canAccessPatient = async (req, patientId) => {
  if (req.user.role === "patient") {
    return req.user._id.toString() === patientId.toString();
  }
  if (req.user.role === "caregiver") {
    return isCaregiverLinkedToPatient(req.user._id, patientId);
  }
  return false;
};

// POST /api/medications
// Creates a new medication for a patient. Caregiver-only in practice
// (patients aren't expected to self-prescribe), but we allow either role
// as long as they're authorized for that patientId.
const createMedication = async (req, res) => {
  try {
    const { patientId, name, dosage, frequency, times, startDate, endDate, pillsRemaining, refillThreshold } = req.body;

    if (!patientId || !name || !dosage || !frequency || !times || !startDate || pillsRemaining === undefined) {
      return res.status(400).json({
        message: "patientId, name, dosage, frequency, times, startDate, and pillsRemaining are required",
      });
    }

    const allowed = await canAccessPatient(req, patientId);
    if (!allowed) {
      return res.status(403).json({ message: "Not authorized to add medications for this patient" });
    }

    const medication = await Medication.create({
      patientId,
      name,
      dosage,
      frequency,
      times,
      startDate,
      endDate,
      pillsRemaining,
      dailyDosageCount: times.length,
      refillThreshold: refillThreshold || 3,
    });

    return res.status(201).json(medication);
  } catch (err) {
    console.error("Create medication error:", err.message);
    return res.status(500).json({ message: "Server error while creating medication" });
  }
};

// GET /api/medications/patient/:patientId
// Lists all active medications for a patient.
const getMedicationsForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const allowed = await canAccessPatient(req, patientId);
    if (!allowed) {
      return res.status(403).json({ message: "Not authorized to view this patient's medications" });
    }

    const medications = await Medication.find({ patientId, isActive: true }).sort({ createdAt: -1 });
    return res.status(200).json(medications);
  } catch (err) {
    console.error("Get medications error:", err.message);
    return res.status(500).json({ message: "Server error while fetching medications" });
  }
};

// GET /api/medications/:id
// Gets a single medication by its ID.
const getMedicationById = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ message: "Medication not found" });
    }

    const allowed = await canAccessPatient(req, medication.patientId);
    if (!allowed) {
      return res.status(403).json({ message: "Not authorized to view this medication" });
    }

    return res.status(200).json(medication);
  } catch (err) {
    console.error("Get medication error:", err.message);
    return res.status(500).json({ message: "Server error while fetching medication" });
  }
};

// PUT /api/medications/:id
// Updates a medication's details (name, dosage, times, pill count, etc).
const updateMedication = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ message: "Medication not found" });
    }

    const allowed = await canAccessPatient(req, medication.patientId);
    if (!allowed) {
      return res.status(403).json({ message: "Not authorized to update this medication" });
    }

    const updatableFields = [
      "name",
      "dosage",
      "frequency",
      "times",
      "startDate",
      "endDate",
      "pillsRemaining",
      "dailyDosageCount",
      "refillThreshold",
      "prescriptionPhotoUrl",
      "isActive",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        medication[field] = req.body[field];
      }
    });

    await medication.save();
    return res.status(200).json(medication);
  } catch (err) {
    console.error("Update medication error:", err.message);
    return res.status(500).json({ message: "Server error while updating medication" });
  }
};

// DELETE /api/medications/:id
// Soft-deletes a medication (sets isActive to false) rather than removing
// it, so historical DoseLog entries still make sense.
const deleteMedication = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ message: "Medication not found" });
    }

    const allowed = await canAccessPatient(req, medication.patientId);
    if (!allowed) {
      return res.status(403).json({ message: "Not authorized to delete this medication" });
    }

    medication.isActive = false;
    await medication.save();

    return res.status(200).json({ message: "Medication deactivated" });
  } catch (err) {
    console.error("Delete medication error:", err.message);
    return res.status(500).json({ message: "Server error while deleting medication" });
  }
};

module.exports = {
  createMedication,
  getMedicationsForPatient,
  getMedicationById,
  updateMedication,
  deleteMedication,
};
