import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase"; // ensure firestore is correctly imported
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    updatePassword 
} from "firebase/auth";


export const doCreateUserWithEmailAndPassword = async (email, password, role, firstName, middleName, lastName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await setDoc(doc(db, "Users", user.uid), {
    email: email,
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
/*
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