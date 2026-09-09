const twilio = require("twilio");
const VoiceResponse = twilio.twiml.VoiceResponse;

const getTwilioClient = () => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    console.warn("Twilio credentials missing - voice calls will be skipped.");
    return null;
  }
  return twilio(sid, token);
};

// Triggers an outbound call to the patient's phone. Twilio will call
// BACKEND_PUBLIC_URL/api/voice/ivr/:doseLogId to fetch the TwiML that
// actually plays the message and IVR menu (see ivrHandler below).
// BACKEND_PUBLIC_URL must be a publicly reachable URL - use ngrok during
// development since Twilio can't reach localhost directly.
const triggerReminderCall = async (toPhone, doseLogId) => {
  const client = getTwilioClient();
  if (!client) return false;

  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  const publicUrl = process.env.BACKEND_PUBLIC_URL;
  if (!fromNumber || !publicUrl) {
    console.warn("TWILIO_PHONE_NUMBER or BACKEND_PUBLIC_URL not set - voice call skipped.");
    return false;
  }

  try {
    await client.calls.create({
      to: toPhone,
      from: fromNumber,
      url: `${publicUrl}/api/voice/ivr/${doseLogId}`,
      // Twilio calls this URL again if we don't get a keypress/speech
      // response, so we can mark the dose missed after retries.
      statusCallback: `${publicUrl}/api/voice/status/${doseLogId}`,
      statusCallbackEvent: ["completed", "no-answer", "failed"],
    });
    return true;
  } catch (err) {
    console.error("Voice call failed:", err.message);
    return false;
  }
};

// Builds the TwiML for the first call: plays the reminder message, then
// gathers a keypress (1 = taken, 2 = request callback) OR spoken response.
// Keeping keypad AND speech as fallbacks makes this usable for both
// feature-phone users (keypad only) and smartphone users calling in.
const buildIvrMenu = (medicationName, dosage, language = "en", doseLogId) => {
  const twiml = new VoiceResponse();

  const message =
    language === "te"
      ? `ఇది మీ మందు తీసుకునే సమయం. ${medicationName}, ${dosage}. తీసుకున్నట్లయితే 1 నొక్కండి. కాల్‌బ్యాక్ కావాలంటే 2 నొక్కండి.`
      : `It's time to take your medicine: ${medicationName}, ${dosage}. Press 1 if you've taken it. Press 2 to request a callback.`;

  const gather = twiml.gather({
    numDigits: 1,
    action: `/api/voice/ivr-response/${doseLogId}`, // must match voiceRoutes.js path exactly
    method: "POST",
    // input "speech" lets the patient just say "yes"/"taken" instead of
    // pressing a key - transcription happens on Twilio's side via
    // <Gather> speech recognition, kept simple (no separate STT call
    // needed for this basic keyword case).
    input: "dtmf speech",
    speechTimeout: "auto",
    language: language === "te" ? "te-IN" : "en-IN",
  });
  gather.say({ language: language === "te" ? "te-IN" : "en-IN" }, message);

  // If there's no input at all, repeat once then hang up - the missed-dose
  // scheduler check will pick this up as still "pending" and mark it missed.
  twiml.say(
    language === "te" ? "మీ నుండి స్పందన రాలేదు. వీడ్కోలు." : "We didn't get a response. Goodbye."
  );
  twiml.hangup();

  return twiml.toString();
};

// Builds the TwiML response after the patient presses a key or speaks.
// This is intentionally simple keypad logic; the more advanced speech ->
// Claude intent classification path is handled in intentService.js and
// only used when the caller's speech doesn't match a clear digit press.
const buildIvrConfirmation = (digitsOrSpeech, language = "en") => {
  const twiml = new VoiceResponse();
  const said = (digitsOrSpeech || "").toString().toLowerCase();

  const takenWords = ["1", "yes", "taken", "తీసుకున్నాను"];
  const callbackWords = ["2", "callback", "కాల్"];

  let message;
  if (takenWords.some((w) => said.includes(w))) {
    message = language === "te" ? "ధన్యవాదాలు. మంచి రోజు!" : "Thank you. Have a good day!";
  } else if (callbackWords.some((w) => said.includes(w))) {
    message =
      language === "te"
        ? "మీ కేర్‌గివర్‌కు కాల్‌బ్యాక్ అభ్యర్థన పంపబడింది."
        : "A callback request has been sent to your caregiver.";
  } else {
    message = language === "te" ? "అర్థం కాలేదు. వీడ్కోలు." : "Sorry, we didn't understand. Goodbye.";
  }

  twiml.say({ language: language === "te" ? "te-IN" : "en-IN" }, message);
  twiml.hangup();
  return twiml.toString();
};

module.exports = { triggerReminderCall, buildIvrMenu, buildIvrConfirmation };
