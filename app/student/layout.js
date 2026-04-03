// app/student/layout.js

import StudentSidebar from './_components/StudentSidebar';

export default function StudentLayout({ children }) {
  return (
    <div className="app-layout">
      
      {/* 1. The Sidebar Component (Rendered on the left) */}
      <StudentSidebar />

      {/* 2. The Main Content Area (Rendered on the right) */}
      {/* Next.js injects the specific page.js content into this {children} variable */}
      <main className="main-content">
        {children}
      </main>

    </div>
  );
}