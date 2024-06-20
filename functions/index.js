const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

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

exports.deleteUser = functions.https.onCall(async (data, context) => {
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

exports.sendNotification = functions.https.onRequest((req, res) => {
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
