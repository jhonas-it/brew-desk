import { useMemo, useState } from 'react'
import Icon from '../../components/Icon'
import { formatDate } from './staffData'

export default function StaffRoster({ staff, onAdd, onEdit, onDelete }) {
  const [query, setQuery] = useState('')

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return staff
    return staff.filter((s) =>
      [s.name, s.email, s.role].some((v) => v.toLowerCase().includes(q))
    )
  }, [staff, query])

  return (
    <section className="roster">
      <div className="roster-head">
        <h2>Team roster {staff.length} members</h2>
        <div className="tools">
          <button className="btn-add" onClick={onAdd}>
            <Icon name="plus" size={18} />
            Add Account
          </button>
          <div className="search">
            <Icon name="search" size={20} />
            <input
              type="search"
              placeholder="Search name, role, email"
              aria-label="Search staff"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Team member</th>
              <th>Email address</th>
              <th>Role</th>
              <th>PIN</th>
              <th>Created</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.role}</td>
                <td>
                  <span className="pin">
                    <Icon name="lock" size={16} />
                    {s.pin}
                  </span>
                </td>
                <td>{formatDate(s.created)}</td>
                <td className={s.active ? '' : 'status-inactive'}>
                  {s.active ? 'Active' : 'Inactive'}
                </td>
                <td>
                  {s.role === 'Owner' ? (
                    <span className="protected">Protected</span>
                  ) : (
                    <span className="actions">
                      <button onClick={() => onEdit(s)} aria-label={`Edit ${s.name}`}>
                        <Icon name="pencil" size={18} />
                      </button>
                      <button
                        className="del"
                        onClick={() => onDelete(s)}
                        aria-label={`Delete ${s.name}`}
                      >
                        <Icon name="trash" size={18} />
                      </button>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {visible.length === 0 && (
          <div className="empty">
            {query
              ? `No staff match "${query}". Try a different name, role, or email.`
              : 'No staff yet. Add an account to get started.'}
          </div>
        )}
      </div>
    </section>
  )
}