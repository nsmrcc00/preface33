import React from 'react'
import Login from './components/login/Login'
import AdminHome from './components/admin/adminHome';
import './App.css'
import { AuthProvider } from './contexts/authContext';
import { useRoutes } from "react-router-dom";

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
  ];
  let routesElement = useRoutes(routesArray);
  return (
    <AuthProvider>
      <div>{routesElement}</div>
    </AuthProvider>
  );
}

export default App;
/*
import React from 'react'
import Login from './components/login/Login'

function App() {
  return (
    <div>
      <Login/>
    </div>
  )
}

export default App



*/