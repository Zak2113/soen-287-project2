"use client"; 

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTransition } from 'react'; // Added for loading state
import { logoutUser } from '@/app/actions/auth'; // Import your logout action
import ThemeToggle from '@/app/components/ThemeToggle';

export default function StudentSidebar() {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    // startTransition wraps the server action to handle the "loading" state
    startTransition(async () => {
      await logoutUser();
    });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link href="/" className="brand-logo">
          Noodle<span className="brand-accent">.</span>
        </Link>
        <ThemeToggle />
      </div>

      <nav className="sidebar-nav">
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
        {/* Swapped Link for a Button to trigger the Server Action */}
        <button 
          onClick={handleLogout}
          disabled={isPending}
          className="nav-item logout-btn"
          style={{ 
            width: '100%', 
            textAlign: 'left', 
            background: 'none', 
            border: 'none', 
            cursor: isPending ? 'not-allowed' : 'pointer' 
          }}
        >
          {isPending ? "Logging Out..." : "Log Out"}
        </button>
      </div>
    </aside>
  );
}