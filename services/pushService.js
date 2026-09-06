const admin = require("firebase-admin");

// Initialize Firebase Admin SDK once, using the service account JSON
// downloaded from Firebase Console -> Project Settings -> Service Accounts.
// The path to that file is set via FIREBASE_SERVICE_ACCOUNT_PATH in .env.
// We guard initialization so this file can be required multiple times
// without crashing the app.
let firebaseInitialized = false;

const initFirebase = () => {
  if (firebaseInitialized) return;

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!serviceAccountPath) {
    console.warn(
      "FIREBASE_SERVICE_ACCOUNT_PATH not set - push notifications will be skipped. " +
        "Add it to .env once you've downloaded your Firebase service account key."
    );
    return;
  }

  try {
    const serviceAccount = require(serviceAccountPath);
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
