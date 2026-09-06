const mongoose = require("mongoose");

// One AlertLog document = one notification-worthy event for a caregiver,
// e.g. a missed dose or a low refill. The dashboard's "real-time alert feed"
// (Module 8) reads from this collection.
const alertLogSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    caregiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["missed-dose", "refill", "callback-request"],
      required: true,
    },
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medication",
    },
    message: {
      type: String,
      required: true,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AlertLog", alertLogSchema);
