// app/login/page.js
"use client";


import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { getSession } from 'next-auth/react'; // Import this to check the role
import { loginUser } from '../actions/auth';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginUser(formData);

      if (result?.error) {
        setError(result.error);
      } else {
        // 1. Fetch the session we just created
        const session = await getSession();
        
        // 2. Extract the role we saved in the JWT callback
        const role = session?.user?.role;

        // 3. Redirect based strictly on the role
        if (role === "admin") {
          router.push('/admin');
        } else {
          router.push('/student');
        }
        
        // Refresh to ensure all layout components see the new session
        router.refresh();
      }
    });
  };

  return (
    <div className={styles['auth-wrapper']}>
      <div className={styles['auth-card']}>
        
        <div className={styles['auth-header']}>
          <Link href="/" className="brand-logo">
            Noodle<span className="brand-accent">.</span>
          </Link>
          <h2>Welcome back</h2>
          <p>Sign in to access your courses</p>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{ color: 'white', background: '#e74c3c', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className={styles["login-form"]}>
          <div className={styles["form-group"]}>
            <label htmlFor="email" className={styles["form-label"]}>Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" // Added 'name' attribute for FormData
              className={styles["form-control"]} 
              placeholder="email@university.edu" 
              required 
            />
          </div>
          
          <div className={styles["form-group"]}>
            <label htmlFor="password" className={styles["form-label"]}>Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" // Added 'name' attribute for FormData
              className={styles["form-control"]} 
              placeholder="••••••••" 
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={isPending}
          >
            {isPending ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className={styles["auth-footer"]}>
          <p><Link href="/forgot-password" className={styles["text-link"]}>Forgot your password?</Link></p>
          <p>Don't have an account? <Link href="/register" className={styles["text-link"]}>Register here</Link>.</p>
        </div>
      </div>
    </div>
  );
}