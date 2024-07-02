/* eslint-disable require-jsdoc */
const admin = require("firebase-admin");
const serviceAccount = require("./appConfig.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function processExistingUsers() {
  try {
    // Get all student users
    const usersSnapshot = await db
        .collection("Users")
        .where("role", "==", "student")
        .get();

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const studentSection = userData.section;

      const studentData = {
        name: `${userData.name.firstName} 
        ${userData.name.middleName} ${userData.name.lastName}`,
        idNumber: userData.idNumber,
        section: studentSection,
        uid: userDoc.id,
        ref: admin.firestore().doc(`Users/${userDoc.id}`),
      };

      // Find matching subjects
      const subjectsSnapshot = await db
          .collection("Subjects")
          .where("section", "==", studentSection)
          .get();

      // Add student to each matching subject's classList
      const batch = db.batch();
      for (const subjectDoc of subjectsSnapshot.docs) {
        const newClassListRef = subjectDoc.ref.collection("classList").doc();
        batch.set(newClassListRef, studentData);
      }

      // Commit the batch
      await batch.commit();
      console.log(`Processed user ${userDoc.id}`);
    }

    console.log("Finished processing all existing users");
  } catch (error) {
    console.error("Error processing existing users:", error);
  }
}

// Run the function
processExistingUsers()
    .then(() => {
      console.log("Script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Script failed:", error);
      process.exit(1);
    });
