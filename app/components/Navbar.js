"use client";

import Link from 'next/link';
import ThemeToggle from '@/app/components/ThemeToggle';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" className="brand-logo">
          Noodle<span className="brand-accent">.</span>
        </Link>
        <nav className="nav-links">
          <ThemeToggle />
          <Link href="/login" className="login-link">Sign In</Link>
          <Link href="/register" className="btn btn-primary">Register</Link>
        </nav>
      </div>
    </header>
  );
}
