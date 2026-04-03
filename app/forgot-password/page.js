// app/forgot-password/page.js
"use client";

import Link from 'next/link';
// Import your CSS module here
import styles from './forgot-password.module.css';

export default function ForgotPasswordPage() {

  const handleReset = (e) => {
    e.preventDefault(); 
    
    // Grab the email
    const email = e.target.email.value;
    
    // In the future, this will call your backend action.
    // For now, we'll just log it and maybe alert the user.
    console.log(`Password reset link sent to: ${email}`);
    alert("If an account exists, a reset link has been sent.");
  };

  return (
    <div className={styles["auth-wrapper"]}>
      <div className={styles["auth-card"]}>
        
        <div className={styles["auth-header"]}>
          {/* Swapped to Next.js Link pointing to root */}
          <Link href="/" className="brand-logo">
            Noodle<span className="brand-accent">.</span>
          </Link>
          <h2>Reset your password</h2>
          <p>An email will be sent to you to reset your password</p>
        </div>

        {/* Swapped action attribute for React onSubmit handler */}
        <form onSubmit={handleReset} className={styles["login-form"]}>
          
          <div className={styles["form-group"]}>
            <label htmlFor="email" className={styles["form-label"]}>Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              className={styles["form-control"]} 
              placeholder="student@university.edu" 
              required 
            />
          </div>

          {/* Multiple classes injected using a template literal */}
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
          >
            Reset Password
          </button>
          
        </form>

        <div className={styles["auth-footer"]}>
          {/* Updated link to point back to the login route */}
          <p>Remembered your password? <Link href="/login" className={styles["text-link"]}>Login here</Link>.</p>
        </div>

      </div>
    </div>
  );
}