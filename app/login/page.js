// app/login/page.js
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();

  // This prevents the page from reloading if someone hits "Enter" to submit the form
  const handleLogin = (e) => {
    e.preventDefault(); 
    // Default form submission goes to the student dashboard
    router.push('/student'); 
  };

  return (
    <div className={styles['auth-wrapper']}>
      <div className={styles['auth-card']}>
        
        <div className={styles['auth-header']}>
          {/* Replaced standard link with Next.js Link */}
          <Link href="/" className="brand-logo">
            Noodle<span className="brand-accent">.</span>
          </Link>
          <h2>Welcome back</h2>
          <p>Sign in to access your courses</p>
        </div>

        {/* Swapped action attribute for React onSubmit handler */}
        <form onSubmit={handleLogin} className={styles["login-form"]}>
          <div className={styles["form-group"]}>
            {/* 'for' becomes 'htmlFor' */}
            <label htmlFor="email" className={styles["form-label"]}>Email Address</label>
            {/* Added trailing slash to close the input tag */}
            <input 
              type="email" 
              id="email" 
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
              className={styles["form-control"]} 
              placeholder="••••••••" 
              required 
            />
          </div>

          {/* Hidden submit button to allow "Enter" key to work natively */}
          

            <button type="submit" className="btn btn-primary btn-block">Sign In</button>
          
        </form>

        <div className={styles["auth-footer"]}>
          {/* Updated links to point to relative Next.js paths */}
          <p><Link href="/forgot-password" className={styles["text-link"]}>Forgot your password?</Link></p>
          <p>Don't have an account? <Link href="/register" className={styles["text-link"]}>Register here</Link>.</p>
        </div>

      </div>
    </div>
  );
}