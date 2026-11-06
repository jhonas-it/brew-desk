import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Layout from "../layouts/Layout";
import Login from "../features/auth/Login";
import Inventory from "../features/inventory/Inventory";
import Staffs from "../features/staff/Staffs";
import ProtectedRoute from "./ProtectedRoute";
import POSPage from "../features/pos/POSPage";
import Settings from "../features/settings/Settings";
import { Toaster } from "../components/ui/sonner";
import Products from "../features/products/Products";
import Transactions from "../features/sales/Transactions";
import { AuthProvider } from "../context/AuthContext";

const OWNER_MANAGER = ["owner", "manager"];
const OWNER_ONLY = ["owner"];

export default function App() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate("/pos", { replace: true });
  };

  return (
    <AuthProvider>
      <>
        <Routes>
          <Route
            path="/login"
            element={<Login onLoginSuccess={handleLoginSuccess} />}
          />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Navigate to="/pos" replace />} />

              <Route path="pos" element={<POSPage />} />

              <Route element={<ProtectedRoute allowedRoles={OWNER_MANAGER} />}>
                <Route path="sales" element={<Transactions />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="products" element={<Products />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={OWNER_ONLY} />}>
                <Route path="staffs" element={<Staffs />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              <Route path="*" element={<Navigate to="/pos" replace />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        <Toaster position="top-right" richColors />
      </>
    </AuthProvider>
  );
}