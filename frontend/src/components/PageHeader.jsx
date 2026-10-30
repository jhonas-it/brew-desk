import { useEffect, useState } from 'react'
import Icon from './Icon'
import './PageHeader.css'

export default function PageHeader({ title, subtitle }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <header className="page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="clock">
        <Icon name="clock" size={24} />
        <strong>{now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</strong>
        <span>{now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
      </div>
    </header>
  )
}