import { NavLink } from 'react-router-dom'
import Icon from './Icon'
import './Sidebar.css'

import logo from '../assets/icons/logo.png'
import inventoryIcon from '../assets/icons/inventory.png'
import productsIcon from '../assets/icons/products.png'
import salesIcon from '../assets/icons/sales.png'
import settingsIcon from '../assets/icons/settings.png'
import staffsIcon from '../assets/icons/staffs-white.png'

const MAIN_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', dot: 'green' },
  { id: 'pos', label: 'POS', icon: 'cart', count: 24 },
  { id: 'inventory', label: 'Inventory', img: inventoryIcon, dot: 'red' },
  { id: 'products', label: 'Products', img: productsIcon },
  { id: 'sales', label: 'Sales', img: salesIcon },
]

const STORE_ITEMS = [
  { id: 'staffs', label: 'Staffs', img: staffsIcon, white: true },
  { id: 'settings', label: 'Settings', img: settingsIcon },
]

function NavItem({ item }) {
  return (
    <NavLink
      to={`/${item.id}`}
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
    >
      <span className="nav-icon">
        {item.icon ? (
          <Icon name={item.icon} />
        ) : (
          <img className={item.white ? 'white-icon' : undefined} src={item.img} alt="" />
        )}
      </span>
      <span className="grow">{item.label}</span>
      {item.dot && <span className={`dot ${item.dot}`} />}
      {item.count && <span className="count">{item.count}</span>}
    </NavLink>
  )
}

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <img className="brand-logo" src={logo} alt="" />
        Brew Desk
      </div>

      <nav className="nav">
        <p className="nav-label">Main menu</p>
        {MAIN_ITEMS.map((item) => (
          <NavItem key={item.id} item={item} />
        ))}

        <p className="nav-label">Store management</p>
        {STORE_ITEMS.map((item) => (
          <NavItem key={item.id} item={item} />
        ))}
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
