import { useAuth } from "../../contexts/authContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role: requiredRole }) => {
  const { userLoggedIn, role, isPasswordChangeRequired, isUnauthorized } = useAuth();

  if (!userLoggedIn) {
    return <Navigate to="/login" />;
  }

  if (isUnauthorized) {
    return <Navigate to="/unauthorized" />;
  }

  if (isPasswordChangeRequired) {
    return <Navigate to="/change-password" />;
  }

  if (role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;
