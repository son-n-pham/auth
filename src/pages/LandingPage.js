import React from 'react'
import { Link } from 'react-router-dom'
import styles from '../styles/LandingPage.module.css'

const LandingPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.logoSection}>
          <h1 className={styles.logo}>AuthApp</h1>
          <p className={styles.tagline}>Secure Authentication Made Simple</p>
        </div>
        
        <div className={styles.welcomeSection}>
          <h2 className={styles.welcomeTitle}>Welcome to Our Platform</h2>
          <p className={styles.welcomeText}>
            Experience seamless authentication and user management with our 
            modern React application powered by Supabase.
          </p>
        </div>

        <div className={styles.ctaSection}>
          <Link to="/login" className={styles.ctaButton}>
            Sign In
          </Link>
          <Link to="/signup" className={styles.secondaryButton}>
            Create Account
          </Link>
        </div>
        
        <div className={styles.adminSection}>
          <Link to="/admin-login" className={styles.adminLink}>
            🔐 Admin Access
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
