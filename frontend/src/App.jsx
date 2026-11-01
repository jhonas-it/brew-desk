import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Layout from "./Layout/Layout";
import Login from "./pages/login/login";
import Inventory from "./pages/inventory/Inventory";
import Staffs from "./pages/Staffs/Staffs";

export default function App() {
  const navigate = useNavigate();

  const handleLoginSuccess = (user) => {
    navigate("/inventory", { replace: true });
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={<Login onLoginSuccess={handleLoginSuccess} />}
      />

      <Route element={<Layout />}>
        <Route
          path="/"
          element={<Navigate to="/inventory" replace />}
        />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/staffs" element={<Staffs />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}