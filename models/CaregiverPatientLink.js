const mongoose = require("mongoose");

// Links a caregiver to a patient. Many-to-many: one caregiver can manage
// multiple patients, and one patient can have multiple caregivers
// (e.g. two siblings both monitoring the same parent).
const caregiverPatientLinkSchema = new mongoose.Schema(
  {
    caregiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent the same caregiver-patient pair from being linked twice
caregiverPatientLinkSchema.index({ caregiverId: 1, patientId: 1 }, { unique: true });

module.exports = mongoose.model("CaregiverPatientLink", caregiverPatientLinkSchema);
