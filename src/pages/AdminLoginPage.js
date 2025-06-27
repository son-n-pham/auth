import React from 'react'
import AdminLoginForm from '../components/Auth/AdminLoginForm'
import styles from '../styles/AdminLoginPage.module.css'

const AdminLoginPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.header}>
          <h1 className={styles.title}>Admin Portal</h1>
          <p className={styles.subtitle}>Restricted Access - Authorized Personnel Only</p>
        </div>
        <AdminLoginForm />
        <div className={styles.warning}>
          <p>⚠️ This area is restricted to authorized administrators only.</p>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage
