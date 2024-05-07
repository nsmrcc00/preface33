import React from 'react'
import Login from './components/login/Login'
import AdminHome from './components/admin/adminHome';
import AccountsPage from './components/add-account/AddAccountTEMP';
import './App.css'
import { AuthProvider } from './contexts/authContext';
import { useRoutes } from "react-router-dom";
import InsAccount from './components/add-account/InstructorAccount';
import StudentAccount from './components/add-account/StudentAccount';



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
  ];
  let routesElement = useRoutes(routesArray);
  return (
    <AuthProvider>
      <div>{routesElement}</div>
    </AuthProvider>
  );
}

export default App;