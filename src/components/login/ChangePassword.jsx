import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";
import { doc, updateDoc } from "firebase/firestore";
import { updatePassword } from "firebase/auth";
import { db } from "../../firebase/firebase";

const ChangePassword = () => {
  const { currentUser, setIsPasswordChangeRequired } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const navigate = useNavigate();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!isUpdatingPassword) {
      if (newPassword !== confirmPassword) {
        alert("New password and confirm password do not match!");
        return;
      }
      setIsUpdatingPassword(true);
      try {
        if (!currentUser) {
          alert("No user is currently logged in.");
          setIsUpdatingPassword(false);
          return;
        }
        console.log("Updating password for user:", currentUser.uid);

        await updatePassword(currentUser, newPassword);
        await updateDoc(doc(db, "Users", currentUser.uid), { Passchange: true });

        // Update the auth state
        setIsPasswordChangeRequired(false);

        alert("Password updated successfully");
        navigate("/login"); // Redirect to login page after successful password change
      } catch (error) {
        console.error("Error updating password:", error);
        alert("Error updating password!");
      }
      setIsUpdatingPassword(false);
    }
  };

  return (
    <main id="login-page">
      <h3 id="login_heading">CHANGE YOUR PASSWORD</h3>
      <p>Enter a new password below to change the default password.</p>
      <form id="inputs" onSubmit={handleChangePassword}>
        <input
          className="form-control"
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          className="form-control"
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <div className="mb-3 text-center">
          <button
            id="gen_btn"
            type="submit"
            disabled={isUpdatingPassword}
            className={`${isUpdatingPassword} btn btn-primary`}
          >
            {isUpdatingPassword ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </main>
  );
};

export default ChangePassword;
