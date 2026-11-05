import { useEffect, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import './Settings.css'

/* ================= DATABASE SWITCH =================
   Leave empty  -> runs with the sample data below (no backend needed)
   Set a URL    -> loads and saves through your backend, e.g.
                   const API_URL = 'http://localhost:3000/api'
*/
const API_URL = ''

async function request(path, options) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json()
}

/* ================= SAMPLE DATA (used when API_URL is empty) ================= */

const DEFAULTS = {
  businessName: 'Brew Desk Café',
  address: 'Bulacan Longos',
  contact: '0917 555 0142',
  lowStockPct: 25,
  expiryDays: 3,
}

/* ================= PAGE ================= */

export default function Settings() {
  const [form, setForm] = useState({
    businessName: DEFAULTS.businessName,
    address: DEFAULTS.address,
    contact: DEFAULTS.contact,
    lowStockPct: String(DEFAULTS.lowStockPct),
    expiryDays: String(DEFAULTS.expiryDays),
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(Boolean(API_URL))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load from the database (only when API_URL is set)
  useEffect(() => {
    if (!API_URL) return

    request('/settings')
      .then((s) =>
        setForm({
          businessName: s.businessName ?? '',
          address: s.address ?? '',
          contact: s.contact ?? '',
          lowStockPct: String(s.lowStockPct ?? ''),
          expiryDays: String(s.expiryDays ?? ''),
        })
      )
      .catch(() => setErrors({ form: 'Could not load settings. Is the server running?' }))
      .finally(() => setLoading(false))
  }, [])

  // Hide the "saved" message after a few seconds
  useEffect(() => {
    if (!saved) return
    const t = setTimeout(() => setSaved(false), 3000)
    return () => clearTimeout(t)
  }, [saved])

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined, form: undefined }))
    setSaved(false)
  }

  const submit = async (e) => {
    e.preventDefault()

    const next = {}
    const pct = Number(form.lowStockPct)
    const days = Number(form.expiryDays)

    if (!form.businessName.trim()) next.businessName = 'Enter a business name.'
    if (!form.address.trim()) next.address = 'Enter an address.'
    if (!form.contact.trim()) next.contact = 'Enter a contact number.'
    if (!(pct >= 1 && pct <= 100)) next.lowStockPct = 'Enter a percentage from 1 to 100.'
    if (!Number.isInteger(days) || days < 1) next.expiryDays = 'Enter a whole number of days (1 or more).'

    setErrors(next)
    if (Object.keys(next).length) return

    setSaving(true)
    try {
      if (API_URL) {
        await request('/settings', {
          method: 'PUT',
          body: JSON.stringify({
            businessName: form.businessName.trim(),
            address: form.address.trim(),
            contact: form.contact.trim(),
            lowStockPct: pct,
            expiryDays: days,
          }),
        })
      }
      setSaved(true)
    } catch {
      setErrors({ form: 'Could not save settings. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="Settings" subtitle="Business details and alert thresholds." />

      <form className="st-form" onSubmit={submit} noValidate>
        {/* Business information */}
        <section className="st-card">
          <div className="st-card-head">
            <h2>Business information</h2>
            <p>Printed on every receipt.</p>
          </div>

          <div className="st-card-body">
            <div className="st-field">
              <label htmlFor="st-name">Business name</label>
              <input
                id="st-name"
                className={`st-input${errors.businessName ? ' invalid' : ''}`}
                value={form.businessName}
                disabled={loading}
                onChange={(e) => set('businessName', e.target.value)}
              />
              {errors.businessName && <p className="st-error">{errors.businessName}</p>}
            </div>

            <div className="st-grid">
              <div className="st-field">
                <label htmlFor="st-address">Address</label>
                <input
                  id="st-address"
                  className={`st-input${errors.address ? ' invalid' : ''}`}
                  value={form.address}
                  disabled={loading}
                  onChange={(e) => set('address', e.target.value)}
                />
                {errors.address && <p className="st-error">{errors.address}</p>}
              </div>

              <div className="st-field">
                <label htmlFor="st-contact">Contact</label>
                <input
                  id="st-contact"
                  type="tel"
                  className={`st-input${errors.contact ? ' invalid' : ''}`}
                  value={form.contact}
                  disabled={loading}
                  onChange={(e) => set('contact', e.target.value)}
                />
                {errors.contact && <p className="st-error">{errors.contact}</p>}
              </div>
            </div>
          </div>
        </section>

        {/* Alert thresholds */}
        <section className="st-card">
          <div className="st-card-head">
            <h2>Alert thresholds</h2>
            <p>Alerts are rule-based: they fire at fixed levels and do not forecast demand.</p>
          </div>

          <div className="st-card-body">
            <div className="st-grid">
              <div className="st-field">
                <label htmlFor="st-low">Low-stock threshold (% of par level)</label>
                <input
                  id="st-low"
                  type="number"
                  min="1"
                  max="100"
                  className={`st-input${errors.lowStockPct ? ' invalid' : ''}`}
                  value={form.lowStockPct}
                  disabled={loading}
                  onChange={(e) => set('lowStockPct', e.target.value)}
                />
                {errors.lowStockPct ? (
                  <p className="st-error">{errors.lowStockPct}</p>
                ) : (
                  <p className="st-hint">
                    An ingredient is flagged when active stock falls below this share of its par level.
                  </p>
                )}
              </div>

              <div className="st-field">
                <label htmlFor="st-exp">Expiration alert window (days)</label>
                <input
                  id="st-exp"
                  type="number"
                  min="1"
                  step="1"
                  className={`st-input${errors.expiryDays ? ' invalid' : ''}`}
                  value={form.expiryDays}
                  disabled={loading}
                  onChange={(e) => set('expiryDays', e.target.value)}
                />
                {errors.expiryDays ? (
                  <p className="st-error">{errors.expiryDays}</p>
                ) : (
                  <p className="st-hint">
                    Batches expiring within this many days are flagged Expiring Soon.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {errors.form && <p className="st-error">{errors.form}</p>}

        <div className="st-actions">
          <button type="submit" className="st-save" disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save settings'}
          </button>
          {saved && <span className="st-saved">Settings saved.</span>}
        </div>
      </form>
    </>
  )
}