const User = require("../models/User");
const Medication = require("../models/Medication");
const { sendPushNotification } = require("./pushService");
const { sendWhatsAppReminder } = require("./whatsappService");
const { triggerReminderCall } = require("./voiceService");
const { sendSmsReminder } = require("./smsService");

const dispatchReminder = async (doseLog) => {
  try {
    const [patient, medication] = await Promise.all([
      User.findById(doseLog.patientId),
      Medication.findById(doseLog.medicationId),
    ]);

    if (!patient || !medication) {
      console.warn("Dispatch skipped - missing patient or medication for dose " + doseLog._id);
      return;
    }

    const channel = patient.preferredChannel || "app";

    switch (channel) {
      case "app":
        await sendPushNotification(
          patient.fcmToken,
          "Medicine reminder",
          "Time to take " + medication.name + " (" + medication.dosage + ")",
          { doseLogId: doseLog._id.toString(), medicationId: medication._id.toString() }
        );
        break;

      case "whatsapp":
        await sendWhatsAppReminder(patient.phone, medication.name, medication.dosage, patient.preferredLanguage);
        break;

      case "voice":
        await triggerReminderCall(patient.phone, doseLog._id.toString());
        break;

      case "sms":
        await sendSmsReminder(patient.phone, medication.name, medication.dosage, patient.preferredLanguage);
        break;

      default:
        console.warn("Unknown preferredChannel \"" + channel + "\" for patient " + patient._id + " - defaulting to push");
        await sendPushNotification(
          patient.fcmToken,
          "Medicine reminder",
          "Time to take " + medication.name + " (" + medication.dosage + ")"
        );
    }
  } catch (err) {
    console.error("Reminder dispatch failed:", err.message);
  }
};

module.exports = { dispatchReminder };
