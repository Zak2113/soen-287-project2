// app/forgot-password/page.js
"use client";

import Link from 'next/link';
// Import your CSS module here
import styles from './forgot-password.module.css';

export default function ForgotPasswordPage() {

  const handleReset = async (e) => {
  e.preventDefault();

  const email = e.target.email.value;

  try {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    alert(data.message); // shows backend message
  } catch (err) {
    console.error(err);
    alert("Something went wrong.");
  }
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