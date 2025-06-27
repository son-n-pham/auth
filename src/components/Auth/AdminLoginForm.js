import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import styles from './AdminLoginForm.module.css'

const AdminLoginForm = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signInAdmin } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await signInAdmin(username, password)
      
      if (error) {
        setError(error.message)
      } else {
        navigate('/admin')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.adminBadge}>
        <span className={styles.adminIcon}>🔐</span>
        <span>Admin Access</span>
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="admin-username" className={styles.label}>
          Admin Username
        </label>
        <input
          id="admin-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={styles.input}
          required
          placeholder="Enter admin username"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="admin-password" className={styles.label}>
          Admin Password
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          required
          placeholder="Enter admin password"
        />
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={styles.submitButton}
      >
        {loading ? 'Signing in...' : 'Admin Sign In'}
      </button>
    </form>
  )
}

export default AdminLoginForm
