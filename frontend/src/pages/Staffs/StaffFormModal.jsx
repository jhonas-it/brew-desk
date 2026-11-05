import { useState } from 'react'
import Modal from '../../components/Modal'
import Icon from '../../components/Icon'
import { ROLES } from './staffData'

export default function StaffFormModal({
  mode,
  staff,
  existingEmails,
  existingUsernames,
  onSave,
  onClose,
}) {

  const isEdit = mode === 'edit'
  const [form, setForm] = useState({
    role: staff?.role ?? '',
    name: staff?.name ?? '',
    username: staff?.username ?? '',
    email: staff?.email ?? '',
    password: '',
    active: staff?.active ?? true,
  })

  const [errors, setErrors] = useState({})

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const validate = () => {
    const e = {}
    const username = form.username.trim().toLowerCase()
    if (!username) {
      e.username = 'Enter a username.'
    } else if (!/^[a-z0-9._-]{3,20}$/.test(username)) {
      e.username = 'Use 3–20 letters, numbers, dots, underscores, or hyphens.'
    } else if (
      existingUsernames.some(
        (u) =>
          u.toLowerCase() === username &&
          u.toLowerCase() !== (staff?.username ?? '').toLowerCase()
      )
    ) {
      e.username = 'This username is already in use.'
    }  
    if (!form.role) e.role = 'Choose a role.'
    if (!form.name.trim()) e.name = 'Enter a name.'
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      e.email = 'Enter a valid email address.'
    } else if (existingEmails.includes(form.email.trim().toLowerCase())) {
      e.email = 'This email is already in use.'
    }
    if (!isEdit && form.password.length < 6) {
      e.password = 'Password must be at least 6 characters.'
    }
    return e
  }

  const submit = (ev) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    onSave({ ...form, name: form.name.trim(), email: form.email.trim() })
  }

  return (
    <Modal onClose={onClose} labelledBy="staff-form-title">
      <form onSubmit={submit} noValidate>
        <div className="modal-head">
          <div>
            <h3 id="staff-form-title">{isEdit ? 'Edit Staff' : 'Add Account'}</h3>
            <p>
              {isEdit
                ? "Modify the name, assigned role, and email address to manage this user's profile and system permissions."
                : 'Adds a new staff user by setting their role, name, email address, password, and account status.'}
            </p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="x" size={26} />
          </button>
        </div>

        <div className="modal-body">
          <div className="field">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              className={`select${form.role ? '' : ' placeholder'}${errors.role ? ' invalid' : ''}`}
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
            >
              <option value="" disabled>
                Role
              </option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {errors.role && <p className="error">{errors.role}</p>}
          </div>

          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              className={`input${errors.name ? ' invalid' : ''}`}
              placeholder="e.g. Juan Dela Cruz"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
            {errors.name && <p className="error">{errors.name}</p>}
          </div>

          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              autoComplete="username"
              className={`input${errors.username ? ' invalid' : ''}`}
              placeholder="e.g. juan123"
              value={form.username}
              onChange={(e) =>
                set('username', e.target.value.toLowerCase().trim())
              }
            />
            {errors.username && (
              <p className="error">{errors.username}</p>
            )}
          </div>

          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className={`input${errors.email ? ' invalid' : ''}`}
              placeholder="e.g. juandelacruz@gmail.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>

          <div className="row">
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className={`input${errors.password ? ' invalid' : ''}`}
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
              />
              {errors.password && (
                <p className="error">{errors.password}</p>
              )}
            </div>

            <div className="field">
              <span className="label">Status</span>
              <div className="toggle-row">
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.active}
                  aria-label="Account status"
                  className="switch"
                  onClick={() => set('active', !form.active)}
                />
                {form.active ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn primary">
            {isEdit ? 'Update' : 'Add account'}
          </button>
        </div>
      </form>
    </Modal>
  )
}