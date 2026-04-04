// app/student/settings/page.js
"use client";

export default function AccountSettingsPage() {
  
  // MOCK DATABASE DATA
  // Later, this will be: const currentUser = await fetchUser(session.id);
  const currentUser = {
    firstName: "Zak",
    lastName: "Abdi",
    email: "zak.abdi211@gmail.com",
    studentId: "1002345222",
    // Dynamically grab the first letter of each name for the avatar
    get initials() {
      return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`;
    }
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    console.log("Profile updated!");
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    console.log("Password updated!");
  };

  return (
    <>
      <div className="dashboard-header">
        <h2>Account Settings</h2>
        <p>Manage your personal information and security preferences.</p>
      </div>

      {/* Personal Information Section */}
      <section className="profile-section">
        <div className="profile-header">
          {/* Dynamic Initials */}
          <div className="profile-avatar-large">{currentUser.initials}</div>
          <div className="profile-title">
            {/* Dynamic Full Name */}
            <h3>{currentUser.firstName} {currentUser.lastName}</h3>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate}>
          <div className="profile-grid">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">First Name</label>
              {/* Dynamic Default Values injected from the object */}
              <input type="text" id="firstName" name="firstName" className="form-control" defaultValue={currentUser.firstName} required />
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input type="text" id="lastName" name="lastName" className="form-control" defaultValue={currentUser.lastName} required />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input type="email" id="email" name="email" className="form-control" defaultValue={currentUser.email} />
            </div>

            <div className="form-group">
              <label htmlFor="studentId" className="form-label">Student ID</label>
              <input type="text" id="studentId" name="studentId" className="form-control" defaultValue={currentUser.studentId} disabled />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Save Changes</button>
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
              {/* Passwords remain blank placeholders for security */}
              <input type="password" id="currentPassword" name="currentPassword" className="form-control" placeholder="••••••••" required />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword" className="form-label">New Password</label>
              <input type="password" id="newPassword" name="newPassword" className="form-control" placeholder="••••••••" required />
            </div>
          </div>

          <button type="submit" className="btn btn-outline">Update Password</button>
        </form>
      </section>
    </>
  );
}