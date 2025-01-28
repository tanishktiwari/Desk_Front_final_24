import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAdminLoggedIn = localStorage.getItem('adminLoggedIn'); // Check if the admin is logged in

  if (!isAdminLoggedIn) {
    // If not logged in as admin, redirect to the admin login page
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
