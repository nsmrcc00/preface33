/* eslint-disable require-jsdoc */
const admin = require("firebase-admin");
const serviceAccount = require("./appConfig.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();

async function updateExistingFcmTokens() {
  try {
    // Get all user documents
    const usersSnapshot = await firestore.collection("Users").get();
    if (usersSnapshot.empty) {
      console.log("No matching documents.");
      return;
    }

    // Iterate over each user document
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userData.userId;
      const fcmToken = userData.fcmToken;

      if (fcmToken) {
        // Query for the matching classList document
        const subjectsSnapshot = await firestore.collection("Subjects").get();

        for (const subjectDoc of subjectsSnapshot.docs) {
          const classListRef = subjectDoc.ref.collection("classList");
          const classListSnapshot = await classListRef
              .where("uid", "==", userId)
              .get();

          for (const classListDoc of classListSnapshot.docs) {
            // Update the classList document with the fcmToken
            await classListDoc.ref.update({
              fcmToken: fcmToken,
            });
          }
        }
      }
    }

    console.log("Successfully updated existing fcmTokens.");
  } catch (error) {
    console.error("Error updating fcmTokens:", error);
  }
}

// Run the script
updateExistingFcmTokens();
