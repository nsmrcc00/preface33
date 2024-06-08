import './App.css';
import { useRoutes, Navigate } from "react-router-dom";
import { AuthProvider } from './contexts/authContext';
import Login from './components/login/Login';
import AdminHome from './components/admin/adminHome/adminHome';
import InstructorHome from './components/instructor/instructor-home/InstructorHome';
import Unauthorized from './components/unathorized/Unauthorized';
import ProtectedRoute from './components/protectedroute/ProtectedRoute';
import InsAccount from './components/admin/add-account/InstructorAccount';
import StudentAccount from './components/admin/add-account/StudentAccount';
import SubjectHome from './components/instructor/subject/SubjectHome';
import StudentProfile from './components/instructor/subject/student-profile/StudentProfile';

const App = () => {
    const routesArray = [
        {
            path: "/login",
            element: <Login />,
        },
        {
            path: "/unauthorized",
            element: <Unauthorized />,
        },
        {
            path: "/admin-home",
            element: (
                <ProtectedRoute role="admin">
                    <AdminHome />
                </ProtectedRoute>
            ),
        },
        {
            path: "/instructor-accounts",
            element: (
                <ProtectedRoute role="admin">
                    <InsAccount />
                </ProtectedRoute>
            ),
        },
        {
            path: "/student-accounts",
            element: (
                <ProtectedRoute role="admin">
                    <StudentAccount />
                </ProtectedRoute>
            ),
        },
        {
            path: "/instructor-home",
            element: (
                <ProtectedRoute role="instructor">
                    <InstructorHome />
                </ProtectedRoute>
            ),
        },
        {
            path: "/subject",
            element: (
                <ProtectedRoute role="instructor">
                    <SubjectHome />
                </ProtectedRoute>
            ),
        },
        {
            path: "/student-profile",
            element: (
                <ProtectedRoute role="instructor">
                    <StudentProfile />
                </ProtectedRoute>
            ),
        },
        {
            path: "*",
            element: <Navigate to="/login" />,
        },
    ];

    let routesElement = useRoutes(routesArray);

    return (
        <AuthProvider>
            {routesElement}
        </AuthProvider>
    );
};

export default App;