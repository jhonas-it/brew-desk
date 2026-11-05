import { Routes, Route, Navigate } from 'react-router-dom' // <-- Removed BrowserRouter/Router from here
import './App.css'
import Sidebar from './components/Sidebar'
import Staffs from './pages/Staffs/Staffs'
import Products from './pages/Products/Products'
import Inventory from './pages/inventory/Inventory'
import Login from './pages/login/Login'
import Settings from './pages/settings/Settings'

// Our layout wrapper that includes the sidebar
function MainLayout() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Routes>
          <Route path="products" element={<Products />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="staffs" element={<Staffs />} />
          <Route path="settings" element={<Settings />} />
          {/* If the URL is just dashboard root, redirect to products */}
          <Route path="" element={<Navigate to="products" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Login stands alone without a sidebar */}
      <Route path="/login" element={<Login />} />

      {/* Every other path goes through the MainLayout */}
      <Route path="/*" element={<MainLayout />} />
    </Routes>
  )
}
