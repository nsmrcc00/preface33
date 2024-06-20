import { doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { auth, db, functions } from "./firebase";
import { getMessaging, getToken } from "firebase/messaging";
import {
  /*createUserWithEmailAndPassword,*/
  signInWithEmailAndPassword,
  updatePassword,
  deleteUser
} from "firebase/auth";

export const doCreateUserWithEmailAndPassword = async (email, password, role, firstName, middleName, lastName, idNumber, section, status, macAddress) => {
  const createUser = httpsCallable(functions, 'createUser');

  const result = await createUser({
    email, password, role, firstName, middleName, lastName, idNumber, section, status, macAddress
  });

  return result.data;
};

export const doSignInWithEmailAndPassword = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const doSignOut = () => {
  return auth.signOut();
};

export const doPasswordChange = (password) => {
  return updatePassword(auth.currentUser, password);
};

export const doDeleteUser = async (userId) => {
  const deleteUser = httpsCallable(functions, "deleteUser");

  try {
    const result = await deleteUser({ userId });
    console.log(`User with ID ${userId} deleted successfully`);
    return result.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const doUpdateUser = async (userId, email, firstName, middleName, lastName, idNumber, section, status, macAddress) => {
  const userDocRef = doc(db, "Users", userId);

  await updateDoc(userDocRef, {
    email: email,
    idNumber: idNumber,
    name: {
      firstName: firstName,
      middleName: middleName,
      lastName: lastName
    },
    macAddress: macAddress || null,
    status: status,
    section: section // Include section here
  });

  return true;
};

export async function updateFcmToken(userId) {
  const messaging = getMessaging();

  try {
    const token = await getToken(messaging, { vapidKey: "***REMOVED***" }); // Replace with your VAPID key
    const userDocRef = doc(db, "Users", userId);
    await updateDoc(userDocRef, { fcmToken: token });
    console.log("FCM token updated successfully");
  } catch (error) {
    console.error("Error updating FCM token:", error);
  }
}

/*

import { getFunctions, httpsCallable } from "firebase/functions";
import { doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase"; // ensure firestore is correctly imported
import {
  signInWithEmailAndPassword,
  updatePassword,
  deleteUser
} from "firebase/auth";

export const doCreateUserWithEmailAndPassword = async (email, password, role, firstName, middleName, lastName, idNumber, section) => {
  const functions = getFunctions();
  const createUser = httpsCallable(functions, 'createUser');
  const result = await createUser({
    email,
    password,
    role,
    firstName,
    middleName,
    lastName,
    idNumber,
    section
  });

  if (result.data.status === 'success') {
    return result.data;
  } else {
    throw new Error(result.data.message);
  }
};

export const doSignInWithEmailAndPassword = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const doSignOut = () => {
  return auth.signOut();
};

export const doPasswordChange = (password) => {
  return updatePassword(auth.currentUser, password);
};

export const doDeleteUser = async (userId) => {
  const user = auth.currentUser;
  if (user) {
    // Ensure the user is authenticated
    try {
      // Delete the user's document from Firestore
      await deleteDoc(doc(db, "Users", userId));
      console.log(`User document with ID ${userId} deleted from Firestore`);
  
      // Delete the user from Firebase Authentication
      await deleteUser(user);
      console.log(`User with ID ${userId} deleted from Firebase Authentication`);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  } else {
    console.error("No authenticated user found");
  }
};

export const doUpdateUser = async (userId, email, firstName, middleName, lastName, idNumber, section) => {
  const userDocRef = doc(db, "Users", userId);

  await updateDoc(userDocRef, {
    email: email,
    idNumber: idNumber,
    name: {
      firstName: firstName,
      middleName: middleName,
      lastName: lastName
    },
    section: section // Include section here
  });

  return true;
};
*/


/*





export const doDeleteUser = async (userId) => {
  const user = auth.currentUser;

  if (user && user.uid === userId) {
    // Delete user from Firestore
    await deleteDoc(doc(db, "Users", userId));

    // Delete user from Authentication
    await deleteUser(user);

    return true;
  } else {
    throw new Error("User not authenticated or incorrect user ID");
  }
};



import { auth } from "./firebase";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    updatePassword 
} from "firebase/auth";

export const doCreateUserWithEmailAndPassword = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

export const doSignInWithEmailAndPassword = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
};

export const doSignOut = () => {
    return auth.signOut();
};

export const doPasswordChange = (password) => {
    return updatePassword(auth.currentUser, password);
};


*/