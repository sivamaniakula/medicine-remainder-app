# Bundle B — Backend Notes (Reminder Channels)

This adds the three reminder channels on top of Bundle A: push notifications
(FCM), WhatsApp (Twilio), and voice calls with IVR (Twilio Voice).

## What's new

- `services/pushService.js` — sends FCM push notifications via Firebase Admin SDK
- `services/whatsappService.js` — sends WhatsApp messages via Twilio
- `services/voiceService.js` — triggers Twilio voice calls and builds the IVR TwiML
- `controllers/voiceController.js` + `routes/voiceRoutes.js` — handles Twilio's
  webhook calls when a patient answers, presses a key, or speaks
- `services/reminderDispatcher.js` — looks at each patient's `preferredChannel`
  and calls the matching service above
- `schedulerService.js` — updated to call `dispatchReminder()` right after
  creating each dose log, so reminders actually fire automatically
- `models/User.js` — added `fcmToken` field
- `authController.js` / `authRoutes.js` — added `PATCH /api/auth/fcm-token`
  for the mobile app to register its device token after login

## Required setup before this will actually send anything

1. **Firebase**: download your service account JSON (Firebase Console →
   Project Settings → Service Accounts → Generate new private key), save it
   as `firebase-service-account.json` inside the `backend` folder, and add
   that filename to `.gitignore` (never commit it).

2. **Twilio**: create a free trial account, note your Account SID, Auth
   Token, and Twilio phone number from the Console dashboard.

3. **Twilio WhatsApp Sandbox**: Console → Messaging → Try it out → Send a
   WhatsApp message. This gives you a sandbox number and a join code you
   must send from your own WhatsApp to activate testing.

4. **ngrok (for voice calls only)**: Twilio needs a public URL to call back
   into your local server for the IVR flow. Install ngrok, then run:
   ```
   ngrok http 5000
   ```
   Copy the `https://...ngrok-free.app` URL it prints and paste it into
   `.env` as `BACKEND_PUBLIC_URL`. **This URL changes every time you restart
   ngrok on the free plan** — update `.env` and restart your backend each
   time.

5. Fill in all the new variables in `.env` (copy from `.env.example`).

## Free-tier limits to be aware of (for your viva demo)

- **Twilio trial**: a few dollars of free credit; can only call/message
  phone numbers you've verified in the Twilio Console until you upgrade.
  Verify your own number and any demo phone before testing.
- **Twilio WhatsApp Sandbox**: whoever wants to receive sandbox messages
  must first send the join code to the sandbox number from their WhatsApp.
  This resets periodically — re-join if messages stop arriving.
- **Firebase**: free "Spark" plan easily covers FCM push for a project this
  size — no action needed.
- **ngrok free plan**: URL changes on every restart, and free sessions can
  time out after a few hours — restart it and update `.env` before a demo.

## How to test each channel

1. In the caregiver dashboard, edit a patient's preferred channel (you may
   need to add a small "channel" dropdown to the patient link/profile if it
   isn't already exposed in Bundle A's UI — currently `preferredChannel`
   defaults to `"app"` for every patient).
2. Add a medication with a time 1–2 minutes away.
3. Watch the backend terminal:
   - `app` channel: look for the push service log lines (success/warning)
   - `whatsapp` channel: check the patient's WhatsApp for the message
   - `voice` channel: the patient's phone should ring within a minute
4. For voice: press 1 (taken) or 2 (callback request) on the call, or just
   say "yes" — check the dose status updates in the dashboard afterward.

## Known limitation carried over

Patients don't yet have a mobile app screen to set their own preferred
channel or language — that's the caregiver's job via the dashboard for now.
The mobile app (next piece) lets the *patient* view today's doses and mark
them taken directly, in addition to receiving push reminders.
