# Bundle A — Backend additions (Medication CRUD, Scheduling, Dose Logging, Refill Tracking)

## What's new in this zip

New folders/files added to your existing `backend/`:
- `models/Medication.js`
- `models/DoseLog.js`
- `models/AlertLog.js`
- `models/CaregiverPatientLink.js`
- `controllers/medicationController.js`
- `controllers/doseController.js`
- `controllers/alertController.js`
- `controllers/linkController.js`
- `routes/medicationRoutes.js`
- `routes/doseRoutes.js`
- `routes/alertRoutes.js`
- `routes/linkRoutes.js`
- `services/schedulerService.js` — the node-cron scheduling engine
- `utils/accessControl.js` — shared helper to check caregiver-patient access

**Files that were REPLACED (not just added) — back up your own edits first if you made any:**
- `server.js` — now mounts the new routes and starts the scheduler on boot
- `package.json` — added the `node-cron` dependency

## How to merge this into your existing project

1. Extract this zip.
2. Copy everything inside `backend/` here into your existing `medicine-reminder-app/backend/` folder, allowing it to merge/overwrite `server.js` and `package.json`.
3. In your terminal (inside `backend`), run:
   ```
   npm install
   ```
   This pulls in `node-cron`, the new dependency.
4. Restart the server:
   ```
   npm run dev
   ```
   You should see the usual `MongoDB connected successfully` + `Server running...` lines, plus a new line:
   ```
   Scheduler started: dose checks (every min), missed-dose checks (every 5 min), refill checks (daily 9am)
   ```

## New API routes

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/links` | Caregiver links a patient by phone number |
| GET | `/api/links/patients` | Caregiver lists their linked patients |
| POST | `/api/medications` | Create a medication |
| GET | `/api/medications/patient/:patientId` | List a patient's active medications |
| GET | `/api/medications/:id` | Get one medication |
| PUT | `/api/medications/:id` | Update a medication |
| DELETE | `/api/medications/:id` | Soft-delete (deactivate) a medication |
| GET | `/api/doses/patient/:patientId/today` | Today's dose logs |
| GET | `/api/doses/patient/:patientId/history` | Dose history (supports `?from=&to=`) |
| PATCH | `/api/doses/:id` | Mark a dose taken/missed/skipped |
| GET | `/api/alerts` | Caregiver's alert feed (supports `?resolved=false`) |
| PATCH | `/api/alerts/:id/resolve` | Mark an alert resolved |

All routes require `Authorization: Bearer <token>` except register/login, same as Module 1.

## Testing walkthrough (Postman)

1. **Login as the caregiver** (Lakshmi) — copy the token.
2. **Link the patient**: `POST /api/links` with body `{ "patientPhone": "9876500000" }` (Ramaiah's phone from Module 1 testing) and the caregiver's Bearer token.
3. **Create a medication**: `POST /api/medications` with the caregiver's token, body:
   ```json
   {
     "patientId": "<Ramaiah's _id from register/login response>",
     "name": "Paracetamol",
     "dosage": "500mg",
     "frequency": "twice daily",
     "times": ["09:00", "21:00"],
     "startDate": "2026-09-06",
     "pillsRemaining": 20
   }
   ```
   Tip: to test the scheduler quickly, set one of the `times` to a minute or two in the future in HH:mm 24-hour format matching your server's local time, then watch the terminal — within a minute you should see `Dose log created: ...`.
4. **Check today's doses**: `GET /api/doses/patient/<patientId>/today` with either the caregiver's or the patient's own token.
5. **Mark a dose taken**: `PATCH /api/doses/<doseId>` body `{ "status": "taken" }`. Check that the medication's `pillsRemaining` decreased by 1 (`GET /api/medications/<id>`).
6. **Check alerts**: `GET /api/alerts` with the caregiver's token — after ~20 minutes, any left-pending dose will auto-flip to "missed" and generate an alert here.

## What's intentionally NOT in this bundle
No push notifications, WhatsApp, Twilio, or React Native mobile app yet — those come in Bundle B. This bundle is backend + dashboard only, testable entirely through Postman and the browser.
