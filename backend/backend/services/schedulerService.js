const cron = require("node-cron");
const Medication = require("../models/Medication");
const DoseLog = require("../models/DoseLog");
const AlertLog = require("../models/AlertLog");
const CaregiverPatientLink = require("../models/CaregiverPatientLink");

// Formats a Date as "HH:mm" (24-hour) to compare against Medication.times entries.
const getCurrentTimeString = (date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Creates AlertLog entries for every caregiver linked to a given patient.
// Used both for missed-dose alerts and low-refill alerts.
const notifyCaregivers = async (patientId, type, message, medicationId) => {
  const links = await CaregiverPatientLink.find({ patientId });
  const alerts = links.map((link) => ({
    patientId,
    caregiverId: link.caregiverId,
    type,
    medicationId,
    message,
  }));
  if (alerts.length > 0) {
    await AlertLog.insertMany(alerts);
  }
};

// Core job: runs every minute, checks which medications have a scheduled
// time matching "right now", and creates a DoseLog for each if one doesn't
// already exist (the unique index on medicationId+scheduledTime prevents
// duplicates if this somehow runs twice for the same minute).
const checkDueDoses = async () => {
  try {
    const now = new Date();
    const currentTime = getCurrentTimeString(now);

    const activeMedications = await Medication.find({
      isActive: true,
      times: currentTime,
      startDate: { $lte: now },
      $or: [{ endDate: null }, { endDate: { $exists: false } }, { endDate: { $gte: now } }],
    });

    for (const medication of activeMedications) {
      // Build a scheduledTime Date for today at this exact HH:mm
      const scheduledTime = new Date(now);
      scheduledTime.setSeconds(0, 0);

      try {
        await DoseLog.create({
          medicationId: medication._id,
          patientId: medication.patientId,
          scheduledTime,
          status: "pending",
        });
        console.log(`Dose log created: ${medication.name} for patient ${medication.patientId} at ${currentTime}`);
      } catch (err) {
        // Duplicate key error just means this dose was already logged - safe to ignore
        if (err.code !== 11000) {
          console.error("Error creating dose log:", err.message);
        }
      }
    }
  } catch (err) {
    console.error("checkDueDoses error:", err.message);
  }
};

// Checks all pending doses that are more than 20 minutes overdue and
// auto-marks them as "missed", then alerts caregivers.
// (20 minutes gives room for the retry logic that Module 6/Twilio will add later.)
const checkMissedDoses = async () => {
  try {
    const cutoff = new Date(Date.now() - 20 * 60 * 1000);

    const overdueDoses = await DoseLog.find({
      status: "pending",
      scheduledTime: { $lte: cutoff },
    }).populate("medicationId", "name");

    for (const dose of overdueDoses) {
      dose.status = "missed";
      dose.responseChannel = "system";
      await dose.save();

      const medName = dose.medicationId ? dose.medicationId.name : "a medication";
      await notifyCaregivers(
        dose.patientId,
        "missed-dose",
        `Missed dose: ${medName} scheduled at ${dose.scheduledTime.toLocaleTimeString()}`,
        dose.medicationId ? dose.medicationId._id : undefined
      );
      console.log(`Dose auto-marked missed: ${medName} for patient ${dose.patientId}`);
    }
  } catch (err) {
    console.error("checkMissedDoses error:", err.message);
  }
};

// Checks refill thresholds: for each active medication, estimate days
// remaining (pillsRemaining / dailyDosageCount) and alert caregivers once
// per day if it's at or below the configured threshold.
const checkRefillLevels = async () => {
  try {
    const medications = await Medication.find({ isActive: true });

    for (const medication of medications) {
      const dailyCount = medication.dailyDosageCount || 1;
      const daysRemaining = medication.pillsRemaining / dailyCount;

      if (daysRemaining <= medication.refillThreshold) {
        // Avoid spamming: only alert if we haven't already sent a refill
        // alert for this medication in the last 24 hours.
        const recentAlert = await AlertLog.findOne({
          medicationId: medication._id,
          type: "refill",
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        });

        if (!recentAlert) {
          await notifyCaregivers(
            medication.patientId,
            "refill",
            `${medication.name} is running low: about ${Math.floor(daysRemaining)} day(s) of pills remaining`,
            medication._id
          );
          console.log(`Refill alert sent for ${medication.name}`);
        }
      }
    }
  } catch (err) {
    console.error("checkRefillLevels error:", err.message);
  }
};

// Starts all scheduled jobs. Called once from server.js on startup.
const startScheduler = () => {
  // Every minute: check for doses due right now
  cron.schedule("* * * * *", checkDueDoses);

  // Every 5 minutes: check for overdue pending doses to mark missed
  cron.schedule("*/5 * * * *", checkMissedDoses);

  // Once a day at 9am: check refill levels
  cron.schedule("0 9 * * *", checkRefillLevels);

  console.log("Scheduler started: dose checks (every min), missed-dose checks (every 5 min), refill checks (daily 9am)");
};

module.exports = { startScheduler, checkDueDoses, checkMissedDoses, checkRefillLevels };
