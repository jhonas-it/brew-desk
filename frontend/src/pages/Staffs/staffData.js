// Owner is protected and can't be added from the form
export const ROLES = ['Manager', 'Cashier']

export const INITIAL_STAFF = [
  { id: 1, name: 'Jhonas Caraan', email: 'jhonas@gmail.com', role: 'Owner', pin: '1234', created: '2026-06-14', active: true },
  { id: 2, name: 'Aquiera Cantillon', email: 'aquiera@gmail.com', role: 'Manager', pin: '1234', created: '2026-06-14', active: true },
  { id: 3, name: 'Kassandra Francisco', email: 'kassandra@gmail.com', role: 'Cashier', pin: '1234', created: '2026-06-14', active: true },
  { id: 4, name: 'Rozanne Angeles', email: 'rozanne@gmail.com', role: 'Cashier', pin: '1234', created: '2026-06-14', active: true },
]

export const formatDate = (iso) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

export const todayISO = () => {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}