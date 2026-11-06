import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { auth, db } from "../../lib/firebase";
import Sidebar from "./Sidebar";
import { logoutUser } from "../features/auth/login.service.js";

import "./Layout.css";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);

  const activePage = location.pathname.split("/")[1] || "pos";

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        return;
      }

      try {
        const userSnapshot = await get(ref(db, `users/${firebaseUser.uid}`));

        if (!userSnapshot.exists()) {
          setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || "User",
            role: "cashier",
            active: false,
          });

          return;
        }

        const profile = userSnapshot.val();

        setUser({
          uid: firebaseUser.uid,
          name: profile.name || firebaseUser.displayName || "User",
          role: String(profile.role || "cashier").toLowerCase(),
          avatar: profile.avatar ?? null,
          active: profile.active === true,
        });
      } catch (error) {
        console.error("Failed to load user profile:", error);
        toast.error("Unable to load your account information.");

        setUser({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || "User",
          role: "cashier",
          active: false,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleNavigate = (page) => {
    navigate(`/${page}`);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      setLoggingOut(true);
      await logoutUser();
      setShowLogoutModal(false);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="layout">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        user={
          user || {
            name: "Loading...",
            role: "cashier",
            active: false,
          }
        }
      />

      <main className="main">
        <Outlet context={{ user }} />
      </main>
      {showLogoutModal && (
        <div
          className="logout-overlay"
          onClick={() => {
            if (!loggingOut) setShowLogoutModal(false);
          }}
        >
          <div
            className="logout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="logout-icon">
              <LogOut size={26} />
            </div>

            <h2 id="logout-title">Log Out?</h2>

            <p>Are you sure you want to log out of Brew Desk?</p>

            <div className="logout-actions">
              <button
                type="button"
                className="logout-cancel"
                disabled={loggingOut}
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="logout-confirm"
                disabled={loggingOut}
                onClick={confirmLogout}
              >
                {loggingOut ? "Logging out..." : "Yes, Log Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
