# Medicine Reminder Backend — Module 1: Auth + User/Role Setup

## Setup

1. Open this `backend` folder in VS Code.
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to a new file called `.env`:
   ```
   cp .env.example .env
   ```
   (On Windows, just duplicate the file manually and rename it.)
4. Fill in `.env` with your real values:
   - `MONGO_URI` — from MongoDB Atlas: Database → Connect → "Connect your application"
   - `JWT_SECRET` — any long random string. Generate one with:
     ```
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - `PORT` — leave as 5000 unless it conflicts with something else.
5. Start the server:
   ```
   npm run dev
   ```
   You should see:
   ```
   MongoDB connected successfully
   Server running on http://localhost:5000
   ```

If MongoDB fails to connect, double-check that your current IP is allow-listed in
Atlas under **Network Access** (or allow access from anywhere, `0.0.0.0/0`, for dev/demo purposes).

## Testing with Postman / Thunder Client

### 1. Register a caregiver
`POST http://localhost:5000/api/auth/register`

Body (JSON):
```json
{
  "name": "Lakshmi",
  "phone": "9876543210",
  "password": "test1234",
  "role": "caregiver",
  "preferredLanguage": "en",
  "preferredChannel": "app"
}
```
Expected: `201 Created`, response includes a `token`.

### 2. Register a patient
Same endpoint, different body:
```json
{
  "name": "Ramaiah",
  "phone": "9876500000",
  "password": "test1234",
  "role": "patient",
  "preferredLanguage": "te",
  "preferredChannel": "voice"
}
```

### 3. Login
`POST http://localhost:5000/api/auth/login`

Body (JSON):
```json
{
  "phone": "9876543210",
  "password": "test1234"
}
```
Expected: `200 OK`, response includes a `token`. Copy this token for the next step.

### 4. Get current user (protected route)
`GET http://localhost:5000/api/auth/me`

Headers:
```
Authorization: Bearer <paste the token from login here>
```
Expected: `200 OK`, returns the logged-in user's info (no password field).

### Error cases to also try
- Registering the same phone number twice → should return `409 Conflict`
- Logging in with wrong password → should return `401 Unauthorized`
- Calling `/api/auth/me` with no token → should return `401 Unauthorized`
- Calling `/api/auth/me` with a garbage/fake token → should return `401 Unauthorized`

## What's next
Once all of the above works and you've committed this to git, move on to
Module 2 (Medication CRUD) — see the main project prompt file for that spec.
