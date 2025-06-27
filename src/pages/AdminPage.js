import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Layout/Header'
import styles from '../styles/AdminPage.module.css'

const AdminPage = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    newUsersThisWeek: 0,
    activeUsersThisWeek: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if user is admin
    if (user?.role !== 'admin') {
      setError('Access denied. Admin privileges required.')
      setLoading(false)
      return
    }
    
    fetchUserAnalytics()
  }, [user])

  const fetchUserAnalytics = async () => {
    try {
      setLoading(true)
      
      // First try to fetch from user_analytics table
      const { data: userAnalytics, error: analyticsError } = await supabase
        .from('user_analytics')
        .select('*')
        .order('registration_date', { ascending: false })

      if (analyticsError) {
        console.error('User analytics table error:', analyticsError.message)
        console.log('Falling back to auth.users data...')
        await fetchRealAuthUsers()
        return
      }

      if (userAnalytics && userAnalytics.length > 0) {
        // Use analytics data if available
        setUsers(userAnalytics)
        calculateAnalytics(userAnalytics)
      } else {
        // If analytics table is empty, fetch real auth users
        console.log('Analytics table is empty, fetching real auth users...')
        await fetchRealAuthUsers()
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setError('Failed to load user analytics')
      setLoading(false)
    }
  }

  const fetchRealAuthUsers = async () => {
    try {
      // Get real users from Supabase Auth
      const { data: { users: authUsers }, error } = await supabase.auth.admin.listUsers()
      
      if (error) {
        console.error('Error fetching auth users:', error.message)
        
        // If admin API is not available, try to get current session info
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          // Show at least the current user
          const currentUserData = [{
            user_id: session.user.id,
            email: session.user.email,
            registration_date: session.user.created_at,
            last_login: session.user.last_sign_in_at || session.user.created_at,
            login_count: 1
          }]
          
          setUsers(currentUserData)
          calculateAnalytics(currentUserData)
        } else {
          setError('Unable to fetch user data. Admin API access required.')
        }
        return
      }

      // Transform auth users to analytics format
      const transformedUsers = authUsers.map(authUser => ({
        user_id: authUser.id,
        email: authUser.email,
        registration_date: authUser.created_at,
        last_login: authUser.last_sign_in_at || authUser.created_at,
        login_count: 1 // Default since we don't have this data without analytics table
      }))

      setUsers(transformedUsers)
      calculateAnalytics(transformedUsers)
      
    } catch (error) {
      console.error('Error in fetchRealAuthUsers:', error)
      setError('Failed to load user data')
    }
  }

  const calculateAnalytics = (userData) => {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const totalUsers = userData?.length || 0
    const newUsersThisWeek = userData?.filter(user => 
      new Date(user.registration_date) >= oneWeekAgo
    ).length || 0
    const activeUsersThisWeek = userData?.filter(user => 
      new Date(user.last_login) >= oneWeekAgo
    ).length || 0

    setAnalytics({
      totalUsers,
      newUsersThisWeek,
      activeUsersThisWeek
    })
  }

  if (loading) return (
    <div className={styles.container}>
      <Header />
      <div className={styles.loading}>Loading admin dashboard...</div>
    </div>
  )

  if (error) return (
    <div className={styles.container}>
      <Header />
      <div className={styles.error}>
        <h2>Error</h2>
        <p>{error}</p>
        <p className={styles.errorHelp}>
          Make sure you have:
          <br />• Set up the user_analytics table (run database/setup.sql)
          <br />• Enabled Row Level Security (RLS) in Supabase
          <br />• Proper admin permissions configured
        </p>
      </div>
    </div>
  )

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <span className={styles.adminBadge}>🔐</span>
            Admin Dashboard
          </h1>
          <div className={styles.adminInfo}>
            Logged in as: <strong>{user?.email}</strong>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className={styles.analyticsGrid}>
          <div className={styles.analyticsCard}>
            <div className={styles.cardIcon}>👥</div>
            <div className={styles.cardContent}>
              <h3>Total Users</h3>
              <p className={styles.cardNumber}>{analytics.totalUsers}</p>
            </div>
          </div>
          <div className={styles.analyticsCard}>
            <div className={styles.cardIcon}>✨</div>
            <div className={styles.cardContent}>
              <h3>New This Week</h3>
              <p className={styles.cardNumber}>{analytics.newUsersThisWeek}</p>
            </div>
          </div>
          <div className={styles.analyticsCard}>
            <div className={styles.cardIcon}>🚀</div>
            <div className={styles.cardContent}>
              <h3>Active This Week</h3>
              <p className={styles.cardNumber}>{analytics.activeUsersThisWeek}</p>
            </div>
          </div>
        </div>

        {/* User Details Table */}
        <div className={styles.usersList}>
          <h2>User Analytics ({users.length})</h2>
          <div className={styles.usersTable}>
            <div className={styles.tableHeader}>
              <span>Email</span>
              <span>Registration Date</span>
              <span>Last Login</span>
              <span>Login Count</span>
              <span>Status</span>
            </div>
            {users.map((user, index) => (
              <div key={user.user_id || index} className={styles.tableRow}>
                <span className={styles.userEmail}>{user.email}</span>
                <span>{new Date(user.registration_date).toLocaleDateString()}</span>
                <span>{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</span>
                <span className={styles.loginCount}>{user.login_count || 0}</span>
                <span className={styles.userStatus}>
                  {isRecentLogin(user.last_login) ? (
                    <span className={styles.statusActive}>Active</span>
                  ) : (
                    <span className={styles.statusInactive}>Inactive</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {users.length === 0 && (
          <div className={styles.noUsers}>
            <h3>No users found</h3>
            <p>No registered users in the system yet.</p>
          </div>
        )}
      </main>
    </div>
  )
}

// Helper function to determine if user is recently active
const isRecentLogin = (lastLogin) => {
  if (!lastLogin) return false
  const now = new Date()
  const loginDate = new Date(lastLogin)
  const daysDiff = (now - loginDate) / (1000 * 60 * 60 * 24)
  return daysDiff <= 7 // Active if logged in within last 7 days
}

export default AdminPage
