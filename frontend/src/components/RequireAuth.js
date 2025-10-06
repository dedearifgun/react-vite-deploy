import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const RequireAuth = () => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default RequireAuth;