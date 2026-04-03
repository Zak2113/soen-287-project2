"use client"; // Required to read the current URL path

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function StudentSidebar() {
  // This hook grabs the current URL (e.g., "/student/courses")
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        {/* Link back to the public landing page */}
        <Link href="/" className="brand-logo">
          Noodle<span className="brand-accent">.</span>
        </Link>
      </div>

      <nav className="sidebar-nav">
        {/* We use template literals (``) to conditionally add the "active" class */}
        <Link 
          href="/student" 
          className={`nav-item ${pathname === '/student' ? 'active' : ''}`}
        >
          Dashboard
        </Link>
        
        <Link 
          href="/student/courses" 
          className={`nav-item ${pathname.includes('/student/courses') ? 'active' : ''}`}
        >
          My Courses
        </Link>
        
        <Link 
          href="/student/grades" 
          className={`nav-item ${pathname.includes('/student/grades') ? 'active' : ''}`}
        >
          Grades
        </Link>
        
        <Link 
          href="/student/calendar" 
          className={`nav-item ${pathname.includes('/student/calendar') ? 'active' : ''}`}
        >
          Calendar
        </Link>
        
        <Link 
          href="/student/analytics" 
          className={`nav-item ${pathname.includes('/student/analytics') ? 'active' : ''}`}
        >
          Analytics
        </Link>
      </nav>

      <div className="sidebar-footer">
        {/* Log Out link (you can update this path later when you build auth) */}
        <Link href="/login" className="nav-item">
          Log Out
        </Link>
      </div>
    </aside>
  );
}