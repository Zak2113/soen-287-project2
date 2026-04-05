// app/admin/profile/_components/ProfileForms.js
"use client";

import { useState, useTransition, useRef } from "react";
// Imports the Server Actions you created earlier
import { updateProfile, updatePassword } from "@/app/actions/profile"; 

export default function ProfileForms({ user }) {
  const [isPendingProfile, startTransitionProfile] = useTransition();
  const [isPendingPassword, startTransitionPassword] = useTransition();
  const [passwordError, setPasswordError] = useState(""); 
  const passwordFormRef = useRef(null);

  // Dynamically generate initials (e.g., "Zakariyae User" -> "ZU")
  const initials = `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase();

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransitionProfile(async () => {
      const result = await updateProfile(formData); 
      if (result?.error) {
        alert(result.error);
      } else {
        alert("Profile updated successfully!");
      }
    });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError(""); // Clear any previous errors

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");

    // Frontend Validation
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return; 
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Your new passwords do not match.");
      return; 
    }

    startTransitionPassword(async () => {
      const result = await updatePassword(formData); 
      if (result?.error) {
        setPasswordError(result.error); // Show server errors (e.g., wrong current password)
      } else {
        alert("Password updated successfully!");
        passwordFormRef.current?.reset(); 
      }
    });
  };

  return (
    <>
      {/* Personal Information Section */}
      <section className="profile-section" style={{ background: 'var(--white)', padding: '24px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <div className="profile-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <div className="profile-avatar-large" style={{ 
            background: 'var(--primary-blue)', 
            color: 'var(--white)', 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '1.5rem', 
            fontWeight: 'bold' 
          }}>
            {initials}
          </div>
          <div className="profile-title">
            <h3 style={{ margin: 0, color: 'var(--text-main)' }}>{user.firstName} {user.lastName}</h3>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit}>
          <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="role" className="form-label" style={{ display: 'block', marginBottom: '5px', color: 'var(--text-main)', fontWeight: '500' }}>Role (Display Only)</label>
              <select id="role" name="role" className="form-control" defaultValue="administrator" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--white)' }}>
                <option value="administrator">Administrator</option>
                <option value="professor">Professor</option>
                <option value="associate_professor">Associate Professor</option>
                <option value="teaching_assistant">Teaching Assistant</option>
              </select>
            </div>
          </div>

          <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="firstName" className="form-label" style={{ display: 'block', marginBottom: '5px', color: 'var(--text-main)', fontWeight: '500' }}>First Name</label>
              <input type="text" id="firstName" name="firstName" className="form-control" defaultValue={user.firstName} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="lastName" className="form-label" style={{ display: 'block', marginBottom: '5px', color: 'var(--text-main)', fontWeight: '500' }}>Last Name</label>
              <input type="text" id="lastName" name="lastName" className="form-control" defaultValue={user.lastName} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="email" className="form-label" style={{ display: 'block', marginBottom: '5px', color: 'var(--text-main)', fontWeight: '500' }}>Email</label>
              <input type="email" id="email" name="email" className="form-control" defaultValue={user.email} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="studentId" className="form-label" style={{ display: 'block', marginBottom: '5px', color: 'var(--text-main)', fontWeight: '500' }}>Instructor ID</label>
              {/* Disabled inputs are not sent in FormData, perfect for read-only IDs */}
              <input type="text" id="studentId" className="form-control" value={user.studentId} disabled style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-light)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={isPendingProfile} style={{ marginTop: '1.5rem', padding: '10px 20px', borderRadius: '4px' }}>
            {isPendingProfile ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </section>

      {/* Security Section */}
      <section className="profile-section" style={{ marginTop: '2rem', background: 'var(--white)', padding: '24px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <div className="section-header" style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>
          <h3 style={{ color: 'var(--text-main)', margin: 0 }}>Security & Password</h3>
        </div>

        <form ref={passwordFormRef} onSubmit={handlePasswordSubmit} style={{ marginTop: '1.5rem' }}>
          
          {/* Validation Error Banner */}
          {passwordError && (
            <div style={{ background: 'var(--dev-bg)', color: 'var(--dev-text)', padding: '12px', borderRadius: '4px', border: '1px solid var(--dev-border)', marginBottom: '15px', fontSize: '0.9rem', fontWeight: '500' }}>
              ⚠️ {passwordError}
            </div>
          )}

          <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="currentPassword" className="form-label" style={{ display: 'block', marginBottom: '5px', color: 'var(--text-main)', fontWeight: '500' }}>Current Password</label>
              <input type="password" id="currentPassword" name="currentPassword" className="form-control" placeholder="••••••••" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="newPassword" className="form-label" style={{ display: 'block', marginBottom: '5px', color: 'var(--text-main)', fontWeight: '500' }}>New Password</label>
              <input type="password" id="newPassword" name="newPassword" className="form-control" placeholder="••••••••" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="confirmPassword" className="form-label" style={{ display: 'block', marginBottom: '5px', color: 'var(--text-main)', fontWeight: '500' }}>Confirm New Password</label>
              <input type="password" id="confirmPassword" name="confirmPassword" className="form-control" placeholder="••••••••" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
            </div>
          </div>

          <button type="submit" className="btn btn-outline" disabled={isPendingPassword} style={{ marginTop: '1.5rem', padding: '10px 20px', borderRadius: '4px', border: '1px solid var(--primary-blue)', color: 'var(--primary-blue)', background: 'transparent', cursor: 'pointer' }}>
            {isPendingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
      </section>
    </>
  );
}