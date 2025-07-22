import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isLoggedIn, userType, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        جاري التحميل...
      </div>
    );
  }

  // Check localStorage for admin auth first
  if (localStorage.getItem("adminAuth") === "true") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If user is logged in, redirect based on user type
  if (isLoggedIn) {
    if (localStorage.getItem("customerAuth") === "true") {
      return <Navigate to="/customer/dashboard" replace />;
    }
    if (localStorage.getItem("driverAuth") === "true") {
      return <Navigate to="/driver/dashboard" replace />;
    }

    // Fallback to userType from context
    if (userType === "customer") {
      return <Navigate to="/customer/dashboard" replace />;
    }
    if (userType === "driver") {
      return <Navigate to="/driver/dashboard" replace />;
    }
    if (userType === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // If not logged in, render the public route
  return <>{children}</>;
};

export default PublicRoute;
