import React, { useState } from 'react'
import LoginForm from '../components/Auth/LoginForm'
import SignUpForm from '../components/Auth/SignUpForm'
import styles from '../styles/LoginPage.module.css'

const LoginPage = ({ isSignUp: defaultSignUp = false }) => {
  const [isSignUp, setIsSignUp] = useState(defaultSignUp)

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h1>
          <p className={styles.subtitle}>
            {isSignUp ? 'Join our platform today' : 'Access your account'}
          </p>
        </div>
        
        {isSignUp ? <SignUpForm /> : <LoginForm />}
        
        <div className={styles.switchMode}>
          <p className={styles.switchText}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </p>
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className={styles.switchButton}
          >
            {isSignUp ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
