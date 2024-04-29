import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC5ejxQ-A3BX7RdaiaAWEkgli5iuRjcz-s",
  authDomain: "preface-b43fc.firebaseapp.com",
  databaseURL: "https://preface-b43fc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "preface-b43fc",
  storageBucket: "preface-b43fc.appspot.com",
  messagingSenderId: "600568954766",
  appId: "1:600568954766:web:ebcb36eb5047a130c1eedf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)

export { app, auth }
