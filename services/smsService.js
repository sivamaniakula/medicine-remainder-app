const twilio = require("twilio");

const getTwilioClient = () => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    console.warn("Twilio credentials missing - SMS will be skipped.");
    return null;
  }
  return twilio(sid, token);
};

const sendSmsReminder = async (toPhone, medicationName, dosage, language) => {
  language = language || "en";
  const client = getTwilioClient();
  if (!client) return false;

  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!fromNumber) {
    console.warn("TWILIO_PHONE_NUMBER not set - SMS skipped.");
    return false;
  }

  const body = language === "te"
    ? ("Time to take your medicine (Telugu): " + medicationName + ", " + dosage)
    : ("Time to take your medicine: " + medicationName + ", " + dosage);

  try {
    await client.messages.create({ to: toPhone, from: fromNumber, body: body });
    return true;
  } catch (err) {
    console.error("SMS send failed:", err.message);
    return false;
  }
};

module.exports = { sendSmsReminder };
