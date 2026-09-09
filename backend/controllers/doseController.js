const DoseLog = require("../models/DoseLog");
const Medication = require("../models/Medication");
const { isCaregiverLinkedToPatient } = require("../utils/accessControl");

const canAccessPatient = async (req, patientId) => {
  if (req.user.role === "patient") {
    return req.user._id.toString() === patientId.toString();
  }
  if (req.user.role === "caregiver") {
    return isCaregiverLinkedToPatient(req.user._id, patientId);
  }
  return false;
};

// GET /api/doses/patient/:patientId/today
// Returns today's dose logs for a patient, populated with medication info.
// This powers both the "today's medications" mobile screen and the
// dashboard's daily view.
const getTodayDoses = async (req, res) => {
  try {
    const { patientId } = req.params;

    const allowed = await canAccessPatient(req, patientId);
    if (!allowed) {
      return res.status(403).json({ message: "Not authorized to view this patient's doses" });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const doses = await DoseLog.find({
      patientId,
      scheduledTime: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate("medicationId", "name dosage")
      .sort({ scheduledTime: 1 });

    return res.status(200).json(doses);
  } catch (err) {
    console.error("Get today doses error:", err.message);
    return res.status(500).json({ message: "Server error while fetching today's doses" });
  }
};

// GET /api/doses/patient/:patientId/history
// Returns dose history for a patient, optionally filtered by date range
// via ?from=YYYY-MM-DD&to=YYYY-MM-DD query params. Powers the adherence
// calendar/list view.
const getDoseHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { from, to } = req.query;

    const allowed = await canAccessPatient(req, patientId);
    if (!allowed) {
      return res.status(403).json({ message: "Not authorized to view this patient's dose history" });
    }

    const query = { patientId };
    if (from || to) {
      query.scheduledTime = {};
      if (from) query.scheduledTime.$gte = new Date(from);
      if (to) query.scheduledTime.$lte = new Date(to);
    }

    const doses = await DoseLog.find(query)
      .populate("medicationId", "name dosage")
      .sort({ scheduledTime: -1 });

    return res.status(200).json(doses);
  } catch (err) {
    console.error("Get dose history error:", err.message);
    return res.status(500).json({ message: "Server error while fetching dose history" });
  }
};

// PATCH /api/doses/:id
// Updates a dose's status (taken/missed/skipped). When marked "taken",
// this also decrements the medication's pillsRemaining count by 1,
// which is what powers refill tracking.
const updateDoseStatus = async (req, res) => {
  try {
    const { status, responseChannel } = req.body;

    if (!["taken", "missed", "skipped"].includes(status)) {
      return res.status(400).json({ message: "status must be 'taken', 'missed', or 'skipped'" });
    }

    const dose = await DoseLog.findById(req.params.id);
    if (!dose) {
      return res.status(404).json({ message: "Dose log not found" });
    }

    const allowed = await canAccessPatient(req, dose.patientId);
    if (!allowed) {
      return res.status(403).json({ message: "Not authorized to update this dose" });
    }

    dose.status = status;
    dose.responseChannel = responseChannel || "app";
    if (status === "taken") {
      dose.actualTime = new Date();
    }
    await dose.save();

    // Decrement pill count when a dose is confirmed taken.
    // This is the trigger point for refill tracking (Module 7 uses this field).
    if (status === "taken") {
      const medication = await Medication.findById(dose.medicationId);
      if (medication && medication.pillsRemaining > 0) {
        medication.pillsRemaining -= 1;
        await medication.save();
      }
    }

    return res.status(200).json(dose);
  } catch (err) {
    console.error("Update dose status error:", err.message);
    return res.status(500).json({ message: "Server error while updating dose status" });
  }
};

module.exports = { getTodayDoses, getDoseHistory, updateDoseStatus };
