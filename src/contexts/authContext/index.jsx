import React, { useContext, useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [isPasswordChangeRequired, setIsPasswordChangeRequired] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "Users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userRole = userData.role;

            setRole(userRole);
            if (userRole !== "admin" && userRole !== "instructor") {
              setIsUnauthorized(true);
            } else {
              setIsUnauthorized(false);
              if (!userData.Passchange) {
                setIsPasswordChangeRequired(true);
              } else {
                setIsPasswordChangeRequired(false);
              }
            }
          } else {
            // Handle case where user document does not exist
            setRole(null);
            setIsUnauthorized(true);
            setIsPasswordChangeRequired(false);
          }
          setCurrentUser(user);
          setUserLoggedIn(true);
        } catch (error) {
          console.error("Error fetching user role:", error);
          setRole(null);
          setIsUnauthorized(true);
          setIsPasswordChangeRequired(false);
        }
      } else {
        setCurrentUser(null);
        setUserLoggedIn(false);
        setRole(null);
        setIsUnauthorized(false);
        setIsPasswordChangeRequired(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    userLoggedIn,
    currentUser,
    role,
    isPasswordChangeRequired,
    setIsPasswordChangeRequired, // Expose this function
    isUnauthorized,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
