const AlertLog = require("../models/AlertLog");

// GET /api/alerts
// Returns all alerts for the logged-in caregiver, most recent first.
// Supports ?resolved=false to filter to only unresolved alerts (the
// default view for a caregiver's alert feed).
const getMyAlerts = async (req, res) => {
  try {
    if (req.user.role !== "caregiver") {
      return res.status(403).json({ message: "Only caregivers can view alerts" });
    }

    const query = { caregiverId: req.user._id };
    if (req.query.resolved !== undefined) {
      query.resolved = req.query.resolved === "true";
    }

    const alerts = await AlertLog.find(query)
      .populate("patientId", "name phone")
      .populate("medicationId", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json(alerts);
  } catch (err) {
    console.error("Get alerts error:", err.message);
    return res.status(500).json({ message: "Server error while fetching alerts" });
  }
};

// PATCH /api/alerts/:id/resolve
// Marks an alert as resolved (e.g. caregiver acknowledged the missed dose).
const resolveAlert = async (req, res) => {
  try {
    const alert = await AlertLog.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    if (alert.caregiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to resolve this alert" });
    }

    alert.resolved = true;
    await alert.save();

    return res.status(200).json(alert);
  } catch (err) {
    console.error("Resolve alert error:", err.message);
    return res.status(500).json({ message: "Server error while resolving alert" });
  }
};

module.exports = { getMyAlerts, resolveAlert };
