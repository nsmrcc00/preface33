import React from 'react'
import Login from './components/login/Login'
import AdminHome from './components/admin/adminHome/adminHome';
import './App.css'
import { AuthProvider } from './contexts/authContext';
import { useRoutes } from "react-router-dom";
import InsAccount from './components/admin/add-account/InstructorAccount';
import StudentAccount from './components/admin/add-account/StudentAccount';
import InstructorHome from './components/instructor/instructor-home/InstructorHome';
import Unathorized from './components/unathorized/Unathorized';

function App() {
  const routesArray = [
    {
      path: "*",
      element: <Login />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/admin-home",
      element: <AdminHome />,
    },
    {
      path: "/instructor-accounts",
      element: <InsAccount />,
    },
    {
      path: "/student-accounts",
      element: <StudentAccount />,
    },
    {
      path: "/instructor-home",
      element: <InstructorHome />,
    },
    {
      path: "/unathorized",
      element: <Unathorized />,
    },
  ];
  let routesElement = useRoutes(routesArray);
  return (
    <AuthProvider>
      <div>{routesElement}</div>
    </AuthProvider>
  );
}

export default App;