"use client"; 

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTransition } from 'react'; // Added for loading state
import { logoutUser } from '@/app/actions/auth'; // Import your logout action

export default function AdminSidebar() {
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
      </div>

      <nav className="sidebar-nav">
        <Link 
          href="/admin" 
          className={`nav-item ${pathname === '/admin' ? 'active' : ''}`}
        >
          Dashboard
        </Link>
        
        <Link 
          href="/admin/create-course" 
          className={`nav-item ${pathname.includes('/admin/create-course') ? 'active' : ''}`}
        >
          Create Course
        </Link>
        
        
        <Link 
          href="/admin/analytics" 
          className={`nav-item ${pathname.includes('/admin/analytics') ? 'active' : ''}`}
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