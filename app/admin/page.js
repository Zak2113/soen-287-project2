// app/admin/page.js
import Link from 'next/link';
import { auth } from "@/auth"; 
import { db } from "@/db"; 
import { courses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

// Import the new interactive Client Component for the toggle buttons
import ToggleCourseButton from './_components/ToggleCourseButton';

// A simple dictionary to translate DB codes to readable text
const termMap = {
  "F": "Fall",
  "W": "Winter",
  "FW": "Fall/Winter",
  "S": "Summer Full",
  "S1": "Summer 1",
  "S2": "Summer 2"
};

export default async function AdminDashboardPage() {
  // 1. Get the admin's session data
  const session = await auth();
  
  // Security Redirect: If not logged in or not an admin, kick them out.
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  const firstName = session.user.firstName || "Admin";
  const fullName = `${session.user.firstName} ${session.user.lastName}`;

  // 2. Fetch courses ONLY belonging to this specific admin
  // This prevents Admin A from seeing Admin B's courses
  const myCourses = await db
    .select()
    .from(courses)
    .where(eq(courses.instructorId, session.user.id));

  // 3. Separate the courses based on the isActive boolean
  const enabledCourses = myCourses.filter(course => course.isActive === true);
  const hiddenCourses = myCourses.filter(course => course.isActive === false);

  return (
    <>
      <div className="dashboard-header">
        <h2>Welcome back, {firstName}!</h2>
        <p>Manage the courses you teach.</p>
      </div>

      <div className="dashboard-grade">
        
        {/* LEFT COLUMN: My Courses Grid */}
        <section className="courses-section">
          <div className="section-header">
            <h3>Enabled Courses</h3>
            <Link href="/admin/create-course" className="btn btn-outline btn-sm">
              New Course
            </Link>
          </div>

          <div className="course-cards">
            {enabledCourses.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>You have no active courses right now.</p>
            ) : (
              enabledCourses.map((course) => (
                <div key={course.id} className="course-card">
                  <div className="course-card-header">
                    <span className="course-code">{course.code}</span>
                    {/* Translate the term here! Fallback to the raw term just in case */}
                    <span className="course-term">{termMap[course.term] || course.term}</span>
                  </div>
                  <h4 className="course-title">{course.title}</h4>
                  
                  {/* Instructor name dynamically pulled from the session */}
                  <p className="course-instructor">Prof. {fullName}</p>

                  <div className="course-btns">
                    <Link href={`/admin/course/${course.id}`} className="btn btn-outline btn-sm">
                      Manage Course
                    </Link>
                    {/* Dynamic Toggle Button */}
                    <ToggleCourseButton courseId={course.id} isActive={course.isActive} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Hidden Courses Section */}
        <section className="courses-section" style={{ marginTop: '2rem' }}>
          <div className="section-header">
            <h3>Hidden Courses</h3>
          </div>

          <div className="course-cards">
            {hiddenCourses.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No hidden courses.</p>
            ) : (
              hiddenCourses.map((course) => (
                <div key={course.id} className="course-card">
                  <div className="course-card-header">
                    <span className="course-code">{course.code}</span>
                    {/* Translate the term here as well */}
                    <span className="course-term">{termMap[course.term] || course.term}</span>
                  </div>
                  <h4 className="course-title">{course.title}</h4>
                  <p className="course-instructor">Prof. {fullName}</p>

                  <div className="course-btns">
                    <Link href={`/admin/course/${course.id}`} className="btn btn-outline btn-sm">
                      Manage Course
                    </Link>
                    {/* Dynamic Toggle Button */}
                    <ToggleCourseButton courseId={course.id} isActive={course.isActive} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </>
  );
}