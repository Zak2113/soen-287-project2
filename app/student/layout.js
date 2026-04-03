// app/student/layout.js

import StudentSidebar from './_components/StudentSidebar';
import Link from 'next/link';

export default function StudentLayout({ children }) {
  return (
    <div className="app-layout">
      
      {/* 1. The Sidebar Component (Rendered on the left) */}
      <StudentSidebar />

      {/* 2. The Main Content Area (Rendered on the right) */}
      {/* Next.js injects the specific page.js content into this {children} variable */}
      <div className="main-wrapper">
        <header class="top-header">
                <div class="header-title">Student Portal</div>
                
                <div class="user-profile">
                    <span class="user-name">Student User</span>
                    <div class="user-avatar">
                        <Link href="/student/profile">SU</Link>
                    </div>
                </div>
            </header>
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}