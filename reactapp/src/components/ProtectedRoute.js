import React from "react";
import { Navigate } from "react-router-dom";
import { getAuthToken } from "../api";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!getAuthToken();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
