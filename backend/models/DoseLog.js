const mongoose = require("mongoose");

// One DoseLog document = one specific scheduled dose (e.g. "8am dose of
// Paracetamol on Sept 6") and what happened to it.
// The scheduler creates these automatically when a dose becomes due.
const doseLogSchema = new mongoose.Schema(
  {
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medication",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    scheduledTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "taken", "missed", "skipped"],
      default: "pending",
    },
    actualTime: {
      type: Date, // when the patient actually confirmed the dose (if taken)
    },
    responseChannel: {
      type: String,
      enum: ["app", "whatsapp", "voice", "system"],
      // "system" = auto-marked (e.g. auto-marked missed after no response)
    },
  },
  { timestamps: true }
);

// Prevent duplicate dose logs for the same medication + exact scheduled time
doseLogSchema.index({ medicationId: 1, scheduledTime: 1 }, { unique: true });

module.exports = mongoose.model("DoseLog", doseLogSchema);
