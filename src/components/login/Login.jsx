import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";
import { doSignInWithEmailAndPassword, updateFcmToken } from "../../firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

const Login = () => {
  const { userLoggedIn, role, isPasswordChangeRequired, isUnauthorized } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const navigate = useNavigate();

  const logIn = async (e) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      try {
        const userCredential = await doSignInWithEmailAndPassword(email, password);
        const userId = userCredential.user.uid;
        const userDoc = await getDoc(doc(db, "Users", userId));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role !== "admin" && userData.role !== "instructor") {
            navigate("/unauthorized"); // Redirect unauthorized users
          } else if (!userData.Passchange) {
            navigate("/change-password"); // Redirect to change password page
          } else {
            // Update FCM token if user has logged in successfully
            await updateFcmToken(userId); // Call function to update FCM token
          }

        } else {
          console.error("No such user document!");
          alert("Error! User document not found.");
        }
      } catch (error) {
        console.error(error);
        alert("Error! Please sign in with valid credentials.");
      }
      setIsSigningIn(false);
    }
  };

  if (userLoggedIn) {
    if (isUnauthorized) {
      return <Navigate to="/unauthorized" replace={true} />;
    }
    if (isPasswordChangeRequired) {
      return <Navigate to="/change-password" replace={true} />;
    }
    if (role === "admin") {
      return <Navigate to="/admin-home" replace={true} />;
    } else if (role === "instructor") {
      return <Navigate to="/instructor-home" replace={true} />;
    } else {
      return <Navigate to="/unauthorized" replace={true} />;
    }
  }

  return (
    <main id="login-page">
      <div className="mb-3 text-center">
        <h1 id="login_heading">PREFACE</h1>
      </div>
      <form id="inputs" onSubmit={logIn}>
        <input
          className="form-control"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="form-control"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="mb-3 text-center">
          <button
            id="gen_btn"
            type="submit"
            disabled={isSigningIn}
            className={`${isSigningIn} btn btn-primary`}
          >
            {isSigningIn ? "Signing In..." : "Sign In"}
          </button>
        </div>
      </form>
    </main>
  );
};

export default Login;
