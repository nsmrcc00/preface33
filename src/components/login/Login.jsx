import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";
import { doSignInWithEmailAndPassword } from "../../firebase/auth";

const Login = () => {
  const { userLoggedIn, role } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const logIn = async (e) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      try {
        await doSignInWithEmailAndPassword(email, password);
        console.log("User logged in successfully");
      } catch (error) {
        console.error(error);
        alert("Error! Please sign in with valid credentials.");
      }
      setIsSigningIn(false);
    }
  };

  if (userLoggedIn) {
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
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
        <input
          className="form-control"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
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
