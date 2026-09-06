const DoseLog = require("../models/DoseLog");
const Medication = require("../models/Medication");
const User = require("../models/User");
const AlertLog = require("../models/AlertLog");
const { buildIvrMenu, buildIvrConfirmation } = require("../services/voiceService");

// GET/POST /api/voice/ivr/:doseLogId
// Twilio calls this URL when the patient answers the phone. We fetch the
// dose + medication so the message says the right name/dosage, then
// return TwiML (XML) that Twilio's voice engine plays.
const ivrHandler = async (req, res) => {
  try {
    const dose = await DoseLog.findById(req.params.doseLogId).populate("medicationId", "name dosage");
    const patient = dose ? await User.findById(dose.patientId) : null;
    const language = patient?.preferredLanguage || "en";

    if (!dose || !dose.medicationId) {
      // Fallback TwiML if something's missing - avoids Twilio erroring out
      res.type("text/xml");
      return res.send(
        `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Sorry, we could not find your reminder details.</Say></Response>`
      );
    }

    const twiml = buildIvrMenu(dose.medicationId.name, dose.medicationId.dosage, language, dose._id);
    res.type("text/xml");
    return res.send(twiml);
  } catch (err) {
    console.error("IVR handler error:", err.message);
    res.type("text/xml");
    return res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>An error occurred.</Say></Response>`);
  }
};

// POST /api/voice/ivr-response/:doseLogId
// Twilio calls this after the patient presses a key or speaks, with
// Digits and/or SpeechResult in the request body. We update the dose
// status accordingly and reply with a confirmation TwiML message.
const ivrResponseHandler = async (req, res) => {
  try {
    const { Digits, SpeechResult } = req.body;
    const input = Digits || SpeechResult || "";

    const dose = await DoseLog.findById(req.params.doseLogId);
    const patient = dose ? await User.findById(dose.patientId) : null;
    const language = patient?.preferredLanguage || "en";

    if (dose) {
      const said = input.toLowerCase();
      if (said.includes("1") || said.includes("yes") || said.includes("taken")) {
        dose.status = "taken";
        dose.actualTime = new Date();
        dose.responseChannel = "voice";
        await dose.save();

        const medication = await Medication.findById(dose.medicationId);
        if (medication && medication.pillsRemaining > 0) {
          medication.pillsRemaining -= 1;
          await medication.save();
        }
      } else if (said.includes("2") || said.includes("callback")) {
        // Log a callback-request alert for all linked caregivers.
        await AlertLog.create({
          patientId: dose.patientId,
          type: "callback-request",
          timestamp: new Date(),
          resolved: false,
        });
      }
    }

    const twiml = buildIvrConfirmation(input, language);
    res.type("text/xml");
    return res.send(twiml);
  } catch (err) {
    console.error("IVR response handler error:", err.message);
    res.type("text/xml");
    return res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>An error occurred.</Say></Response>`);
  }
};

// POST /api/voice/status/:doseLogId
// Twilio calls this when the call finishes/fails/goes unanswered.
// We don't mark the dose missed here directly - the scheduler's
// missed-dose check (every 5 min) already handles that consistently
// across all channels, so this just logs the outcome for debugging.
const statusCallbackHandler = async (req, res) => {
  console.log(`Call status for dose ${req.params.doseLogId}:`, req.body.CallStatus);
  res.sendStatus(200);
};

module.exports = { ivrHandler, ivrResponseHandler, statusCallbackHandler };
