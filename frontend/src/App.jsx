
import { useState } from "react";
import Sidebar from "./components/layouts/Sidebar";
import POSPage from "./features/pos/POSPage";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

function App() {
  const [activePage, setActivePage] = useState("pos");

  return (
    <div className="flex min-h-screen">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={() =>
          toast.info("Logout is not connected yet.")
        }
        user={{
          name: "Allen Caraan",
          role: "owner",
          shiftActive: true,
        }}
      />

      <main className="min-w-0 flex-1">
        {activePage === "pos" ? (
          <POSPage />
        ) : (
          <div className="p-8">
            <h1 className="text-2xl font-bold capitalize">
              {activePage}
            </h1>
            <p className="text-gray-500">
              This module will be connected later.
            </p>
          </div>
        )}
      </main>

      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
