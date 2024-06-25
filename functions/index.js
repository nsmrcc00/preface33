const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

admin.initializeApp();
const db = admin.firestore();


// Define region
const region = "asia-southeast1";

const createNotifications = async () => {
  try {
    const usersSnapshot = await db
        .collection("Users")
        .where("role", "==", "instructor")
        .get();
    usersSnapshot.forEach(async (userDoc) => {
      const userId = userDoc.id;
      const subjectsSnapshot = await db
          .collection("Users")
          .doc(userId)
          .collection("subjectsHandled")
          .get();
      subjectsSnapshot.forEach(async (subjectDoc) => {
        const subjectId = subjectDoc.id;
        const subjectData = await admin.firestore()
            .collection("Subjects")
            .doc(subjectId)
            .get();
        const subjectTitle = subjectData.data().title;
        const classListSnapshot = await db
            .collection("Subjects")
            .doc(subjectId)
            .collection("classList")
            .get();
        classListSnapshot.forEach(async (studentDoc) => {
          const studentId = studentDoc.id;
          const studentName = studentDoc.data().name;
          const attendanceLedgerSnapshot = await db
              .collection("Subjects")
              .doc(subjectId)
              .collection("classList")
              .doc(studentId)
              .collection("attendanceLedger")
              .get();

          let totalClasses = 0;
          let absences = 0;
          let lates = 0;
          attendanceLedgerSnapshot.forEach((attendanceDoc) => {
            totalClasses++;
            const status = attendanceDoc.data().status;
            if (status === "Absent") {
              absences++;
            } else if (status === "Late") {
              lates++;
            }
          });

          const absencePercentage = (absences / totalClasses) * 100;
          const latePercentage = (lates / totalClasses) * 100;

          const notificationsRef = db
              .collection("Users")
              .doc(userId)
              .collection("Notifications");

          if (absencePercentage > 50 || latePercentage > 50 || absences >= 3) {
            const notificationMessage =
              absences >= 3 ? `${studentName} has reached the maximum 
              amount of total absences in ${subjectTitle}.` :
              `${studentName} has a high percentage of absences 
              (${absencePercentage.toFixed(2)}%) 
              and/or lates (${latePercentage.toFixed(2)}%)
              in ${subjectTitle}.`;

            await notificationsRef.add({
              title: "Attendance Alert",
              message: notificationMessage,
              visible: true,
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
        });
      });
    });
    console.log("Notifications created successfully");
  } catch (error) {
    console.error("Error creating notifications:", error);
  }
};

exports.createUser = functions.region(region).https.onCall(
    async (data, context) => {
      const {
        email,
        password,
        role,
        firstName,
        middleName,
        lastName,
        idNumber,
        section,
        status,
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
          status: status,
          fcmToken: "",
        });

        return {status: "success", uid: userRecord.uid};
      } catch (error) {
        console.error("Error creating new user:", error);
        return {status: "error", message: error.message};
      }
    });

exports.deleteUser = functions.region(region).https.onCall(
    async (data, context) => {
      const {userId} = data;
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

exports.sendNotification = functions.region(region).https.onRequest(
    (req, res) => {
      cors(req, res, async () => {
        if (req.method !== "POST") {
          return res.status(405).send("Method Not Allowed");
        }

        const {tokens, title, body} = req.body;

        if (!tokens || !title || !body) {
          return res.status(400).send(
              "Bad Request: Missing tokens, title, or body");
        }

        const message = {
          notification: {
            title: title,
            body: body,
          },
          tokens: tokens,
        };

        try {
          const response = await admin.messaging().sendMulticast(message);
          return res.status(200).send(response);
        } catch (error) {
          console.error("Error sending notification:", error);
          return res.status(500).send(error);
        }
      });
    });

exports.createWeeklyNotifications = functions.region(region).
    pubsub.schedule("every sunday 00:00").onRun(async (context) => {
      await createNotifications();
    });

exports.createNotificationsManually = functions
    .region(region)
    .https.onRequest(async (req, res) => {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "GET, POST");
      res.set("Access-Control-Allow-Headers", "Content-Type");

      // Handle OPTIONS preflight request
      if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
      }
      await createNotifications();
      res.status(200).send("Notifications created manually");
    });

exports.updateClassListWithFcmToken = functions
    .region(region)
    .firestore.document("Users/{userId}")
    .onWrite(async (change, context) => {
      const userId = context.params.userId;

      // Get the user document data
      const userData = change.after.exists ? change.after.data() : null;

      if (userData) {
        const fcmToken = userData.fcmToken;

        if (fcmToken) {
          // Query for the matching classList document
          const subjectsSnapshot = await admin
              .firestore()
              .collection("Subjects")
              .get();

          subjectsSnapshot.forEach(async (subjectDoc) => {
            const classListRef = subjectDoc.ref.collection("classList");
            const classListSnapshot = await classListRef
                .where("uid", "==", userId)
                .get();

            classListSnapshot.forEach(async (classListDoc) => {
              // Update the classList document with the fcmToken
              await classListDoc.ref.update({
                fcmToken: fcmToken,
              });
            });
          });
        }
      }

      return null;
    });
