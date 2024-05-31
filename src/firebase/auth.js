import { doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase"; // ensure firestore is correctly imported
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    updatePassword,
    deleteUser 
} from "firebase/auth";


export const doCreateUserWithEmailAndPassword = async (email, password, role, firstName, middleName, lastName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await setDoc(doc(db, "Users", user.uid), {
    email: email,
    idNumber: idNumber,
    role: role,
    name: {
      firstName: firstName,
      middleName: middleName,
      lastName: lastName
    },
    userId: user.uid
  });

  return userCredential;
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

export const doUpdateUser = async (userId, email, firstName, middleName, lastName, idNumber) => {
const userDocRef = doc(db, "Users", userId);

await updateDoc(userDocRef, {
    email: email,
    idNumber: idNumber,
    name: {
    firstName: firstName,
    middleName: middleName,
    lastName: lastName
    }
});

return true;
};
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