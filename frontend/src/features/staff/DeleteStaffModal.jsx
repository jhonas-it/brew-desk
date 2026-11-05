import { useState } from 'react'
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { auth } from '../../../lib/firebase'
import Modal from '../../components/Modal'
import Icon from '../../components/Icon'

export default function DeleteStaffModal({
  target,
  onConfirm,
  onClose,
}) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    const owner = auth.currentUser

    if (!owner || !owner.email) {
      setError('Please sign in to the Owner account again.')
      return
    }

    try {
      setSubmitting(true)

      const credential = EmailAuthProvider.credential(
        owner.email,
        password
      )

      await reauthenticateWithCredential(owner, credential)
      await onConfirm()
    } catch (err) {
      console.error('Owner verification failed:', err)

      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-login-credentials'
      ) {
        setError('Incorrect owner password.')
      } else {
        setError(err.message || 'Unable to verify Owner account.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal onClose={onClose} small labelledBy="delete-title">
      <form onSubmit={submit}>
        <div className="modal-head">
          <h3 id="delete-title">Staff Delete</h3>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon name="x" size={26} />
          </button>
        </div>

        <div className="delete-body">
          <p className="delete-target">
            Removing <strong>{target.name}</strong> can't be undone.
          </p>

          <div className="field">
            <label htmlFor="owner-pw">Owner password</label>
            <input
              id="owner-pw"
              type="password"
              autoFocus
              required
              className={`input${error ? ' invalid' : ''}`}
              placeholder="Enter Owner password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
            />
            {error && <p className="error">{error}</p>}
          </div>

          <div className="delete-actions">
            <button
              type="button"
              className="btn sm neutral"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn sm danger"
              disabled={submitting}
            >
              {submitting ? 'Verifying...' : 'Delete'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}