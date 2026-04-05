// app/page.js
import Link from 'next/link';
import Navbar from './components/Navbar';

export default function LandingPage() {
  return (
    <>
      <Navbar />

      <main>
        <section className="hero">
          <div className="container">
            <h1>The smart way to manage learning</h1>
            <p>A powerful, intuitive platform designed to connect students and instructors seamlessly.</p>
            <div className="hero-actions">
              <Link href="/register" className="btn btn-primary">Start Learning</Link>
            </div>
          </div>
        </section>

        

        <section id="features" className="features container">
          <h2 className="section-title">Why choose Noodle?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Centralized Course Management</h3>
              <p>Easily access all your enrolled courses, syllabi, and materials in one organized workspace. Never lose track of a document again.</p>
            </div>
            <div className="feature-card">
              <h3>Real-Time Grade Tracking</h3>
              <p>Input your earned marks and instantly view your current calculated averages. Monitor your progress through intuitive visual charts.</p>
            </div>
            <div className="feature-card">
              <h3>Unified Assessment Calendar</h3>
              <p>View upcoming assignments, quizzes, and exams across all your active courses on a single, unified dashboard to manage deadlines effectively.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 Noodle Learning Management System</p>
        </div>
      </footer>
    </>
  );
}