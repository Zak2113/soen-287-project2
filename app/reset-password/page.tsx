"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// 1. Extract the form and the useSearchParams hook into its own component
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setMessage(data.message);
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Update Password</button>
      </form>

      {message && <p>{message}</p>}
    </>
  );
}

// 2. The main default export now wraps that form in a Suspense boundary
export default function ResetPasswordPage() {
  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Reset Password</h2>
      
      <Suspense fallback={<p>Loading form...</p>}>
        <ResetPasswordForm />
      </Suspense>
      
    </div>
  );
}