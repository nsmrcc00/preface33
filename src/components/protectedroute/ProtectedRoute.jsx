import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';

const ProtectedRoute = ({ children, role }) => {
    const { userRole } = useAuth();

    if (!userRole) {
        // While loading userRole or if userRole is not available yet, you can show a loading spinner or something similar
        return <div>Loading...</div>;
    }

    if (userRole !== role) {
        // Redirect to unauthorized page if the role doesn't match
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;

