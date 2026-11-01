import Icon from './Icon'
import './Sidebar.css'
import logo from '../assets/icons/logo.png'
import inventoryIcon from '../assets/icons/inventory.png'
import productsIcon from '../assets/icons/products.png'
import salesIcon from '../assets/icons/sales.png'
import settingsIcon from '../assets/icons/settings.png'
import staffsIcon from '../assets/icons/staffs-white.png'

export default function Sidebar() {
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

        <button className="nav-item">
          <span className="nav-icon">
            <Icon name="cart" />
          </span>
          <span className="grow">POS</span>
          <span className="count">24</span>
        </button>

        <button className="nav-item">
          <span className="nav-icon">
            <img src={inventoryIcon} alt="" />
          </span>
          <span className="grow">Inventory</span>
          <span className="dot red" />
        </button>

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

        <button className="nav-item active" aria-current="page">
          <span className="nav-icon">
            <img className="white-icon" src={staffsIcon} alt="" />
          </span>
          <span className="grow">Staffs</span>
        </button>

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
        <button className="icon-btn" aria-label="Log out">
          <Icon name="logout" />
        </button>
      </div>
    </aside>
  )
}