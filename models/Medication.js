const mongoose = require("mongoose");

// One Medication document = one prescribed medicine for one patient,
// with its own dosing schedule and pill count for refill tracking.
const medicationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dosage: {
      type: String, // e.g. "500mg", "1 tablet" - kept as free text for flexibility
      required: true,
    },
    frequency: {
      type: String, // e.g. "twice daily", "once daily" - human-readable label
      required: true,
    },
    times: {
      // Scheduled times of day this medication should be taken, e.g. ["08:00", "20:00"]
      // Stored as 24-hour "HH:mm" strings; the scheduler compares against these.
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one scheduled time is required",
      },
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date, // optional - null/undefined means ongoing indefinitely
    },
    pillsRemaining: {
      type: Number,
      required: true,
      min: 0,
    },
    dailyDosageCount: {
      // How many pills are consumed per day, used for refill day calculations.
      // Defaults to the number of scheduled times (assumes 1 pill per dose).
      type: Number,
      default: function () {
        return this.times ? this.times.length : 1;
      },
    },
    refillThreshold: {
      // Alert the caregiver when days-remaining drops to this number or below
      type: Number,
      default: 3,
    },
    prescriptionPhotoUrl: {
      type: String, // optional - path/URL to an uploaded prescription photo
    },
    isActive: {
      type: Boolean,
      default: true, // lets us "soft delete" / pause a medication without losing history
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medication", medicationSchema);
