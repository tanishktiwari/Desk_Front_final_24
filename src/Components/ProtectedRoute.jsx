import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, isAdminRoute }) => {
  const location = useLocation();

  // Retrieve login statuses
  const isUserLoggedIn = localStorage.getItem('loggedInUserMobileNumber');
  const isAdminLoggedIn = localStorage.getItem('adminLoggedIn');

  // Check for admin routes
  if (isAdminRoute && !isAdminLoggedIn) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  // Check for user routes
  if (!isAdminRoute && !isUserLoggedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
