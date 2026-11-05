import Icon from '../../components/Icon'

function StatCard({ title, value, foot }) {
  return (
    <div className="stat">
      <div className="stat-top">
        <div>
          <div className="stat-title">{title}</div>
          <div className="stat-value">{value}</div>
        </div>
        <span className="check">
          <Icon name="check" size={16} stroke={3} />
        </span>
      </div>
      <div className="stat-foot">{foot}</div>
    </div>
  )
}

export default function StatCards({ staff }) {
  const total = staff.length
  const inactive = staff.filter((s) => !s.active).length
  const activeCount = total - inactive

  const roleCounts = ['Owner', 'Manager', 'Cashier']
    .map((r) => [r, staff.filter((s) => s.role === r).length])
    .filter(([, n]) => n > 0)
    .map(([r, n]) => `${n} ${r}`)
    .join(' · ')

  const tiers = new Set(staff.map((s) => s.role)).size

  return (
    <section className="stats">
      <StatCard
        title="Total staff"
        value={total}
        foot={inactive === 0 ? 'All profiles active' : `${inactive} inactive`}
      />
      <StatCard
        title="Roles distribution"
        value={roleCounts || 'No staff yet'}
        foot={`${tiers} Tiers`}
      />
      <StatCard
        title="Terminal PINs"
        value={`${activeCount} Active`}
        foot={`${inactive} Locked / Expired`}
      />
    </section>
  )
}