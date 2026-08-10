// ============================================================================
// firebaseService.js — Firebase Cloud Messaging Push Notifications
// Owner: Member 1 (Backend Lead)
// When to build: Day 3-4 (STRETCH — build only after SMS works)
// ============================================================================
//
// PURPOSE:
//   Send push notifications to mobile/web clients when a ward reaches
//   Severe or Extreme risk. This is a NICE-TO-HAVE — SMS is the must-have.
//
// WHAT TO BUILD:
//
//   1. Initialize Firebase Admin SDK:
//      const admin = require('firebase-admin');
//      const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
//      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
//
//   2. exports.sendPushNotification = async (topic, wardName, riskTier) => { ... }
//      - Use admin.messaging().send({
//          topic: topic,  // e.g., "ward-AHM-W03" — users subscribe to their ward
//          notification: {
//            title: `🔴 Heat Alert: ${wardName}`,
//            body: `${riskTier} risk level. Seek cooling center immediately.`
//          }
//        })
//      - Return { success: true, messageId }
//
// FALLBACK IF FIREBASE SETUP TAKES TOO LONG:
//   Instead of real push notifications, implement an "in-app toast" approach:
//   - Store alerts in a collection that the frontend polls
//   - Show a toast/banner notification in the React app
//   - This still demonstrates the concept without Firebase setup overhead
//   - Say in your pitch: "In production, this would be a real push notification"
//
// FIREBASE SETUP STEPS:
//   1. Go to Firebase Console → create a project
//   2. Project Settings → Service Accounts → Generate private key
//   3. Save the JSON key file, set path in .env
//   4. Enable Cloud Messaging in the Firebase project
//
// CALLED BY:
//   - riskWatcher.cron.js (alongside twilioService)
//
// ============================================================================
