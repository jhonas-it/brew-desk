import { useState } from 'react'
import Modal from '../../components/Modal'
import Icon from '../../components/Icon'

export default function DeleteStaffModal({ target, ownerPin, onConfirm, onClose }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (password !== ownerPin) {
      setError('Incorrect owner password.')
      return
    }
    onConfirm()
  }

  return (
    <Modal onClose={onClose} small labelledBy="delete-title">
      <form onSubmit={submit}>
        <div className="modal-head">
          <h3 id="delete-title">Staff Delete</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
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
              className={`input${error ? ' invalid' : ''}`}
              placeholder="****"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
            />
            {error && <p className="error">{error}</p>}
          </div>

          <div className="delete-actions">
            <button type="button" className="btn sm neutral" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn sm danger">
              Delete
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}