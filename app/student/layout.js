// app/student/layout.js

import { auth } from "@/auth"; // Import your NextAuth config
import StudentSidebar from './_components/StudentSidebar';
import Link from 'next/link';
import ThemeToggle from '@/app/components/ThemeToggle';

export default async function StudentLayout({ children }) {
  // 1. Fetch the session on the server
  const session = await auth();

  // 2. Safely extract the names (with fallbacks if they are missing)
  const firstName = session?.user?.firstName || "Student";
  const lastName = session?.user?.lastName || "User";
  
  // 3. Construct the variables for the UI
  const fullName = `${firstName} ${lastName}`;
  const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();

  return (
    <div className="app-layout">
      
      {/* 1. The Sidebar Component (Rendered on the left) */}
      <StudentSidebar />

      {/* 2. The Main Content Area (Rendered on the right) */}
      {/* Next.js injects the specific page.js content into this {children} variable */}
      <div className="main-wrapper">
        <header className="top-header">
          <div className="header-title">Student Portal</div>
          
          <div className="user-profile">
            {/* Inject the dynamic full name */}
            <span className="user-name">{fullName}</span>
            <div className="user-avatar">
              {/* Inject the dynamic initials */}
              <Link href="/student/profile">{initials}</Link>
            </div>
            <ThemeToggle />
          </div>
        </header>
        
        <main className="main-content">
          <div className="content-area">{children}</div>
        </main>
      </div>
    </div>
  );
}