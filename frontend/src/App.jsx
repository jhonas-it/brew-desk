import './App.css'
import Sidebar from './components/Sidebar'
import Staffs from './pages/Staffs/Staffs'

export default function App() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Staffs />
      </main>
    </div>
  )
}