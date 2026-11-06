import { useState, useEffect } from "react";
import { Clock3 } from "lucide-react";
import "./Settings.css";

const DEFAULT_BUSINESS = {
  name: "Brew Desk Café",
  address: "Bulacan Longos",
  contact: "09175550142",
};

const DEFAULT_ALERTS = {
  lowStock: 25,
  expiration: 3,
};

// Safely retrieve saved settings from localStorage
function getSavedSettings(key, defaults) {
  try {
    const saved = localStorage.getItem(key);

    if (!saved) return defaults;

    const parsed = JSON.parse(saved);

    if (!parsed || typeof parsed !== "object") {
      return defaults;
    }

    return { ...defaults, ...parsed };
  } catch (error) {
    console.error(`Unable to load ${key}:`, error);
    return defaults;
  }
}

function Settings() {
  const [business, setBusiness] = useState(() => {
    const saved = getSavedSettings("brewdesk-business", DEFAULT_BUSINESS);
    return { ...saved, contact: String(saved.contact).replace(/\D/g, "") };
  });

  const [alerts, setAlerts] = useState(() =>
    getSavedSettings("brewdesk-alerts", DEFAULT_ALERTS),
  );

  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Update business information
  const updateBusiness = (e) => {
    const { name } = e.target;
    let { value } = e.target;

    // Contact: digits only, max 11
    if (name === "contact") {
      value = value.replace(/\D/g, "").slice(0, 11);
    }

    setBusiness((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSaved(false);
    setSaveError("");
  };

  // Update alert thresholds
  const updateAlerts = (e) => {
    const { name, value } = e.target;

    setAlerts((previous) => ({
      ...previous,
      [name]: value === "" ? "" : Number(value),
    }));

    setSaved(false);
    setSaveError("");
  };

  // Save settings locally
  const handleSave = (e) => {
    e.preventDefault();

    try {
      if (
        !business.name.trim() ||
        !business.address.trim() ||
        !business.contact.trim()
      ) {
        setSaveError("Please complete all business information.");
        setSaved(false);
        return;
      }

      if (!/^09\d{9}$/.test(business.contact.replace(/\s/g, ""))) {
        setSaveError("Please enter a valid 11-digit Philippine mobile number.");
        setSaved(false);
        return;
      }

      if (
        alerts.lowStock === "" ||
        !Number.isFinite(alerts.lowStock) ||
        alerts.lowStock < 0 ||
        alerts.lowStock > 100
      ) {
        setSaveError("Low-stock threshold must be between 0 and 100.");
        setSaved(false);
        return;
      }

      if (
        alerts.expiration === "" ||
        !Number.isInteger(alerts.expiration) ||
        alerts.expiration < 1
      ) {
        setSaveError("Expiration alert must be at least 1 day.");
        setSaved(false);
        return;
      }

      localStorage.setItem("brewdesk-business", JSON.stringify(business));

      localStorage.setItem("brewdesk-alerts", JSON.stringify(alerts));

      setSaved(true);
      setSaveError("");
    } catch (error) {
      console.error("Unable to save settings:", error);
      setSaved(false);
      setSaveError("Unable to save settings. Please try again.");
    }
  };

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentTime = now.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const currentDate = now.toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="settings-layout">
      <main className="settings-main">
        <header className="settings-header">
          <div>
            <h1>Settings</h1>
            <p>Business details and alert thresholds.</p>
          </div>

          <div className="date-display">
            <Clock3 size={15} />
            <strong>{currentTime}</strong>
            <small>{currentDate}</small>
          </div>
        </header>

        <form onSubmit={handleSave}>
          {/* BUSINESS INFORMATION */}
          <section className="settings-card">
            <div className="card-heading">
              <h3>Business information</h3>
              <p>Printed on every receipt.</p>
            </div>

            <div className="card-content">
              <div className="form-group full-width">
                <label htmlFor="business-name">Business name</label>

                <input
                  id="business-name"
                  type="text"
                  name="name"
                  value={business.name}
                  onChange={updateBusiness}
                  required
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="business-address">Address</label>

                  <input
                    id="business-address"
                    type="text"
                    name="address"
                    value={business.address}
                    onChange={updateBusiness}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="business-contact">Contact</label>

                  <input
                    id="business-contact"
                    type="tel"
                    name="contact"
                    value={business.contact}
                    onChange={updateBusiness}
                    pattern="09[0-9]{9}"
                    maxLength={11}
                    placeholder="09XXXXXXXXX"
                    title="Enter a valid 11-digit Philippine mobile number."
                    required
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ALERT THRESHOLDS */}
          <section className="settings-card">
            <div className="card-heading">
              <h3>Alert thresholds</h3>
              <p>
                Alerts are rule-based: they fire at fixed levels and do not
                forecast demand.
              </p>
            </div>

            <div className="card-content">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="low-stock">
                    Low-stock threshold (% of par level)
                  </label>

                  <input
                    id="low-stock"
                    type="number"
                    name="lowStock"
                    min="0"
                    max="100"
                    step="1"
                    value={alerts.lowStock}
                    onChange={updateAlerts}
                    required
                  />

                  <small className="field-help">
                    An ingredient is flagged when active stock falls below this
                    share of its par level.
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="expiration-window">
                    Expiration alert window (days)
                  </label>

                  <input
                    id="expiration-window"
                    type="number"
                    name="expiration"
                    min="1"
                    step="1"
                    value={alerts.expiration}
                    onChange={updateAlerts}
                    required
                  />

                  <small className="field-help">
                    Batches expiring within this many days are flagged as
                    Expiring Soon.
                  </small>
                </div>
              </div>
            </div>
          </section>

          {/* SAVE BUTTON */}
          <div className="save-area">
            <button type="submit" className="save-button">
              Save settings
            </button>

            {saved && (
              <span className="success-message" role="status">
                ✓ Settings saved successfully!
              </span>
            )}

            {saveError && (
              <span className="error-message" role="alert">
                {saveError}
              </span>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}

export default Settings;