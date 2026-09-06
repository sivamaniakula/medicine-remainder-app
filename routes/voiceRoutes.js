const express = require("express");
const router = express.Router();
const { ivrHandler, ivrResponseHandler, statusCallbackHandler } = require("../controllers/voiceController");

// NOTE: these routes are called directly by Twilio's servers, not by our
// own frontend, so they intentionally have NO auth middleware (`protect`).
// Twilio can't send a JWT. Keep these routes narrow in what they do.

router.post("/ivr/:doseLogId", ivrHandler);
router.get("/ivr/:doseLogId", ivrHandler); // Twilio can call with GET or POST depending on config

router.post("/ivr-response/:doseLogId", ivrResponseHandler);

router.post("/status/:doseLogId", statusCallbackHandler);

module.exports = router;
