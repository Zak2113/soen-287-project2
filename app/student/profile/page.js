"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { updateProfile, updatePassword } from "@/app/actions/profile"; // We'll create these

export default function AccountSettingsPage() {
  const { data: session, update } = useSession();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState({ type: "", text: "" });

  // Get user from session or fallback to empty while loading
  const user = session?.user || {};

  // Dynamic Initials helper
  const initials = (user.firstName?.[0] || "") + (user.lastName?.[0] || "");

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result?.success) {
        setMessage({ type: "success", text: "Profile updated!" });
        // This refreshes the client-side session so the sidebar name updates too
        await update();
      } else {
        setMessage({ type: "error", text: result?.error || "Update failed." });
      }
    });
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    const formData = new FormData(e.currentTarget);

    if (formData.get("newPassword").length < 8) {
      setMessage({ type: "error", text: "New password must be 8+ characters." });
      return;
    }

    startTransition(async () => {
      const result = await updatePassword(formData);
      if (result?.success) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        e.target.reset(); // Clear password fields
      } else {
        setMessage({ type: "error", text: result?.error || "Failed to update password." });
      }
    });
  };

  return (
    <>
      <div className="dashboard-header">
        <h2>Account Settings</h2>
        <p>Manage your personal information and security preferences.</p>
      </div>

      {/* Alert Message */}
      {message.text && (
        <div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}
          style={{
            padding: '10px', borderRadius: '5px', marginBottom: '20px',
            backgroundColor: message.type === "success" ? "#2ecc71" : "#e74c3c", color: 'white'
          }}>
          {message.text}
        </div>
      )}

      {/* Personal Information Section */}
      <section className="profile-section">
        <div className="profile-header">
          <div className="profile-avatar-large">{initials || "??"}</div>
          <div className="profile-title">
            <h3>{user.firstName} {user.lastName}</h3>
            <span className="badge">{user.role}</span>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate}>
          <div className="profile-grid">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input type="text" id="firstName" name="firstName" className="form-control" defaultValue={user.firstName} required />
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input type="text" id="lastName" name="lastName" className="form-control" defaultValue={user.lastName} required />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input type="email" id="email" name="email" className="form-control" defaultValue={user.email} required />
            </div>

            <div className="form-group">
              <label htmlFor="studentId" className="form-label">User ID</label>
              <input type="text" id="studentId" className="form-control" defaultValue={user.studentId} disabled />
              <small>ID cannot be changed.</small>
            </div>
          </div>

          <button type="submit" disabled={isPending} className="btn btn-primary" style={{ marginTop: '1rem' }}>
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </section>

      {/* Security Section */}
      <section className="profile-section">
        <div className="section-header">
          <h3>Security & Password</h3>
        </div>

        <form onSubmit={handlePasswordUpdate} style={{ marginTop: '1.5rem' }}>
          <div className="profile-grid">
            <div className="form-group">
              <label htmlFor="currentPassword" className="form-label">Current Password</label>
              <input type="password" id="currentPassword" name="currentPassword" className="form-control" placeholder="••••••••" required />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword" className="form-label">New Password</label>
              <input type="password" id="newPassword" name="newPassword" className="form-control" placeholder="••••••••" required />
            </div>
          </div>

          <button type="submit" disabled={isPending} className="btn btn-outline">
            Update Password
          </button>
        </form>
      </section>
    </>
  );
}