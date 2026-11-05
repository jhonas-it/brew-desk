
import { useEffect, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import StatCards from './StatCards'
import StaffRoster from './StaffRoster'
import StaffFormModal from './StaffFormModal'
import DeleteStaffModal from './DeleteStaffModal'
import {
  getStaffList,
  createStaffAccount,
  updateStaffAccount,
  deleteStaffAccount,
} from '../../services/staff.service'
import './Staffs.css'
import { toast } from 'sonner'

export default function Staffs() {
  const [staff, setStaff] = useState([])
  const [modal, setModal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadStaff() {
      try {
        const users = await getStaffList()

        if (mounted) {
          setStaff(users)
          setLoadError('')
        }
      } catch (error) {
        console.error('Failed to load staff:', error)

        if (mounted) {
          setLoadError('Unable to load staff accounts from Firebase.')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadStaff()

    return () => {
      mounted = false
    }
  }, [])

  const close = () => setModal(null)

  const takenEmails = staff
    .filter((s) => s.id !== modal?.staff?.id)
    .map((s) => s.email.toLowerCase())

  const takenUsernames = staff
    .filter((s) => s.id !== modal?.staff?.id)
    .map((s) => s.username.toLowerCase())

  return (
    <>
      <PageHeader
        title="Staffs"
        subtitle="Manage who can sign in to Brew Desk."
      />

      {loading ? (
        <p>Loading staff accounts...</p>
      ) : loadError ? (
        <p role="alert">{loadError}</p>
      ) : (
        <>
          <StatCards staff={staff} />

          <StaffRoster
            staff={staff}
            onAdd={() => setModal({ type: 'add' })}
            onEdit={(s) => setModal({ type: 'edit', staff: s })}
            onDelete={(s) => setModal({ type: 'delete', staff: s })}
          />

          {modal?.type === 'add' && (
            <StaffFormModal
              mode="add"
              existingEmails={takenEmails}
              existingUsernames={takenUsernames}
              onSave={async (data) => {
                try {
                  const newStaff = await createStaffAccount(data)

                  setStaff((current) => [...current, newStaff])

                  toast.success('Staff account created successfully!')
                  close()
                } catch (error) {
                  console.error('Failed to create staff account:', error)
                  toast.error(error.message || 'Failed to create staff account.')
                }
              }}
              onClose={close}
            />
          )}

          {modal?.type === 'edit' && (
            <StaffFormModal
              mode="edit"
              staff={modal.staff}
              existingEmails={takenEmails}
              existingUsernames={takenUsernames}
              onSave={async (data) => {
                try {
                  const updatedStaff = await updateStaffAccount(
                    modal.staff,
                    data
                  )

                  setStaff((current) =>
                    current.map((s) =>
                      s.id === modal.staff.id ? updatedStaff : s
                    )
                  )

                  toast.success('Staff account updated successfully!')
                  close()
                } catch (error) {
                  console.error('Failed to update staff account:', error)
                  toast.error(error.message || 'Failed to update staff account.')
                }
              }}
              onClose={close}
            />
          )}

          {modal?.type === 'delete' && (
            <DeleteStaffModal
              target={modal.staff}
              onConfirm={async () => {
                try {
                  await deleteStaffAccount(modal.staff)

                  setStaff((current) =>
                    current.filter((s) => s.id !== modal.staff.id)
                  )

                  toast.success('Staff profile deleted successfully!')
                  close()
                } catch (error) {
                  console.error('Failed to delete staff:', error)
                  toast.error(error.message || 'Failed to delete staff profile.')
                }
              }}
              onClose={close}
            />
          )}
        </>
      )}
    </>
  )
}