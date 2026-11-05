import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Layout from "./Layout/Layout";
import Login from "./pages/login/login";
import Inventory from "./pages/inventory/Inventory";
import Staffs from "./pages/Staffs/Staffs";
import ProtectedRoute from "./ProtectedRoute";

export default function App() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate("/inventory", { replace: true });
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={<Login onLoginSuccess={handleLoginSuccess} />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route
            path="/"
            element={<Navigate to="/inventory" replace />}
          />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/staffs" element={<Staffs />} />
        </Route>
      </Route>

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}