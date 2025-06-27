import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import styles from './Header.module.css'

const Header = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const isAdmin = user?.role === 'admin'

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to={isAdmin ? "/admin" : "/dashboard"} className={styles.logo}>
          {isAdmin && <span className={styles.adminBadge}>🔐</span>}
          AuthApp {isAdmin && '- Admin'}
        </Link>
        
        <nav className={styles.nav}>
          {!isAdmin && (
            <Link to="/dashboard" className={styles.navLink}>
              Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className={styles.navLink}>
              Admin Panel
            </Link>
          )}
        </nav>

        <div className={styles.userSection}>
          <span className={styles.userEmail}>
            {isAdmin ? `Admin: ${user?.email}` : user?.email}
          </span>
          <button onClick={handleSignOut} className={styles.signOutButton}>
            Sign Out
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
