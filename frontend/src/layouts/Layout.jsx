
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import Sidebar from "./Sidebar";
import { logoutUser } from "../features/auth/login.service.js";

import "./Layout.css";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const activePage = location.pathname.split("/")[1] || "pos";

  const handleNavigate = (page) => {
    navigate(`/${page}`);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  return (
    <div className="layout">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        user={{
          name: "Allen Caraan",
          role: "owner",
          shiftActive: true,
        }}
      />

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
