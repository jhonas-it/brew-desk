import { useState } from 'react'
import PageHeader from '../../components/PageHeader'
import StatCards from './StatCards'
import StaffRoster from './StaffRoster'
import StaffFormModal from './StaffFormModal'
import DeleteStaffModal from './DeleteStaffModal'
import { INITIAL_STAFF, todayISO } from './staffData'
import './Staffs.css'

export default function Staffs() {
  const [staff, setStaff] = useState(INITIAL_STAFF)
  const [modal, setModal] = useState(null) // { type: 'add' | 'edit' | 'delete', staff? }

  const owner = staff.find((s) => s.role === 'Owner')
  const close = () => setModal(null)

  const handleAdd = (data) => {
    setStaff((list) => [...list, { ...data, id: Date.now(), created: todayISO() }])
    close()
  }

  const handleEdit = (data) => {
    setStaff((list) => list.map((s) => (s.id === modal.staff.id ? { ...s, ...data } : s)))
    close()
  }

  const handleDelete = () => {
    setStaff((list) => list.filter((s) => s.id !== modal.staff.id))
    close()
  }

  // emails already taken (excluding the staff member being edited)
  const takenEmails = staff
    .filter((s) => s.id !== modal?.staff?.id)
    .map((s) => s.email.toLowerCase())

  return (
    <>
      <PageHeader title="Staffs" subtitle="Manage who can sign in to Brew Desk." />
      <StatCards staff={staff} />
      <StaffRoster
        staff={staff}
        onAdd={() => setModal({ type: 'add' })}
        onEdit={(s) => setModal({ type: 'edit', staff: s })}
        onDelete={(s) => setModal({ type: 'delete', staff: s })}
      />

      {modal?.type === 'add' && (
        <StaffFormModal mode="add" existingEmails={takenEmails} onSave={handleAdd} onClose={close} />
      )}
      {modal?.type === 'edit' && (
        <StaffFormModal
          mode="edit"
          staff={modal.staff}
          existingEmails={takenEmails}
          onSave={handleEdit}
          onClose={close}
        />
      )}
      {modal?.type === 'delete' && (
        <DeleteStaffModal
          target={modal.staff}
          ownerPin={owner?.pin}
          onConfirm={handleDelete}
          onClose={close}
        />
      )}
    </>
  )
}