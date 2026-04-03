// app/register/page.js
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './register.module.css';

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = (e) => {
    e.preventDefault(); 
    
    // For now, we will just fake a successful registration 
    // and instantly route them back to the login page
    console.log("Account created!");
    router.push('/login'); 
  };

  return (
    <div className={styles["auth-wrapper"]}>
      <div className={styles["auth-card"]}>
        
        <div className={styles["auth-header"]}>
          {/* Swapped to Next.js Link pointing to root */}
          <Link href="/" className="brand-logo">
            Noodle<span className="brand-accent">.</span>
          </Link>
          <h2>Register for an account</h2>
        </div>

        {/* Swapped action attribute for React onSubmit handler */}
        <form onSubmit={handleRegister} className={styles["login-form"]}>

          <div className={styles["form-group"]}>
            <label htmlFor="name" className={styles["form-label"]}>Name</label>
            <input 
              type="text" // Fixed from type="name" (not a valid HTML type)
              id="name" 
              name="name"
              className={styles["form-control"]} 
              placeholder="Full Name" 
              required 
            />
          </div>

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
          
          <div className={styles["form-group"]}>
            {/* Fixed duplicate ID */}
            <label htmlFor="confirm-email" className={styles["form-label"]}>Confirm Email Address</label>
            <input 
              type="email" 
              id="confirm-email" 
              name="confirmEmail"
              className={styles["form-control"]} 
              placeholder="student@university.edu" 
              required 
            />
          </div>

          <div className={styles["form-group"]}>
            <label htmlFor="password" className={styles["form-label"]}>Password</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              className={styles["form-control"]} 
              placeholder="••••••••" 
              required 
            />
          </div>

          <div className={styles["form-group"]}>
            {/* Fixed duplicate ID */}
            <label htmlFor="confirm-password" className={styles["form-label"]}>Confirm Password</label>
            <input 
              type="password" 
              id="confirm-password" 
              name="confirmPassword"
              className={styles["form-control"]} 
              placeholder="••••••••" 
              required 
            />
          </div>

          <div className={styles["form-group"]}>
            <label htmlFor="role" className={styles["form-label"]}>Account Type</label>
            <select 
              id="role" 
              name="role"
              className={styles["form-control"]} 
              required
            >
              <option value="student">Student</option>
              <option value="admin">Instructor / Admin</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Register
          </button>
        </form>

        <div className={styles["auth-footer"]}>
          {/* Updated links to point to relative Next.js paths */}
          <p><Link href="/forgot-password" className={styles["text-link"]}>Forgot your password?</Link></p>
          <p>Already have an account? <Link href="/login" className={styles["text-link"]}>Login here</Link>.</p>
        </div>

      </div>
    </div>
  );
}