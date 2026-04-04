// app/register/page.js
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react'; // Added hooks
import { registerUser } from '../actions/register'; // Import your action
import styles from './register.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({}); // Clear previous Zod errors

    const formData = new FormData(e.currentTarget);

    // 1. Client-Side Match Check
    if (formData.get("password") !== formData.get("confirmPassword")) {
      setError("Validation failed.");
      setFieldErrors({ confirmPassword: ["Passwords do not match."] }); 
      return;
    }

    startTransition(async () => {
      // 2. Call Server Action
      const result = await registerUser(formData);

      // 3. Handle Responses
      if (result?.success) {
        router.push('/login?registered=true');
      }
      else if (result?.errors) {
        // SAVE ZOD ERRORS TO STATE so the JSX can see them
        setFieldErrors(result.errors);
        setError("Validation failed. Please check the requirements below.");
      }
      else if (result?.error) {
        setError(result.error);
      }
      else {
        setError(result?.message || "An unexpected error occurred.");
      }
    });
  };

  return (
    <div className={styles["auth-wrapper"]}>
      <div className={styles["auth-card"]}>

        <div className={styles["auth-header"]}>
          <Link href="/" className="brand-logo">
            Noodle<span className="brand-accent">.</span>
          </Link>
          <h2>Register for an account</h2>
        </div>

        {/* Specific Zod Bullet Points */}
        {Object.keys(fieldErrors).length > 0 && (
          <ul style={{
            color: 'white',
            background: '#e74c3c',
            padding: '10px',
            borderRadius: '5px',
            listStyle: 'inside',
            marginBottom: '15px'
          }}>
            {Object.values(fieldErrors).flat().map((err, i) => (
              <li key={i} style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                {err}
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleRegister} className={styles["login-form"]}>
          {/* First Name & Last Name (Splitting 'name' from your HTML to match DB schema) */}
          <div className={styles["form-group"]}>
            <label htmlFor="firstName" className={styles["form-label"]}>First Name</label>
            <input name="firstName" id="firstName" className={styles["form-control"]} placeholder="First Name" required />
          </div>

          <div className={styles["form-group"]}>
            <label htmlFor="lastName" className={styles["form-label"]}>Last Name</label>
            <input name="lastName" id="lastName" className={styles["form-control"]} placeholder="Last Name" required />
          </div>

          <div className={styles["form-group"]}>
            <label htmlFor="email" className={styles["form-label"]}>Email Address</label>
            <input type="email" name="email" id="email" className={styles["form-control"]} placeholder="student@university.edu" required />
          </div>

          <div className={styles["form-group"]}>
            <label htmlFor="password" className={styles["form-label"]}>Password</label>
            <input type="password" name="password" id="password" className={styles["form-control"]} placeholder="••••••••" required />
          </div>

          <div className={styles["form-group"]}>
            <label htmlFor="confirm-password" className={styles["form-label"]}>Confirm Password</label>
            <input type="password" name="confirmPassword" id="confirm-password" className={styles["form-control"]} placeholder="••••••••" required />
          </div>

          <div className={styles["form-group"]}>
            <label htmlFor="role" className={styles["form-label"]}>Account Type</label>
            <select id="role" name="role" className={styles["form-control"]} required>
              <option value="student">Student</option>
              <option value="admin">Instructor / Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isPending}
          >
            {isPending ? "Creating Account..." : "Register"}
          </button>
        </form>

        <div className={styles["auth-footer"]}>
          <p>Already have an account? <Link href="/login" className={styles["text-link"]}>Login here</Link>.</p>
        </div>
      </div>
    </div>
  );
}