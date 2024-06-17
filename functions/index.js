const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.createUser = functions.https.onCall(async (data, context) => {
  const {
    email,
    password,
    role,
    firstName,
    middleName,
    lastName,
    idNumber,
    section,
  } = data;

  try {
    // Create user with email and password
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
    });

    // Set custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, {role: role});

    // Add user details to Firestore
    const userDoc = admin.firestore().doc(`Users/${userRecord.uid}`);
    await userDoc.set({
      email: email,
      idNumber: idNumber,
      role: role,
      name: {
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
      },
      section: section,
      userId: userRecord.uid,
      fcmToken: "",
    });

    return {status: "success", uid: userRecord.uid};
  } catch (error) {
    console.error("Error creating new user:", error);
    return {status: "error", message: error.message};
  }
});

exports.deleteUser = functions.https.onCall(async (data, context) => {
  const {userId} = data;

  if (
    !context.auth || !context.auth.token || context.auth.token.role !== "admin"
  ) {
    // Only allow users with 'admin' role to delete accounts
    throw new functions.https.HttpsError(
        "permission-denied",
        "Only admins can delete users",
    );
  }

  try {
    // Delete user document from Firestore
    await admin.firestore().doc(`Users/${userId}`).delete();

    // Delete user from Firebase Authentication
    await admin.auth().deleteUser(userId);

    return {status: "success"};
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new functions.https.HttpsError("unknown", "Error deleting user");
  }
});

exports.notifyStudentsForAttendance = functions.firestore
    .document(
        "Subjects/{subjectDocId}/classList/{studentId}/attendanceLedger/{date}")
    .onWrite(async (change, context) => {
      /* eslint-disable no-unused-vars */
      const subjectDocId = context.params.subjectDocId;
      /* eslint-enable no-unused-vars */
      const studentId = context.params.studentId;
      const date = context.params.date;

      const attendanceDoc = change.after.exists ? change.after.data() : null;

      if (!attendanceDoc || !attendanceDoc.subjectDocId) {
        console.log("No attendance document or subjectDocId found.");
        return;
      }

      // Get student user document
      const userDoc = await admin.firestore().collection("Users").
          doc(studentId).get();
      const userData = userDoc.data();

      if (userData && userData.fcmToken) {
        const message = {
          notification: {
            title: "Attendance Reminder",
            body: `Please mark your attendance for ${date}`,
          },
          token: userData.fcmToken,
        };

        try {
          await admin.messaging().send(message);
          console.log(`Notification sent to ${studentId}`);
        } catch (error) {
          console.error("Error sending notification:", error);
        }
      }
    });
