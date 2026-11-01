
import { useState } from 'react';
import './Settings.css';

function Settings() {
  const [business, setBusiness] = useState({
    name: 'Brew Desk Café',
    address: 'Bulacan Longos',
    contact: '0917 555 0142',
  });

  const [alerts, setAlerts] = useState({
    lowStock: 25,
    expiration: 3,
  });

  const [saved, setSaved] = useState(false);

  const updateBusiness = (e) => {
    setBusiness({
      ...business,
      [e.target.name]: e.target.value,
    });
    setSaved(false);
  };

  const updateAlerts = (e) => {
    setAlerts({
      ...alerts,
      [e.target.name]: e.target.value,
    });
    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();

    // Temporary local saving for interface testing.
    localStorage.setItem(
      'brewdesk-business',
      JSON.stringify(business)
    );

    localStorage.setItem(
      'brewdesk-alerts',
      JSON.stringify(alerts)
    );

    setSaved(true);
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="settings-layout">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <span className="brand-icon">◉</span>
          <span>Brew Desk</span>
        </div>

        <div className="sidebar-menu">
          <p className="menu-label">MAIN MENU</p>

          <div className="menu-item">
            <span>▦</span> Dashboard
          </div>

          <div className="menu-item">
            <span>🛒</span> POS
            <span className="menu-badge">24</span>
          </div>

          <div className="menu-item">
            <span>▤</span> Inventory
          </div>

          <div className="menu-item">
            <span>♢</span> Products
          </div>

          <div className="menu-item">
            <span>▥</span> Sales
          </div>

          <p className="menu-label store-label">
            STORE MANAGEMENT
          </p>

          <div className="menu-item">
            <span>♙</span> Staffs
          </div>

          <div className="menu-item active">
            <span>☷</span> Settings
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">A</div>
          <div className="user-details">
            <strong>Owner</strong>
            <small>OWNER · Shift Active</small>
          </div>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="settings-main">

        {/* PAGE HEADER */}
        <header className="settings-header">
          <div>
            <h1>Settings</h1>
            <p>Business details and alert thresholds.</p>
          </div>

          <div className="date-display">
            <span>◷</span>
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
                <label>Business name</label>
                <input
                  type="text"
                  name="name"
                  value={business.name}
                  onChange={updateBusiness}
                  required
                />
              </div>

              <div className="form-grid">

                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={business.address}
                    onChange={updateBusiness}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Contact</label>
                  <input
                    type="tel"
                    name="contact"
                    value={business.contact}
                    onChange={updateBusiness}
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
                Alerts are rule-based: they fire at fixed levels
                and do not forecast demand.
              </p>
            </div>

            <div className="card-content">

              <div className="form-grid">

                <div className="form-group">
                  <label>
                    Low-stock threshold (% of par level)
                  </label>

                  <input
                    type="number"
                    name="lowStock"
                    min="0"
                    max="100"
                    value={alerts.lowStock}
                    onChange={updateAlerts}
                    required
                  />

                  <small className="field-help">
                    An ingredient is flagged when active stock
                    falls below this share of its par level.
                  </small>
                </div>

                <div className="form-group">
                  <label>Expiration alert window (days)</label>

                  <input
                    type="number"
                    name="expiration"
                    min="1"
                    value={alerts.expiration}
                    onChange={updateAlerts}
                    required
                  />

                  <small className="field-help">
                    Batches expiring within this many days
                    are flagged as Expiring Soon.
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
              <span className="success-message">
                ✓ Settings saved successfully!
              </span>
            )}
          </div>

        </form>

      </main>
    </div>
  );
}

export default Settings;
