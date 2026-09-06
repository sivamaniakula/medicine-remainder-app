const twilio = require("twilio");

// Twilio client is created lazily (only when actually needed) so the
// server doesn't crash on startup if Twilio credentials aren't set yet -
// useful while you're still setting up your Twilio account.
const getTwilioClient = () => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    console.warn("Twilio credentials missing - WhatsApp messages will be skipped.");
    return null;
  }
  return twilio(sid, token);
};

// Sends a WhatsApp reminder via Twilio's WhatsApp Sandbox (dev) or a
// production WhatsApp-enabled Twilio number.
// `toPhone` must be in E.164 format, e.g. +919876543210
const sendWhatsAppReminder = async (toPhone, medicationName, dosage, language = "en") => {
  const client = getTwilioClient();
  if (!client) return false;

  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER; // e.g. "whatsapp:+14155238886" (sandbox default)
  if (!fromNumber) {
    console.warn("TWILIO_WHATSAPP_NUMBER not set - add it to .env after enabling the WhatsApp sandbox.");
    return false;
  }

  try {
    // NOTE: Twilio's WhatsApp Sandbox (free trial) only allows business-
    // initiated messages sent via one of its 3 pre-approved Content
    // templates, referenced by ContentSid + contentVariables - a plain
    // `body` string is rejected outright. This is the sandbox's built-in
    // "Appointment Reminders" template (ContentSid HXb5b62575e6e4ff6129ad7c8efe1f983e):
    // "Your appointment is coming up on {{1}} at {{2}}". We reuse its two
    // slots to carry the medication name+dosage and reminder context
    // until a real WhatsApp sender is registered and approved.
    await client.messages.create({
      from: fromNumber,
      to: `whatsapp:${toPhone}`,
      contentSid: "HXb5b62575e6e4ff6129ad7c8efe1f983e",
      contentVariables: JSON.stringify({
        1: `${medicationName} ${dosage}`,
        2: "now",
      }),
    });
    return true;
  } catch (err) {
    console.error("WhatsApp send failed:", err.message);
    return false;
  }
};

module.exports = { sendWhatsAppReminder };