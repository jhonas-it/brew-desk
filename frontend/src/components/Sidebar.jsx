import Icon from './Icon'
import './Sidebar.css'
import logo from '../assets/icons/logo.png'
import inventoryIcon from '../assets/icons/inventory.png'
import productsIcon from '../assets/icons/products.png'
import salesIcon from '../assets/icons/sales.png'
import settingsIcon from '../assets/icons/settings.png'
import staffsIcon from '../assets/icons/staffs-white.png'
import { useNavigate, NavLink } from "react-router-dom";
import { logoutUser } from '../services/login.service'
import { useState } from 'react'


export default function Sidebar() {

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await logoutUser()
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout failed:', error)
      setLoggingOut(false)
    }
  }
  return (
    <aside className="sidebar">
      <div className="brand">
        <img className="brand-logo" src={logo} alt="" />
        Brew Desk
      </div>

      <nav className="nav">
        <p className="nav-label">Main menu</p>

        <button className="nav-item">
          <span className="nav-icon">
            <Icon name="dashboard" />
          </span>
          <span className="grow">Dashboard</span>
          <span className="dot green" />
        </button>


        <NavLink
          to="/pos"
          className={({ isActive }) =>
            `nav-item${isActive ? " active" : ""}`
          }
        >
          <span className="nav-icon">
            <Icon name="cart" />
          </span>
          <span className="grow">POS</span>
        </NavLink>


        <NavLink
          to="/inventory"
          className={({ isActive }) =>
            `nav-item${isActive ? ' active' : ''}`
          }
        >
          <span className="nav-icon">
            <img src={inventoryIcon} alt="" />
          </span>
          <span className="grow">Inventory</span>
          <span className="dot red" />
        </NavLink>

        <button className="nav-item">
          <span className="nav-icon">
            <img src={productsIcon} alt="" />
          </span>
          <span className="grow">Products</span>
        </button>

        <button className="nav-item">
          <span className="nav-icon">
            <img src={salesIcon} alt="" />
          </span>
          <span className="grow">Sales</span>
        </button>

        <p className="nav-label">Store management</p>

        <NavLink
          to="/staffs"
          className={({ isActive }) =>
            `nav-item${isActive ? ' active' : ''}`
          }
        >
          <span className="nav-icon">
            <img className="white-icon" src={staffsIcon} alt="" />
          </span>
          <span className="grow">Staffs</span>
        </NavLink>

        <button className="nav-item">
          <span className="nav-icon">
            <img src={settingsIcon} alt="" />
          </span>
          <span className="grow">Settings</span>
        </button>
      </nav>

      <div className="me">
        <div className="avatar">AC</div>
        <div className="me-info">
          <div className="me-name">Allen Caraan</div>
          <div className="me-meta">
            <span className="badge-owner">OWNER</span>
            <span>Shift Active</span>
          </div>
        </div>
        <button
          className="icon-btn"
          aria-label="Log out"
          title="Log out"
          onClick={() => setShowLogoutConfirm(true)}
        >
          <Icon name="logout" />
        </button>
      </div>
      {showLogoutConfirm && (
        <div className="logout-overlay">
          <div
            className="logout-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
          >
            <h3 id="logout-title">Confirm Logout</h3>
            <p>Are you sure you want to log out of Brew Desk?</p>

            <div className="logout-actions">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={loggingOut}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? 'Logging out...' : 'Yes, Log Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}