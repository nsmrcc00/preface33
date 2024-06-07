import { useAuth } from "../../contexts/authContext";
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role: requiredRole }) => {
    const { userLoggedIn, role } = useAuth();

    if (!userLoggedIn) {
        return <Navigate to="/login" />;
    }

    if (role !== requiredRole) {
        return <Navigate to="/unauthorized" />;
    }

    return children;
};

export default ProtectedRoute;

