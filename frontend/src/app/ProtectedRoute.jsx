import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p>Checking login status...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = String(user.role || "").toLowerCase();

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/pos" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}