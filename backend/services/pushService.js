const admin = require("firebase-admin");

// Initialize Firebase Admin SDK once, using the service account JSON
// downloaded from Firebase Console -> Project Settings -> Service Accounts.
//
// Two ways to provide it (checked in this order):
//  1. FIREBASE_SERVICE_ACCOUNT_JSON - the *entire* service account JSON
//     pasted as a single-line env var. Use this on hosts like Railway
//     that don't support uploading secret files.
//  2. FIREBASE_SERVICE_ACCOUNT_PATH - a path to the JSON file on disk.
//     Use this for local dev, or hosts (like Render) with a "secret
//     files" feature.
//
// We guard initialization so this file can be required multiple times
// without crashing the app.
let firebaseInitialized = false;

const initFirebase = () => {
  if (firebaseInitialized) return;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  let serviceAccount;
  try {
    if (serviceAccountJson) {
      serviceAccount = JSON.parse(serviceAccountJson);
    } else if (serviceAccountPath) {
      serviceAccount = require(serviceAccountPath);
    } else {
      console.warn(
        "Neither FIREBASE_SERVICE_ACCOUNT_JSON nor FIREBASE_SERVICE_ACCOUNT_PATH is set - " +
          "push notifications will be skipped."
      );
      return;
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseInitialized = true;
    console.log("Firebase Admin initialized for push notifications");
  } catch (err) {
    console.error("Failed to initialize Firebase Admin:", err.message);
  }
};

initFirebase();

// Sends a push notification to a single device token.
// `token` is the FCM device token the mobile app registers on login
// (stored on the User document as `fcmToken`).
// Returns true/false so the caller (reminderDispatcher) can log/retry.
const sendPushNotification = async (token, title, body, data = {}) => {
  if (!firebaseInitialized) {
    console.warn("Push skipped - Firebase not initialized. Check FIREBASE_SERVICE_ACCOUNT_PATH.");
    return false;
  }
  if (!token) {
    console.warn("Push skipped - patient has no fcmToken registered yet.");
    return false;
  }

  try {
    await admin.messaging().send({
      token,
      notification: { title, body },
      // `data` payload lets the app know which dose this is about,
      // so tapping the notification can open the right screen.
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
      android: {
        priority: "high", // ensures delivery even in Doze/battery-saver mode
      },
    });
    return true;
  } catch (err) {
    console.error("Push notification failed:", err.message);
    return false;
  }
};

module.exports = { sendPushNotification };
