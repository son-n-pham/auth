import React from 'react'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Layout/Header'
import styles from '../styles/Dashboard.module.css'

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.title}>Welcome back, {user?.email}!</h1>
          <p className={styles.subtitle}>
            You're successfully logged in to your dashboard.
          </p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Profile Status</h3>
            <p>Active</p>
          </div>
          <div className={styles.statCard}>
            <h3>Last Login</h3>
            <p>{new Date().toLocaleDateString()}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Account Type</h3>
            <p>Standard User</p>
          </div>
        </div>

        <div className={styles.quickActions}>
          <h2>Quick Actions</h2>
          <div className={styles.actionButtons}>
            <button className={styles.actionButton}>Update Profile</button>
            <button className={styles.actionButton}>View Settings</button>
            <button className={styles.actionButton}>Help & Support</button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
