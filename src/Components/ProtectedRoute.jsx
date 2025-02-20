import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, isAdminRoute, isEngineerRoute }) => {
  const location = useLocation();

  // Retrieve login statuses
  const isUserLoggedIn = localStorage.getItem('loggedInUserMobileNumber');
  const isAdminLoggedIn = localStorage.getItem('adminLoggedIn');
  const isEngineerLoggedIn = localStorage.getItem('loggedInEngineerMobileNumber');

  // Check for admin routes
  if (isAdminRoute && !isAdminLoggedIn) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  // Check for engineer routes
  if (isEngineerRoute && !isEngineerLoggedIn) {
    return <Navigate to="/engineer-login" state={{ from: location }} replace />;
  }

  // Check for user routes
  if (!isAdminRoute && !isEngineerRoute && !isUserLoggedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;