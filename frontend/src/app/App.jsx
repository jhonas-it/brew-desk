
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

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

function ComingSoon({ title }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-gray-500">
        This module will be connected later.
      </p>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate("/pos", { replace: true });
  };

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={
            <Login onLoginSuccess={handleLoginSuccess} />
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route
              index
              element={<Navigate to="/pos" replace />}
            />

            <Route path="pos" element={<POSPage />} />

            <Route path="sales" element={<Transactions />} />

            <Route
              path="dashboard"
              element={<ComingSoon title="Dashboard" />}
            />

            <Route
              path="inventory"
              element={<Inventory />}
            />

            <Route
              path="products"
              element={<Products />}
            />

            <Route 
            path="staffs" 
            element={<Staffs />} 
            
            />

            <Route
              path="settings"
              element={<Settings />}
            />

            <Route
              path="*"
              element={<Navigate to="/pos" replace />}
            />
          </Route>
        </Route>

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>

      <Toaster position="top-right" richColors />
    </>
  );
}