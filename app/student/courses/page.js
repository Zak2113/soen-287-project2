// app/student/courses/page.js
import { auth } from "@/auth";
import { db } from "@/db";
import { courses, users, enrollments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";

const termMap = {
  "F": "Fall", "W": "Winter", "FW": "Fall/Winter",
  "S": "Summer Full", "S1": "Summer 1", "S2": "Summer 2"
};

export default async function StudentCoursesDirectory() {
  const session = await auth();
  
  // Security Check: Ensure only students can access this
  if (!session?.user || session.user.role !== "student") {
    redirect("/login");
  }

  // 1. Fetch ALL enrolled courses for this specific student
  const enrolledCoursesData = await db
    .select({
      course: courses,
      instructor: users,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .leftJoin(users, eq(courses.instructorId, users.id))
    .where(eq(enrollments.studentId, session.user.id)); // 🚨 Filters ONLY to this student!

  // 2. Sort the courses into Active and Past (Disabled) buckets
  const activeCourses = [];
  const pastCourses = [];

  enrolledCoursesData.forEach((row) => {
    if (row.course.isActive) {
      activeCourses.push(row);
    } else {
      pastCourses.push(row);
    }
  });

  // Reusable render function for the course cards
  const renderCourseGrid = (courseArray, emptyMessage, isActiveSection) => {
    if (courseArray.length === 0) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', background: 'var(--white)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {courseArray.map((row) => {
          const { course, instructor } = row;
          const instructorName = instructor ? `${instructor.firstName} ${instructor.lastName}` : "Unknown Instructor";

          return (
            <div key={course.id} className="add-course-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: isActiveSection ? 1 : 0.75 }}>
              
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="course-code" style={{ fontWeight: 'bold', color: isActiveSection ? 'var(--dev-text)' : 'var(--text-muted)', background: 'var(--dev-bg)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>
                    {course.code}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                    {termMap[course.term] || course.term}
                  </span>
                </div>
                
                <h3 style={{ fontSize: '1.2rem', marginBottom: '5px', color: isActiveSection ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  {course.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '15px' }}>
                  Prof. {instructorName}
                </p>
              </div>

              <div className="form-group" style={{ marginBottom: 0, display: 'flex', gap: '10px' }}>
                <Link 
                  href={`/student/courses/${course.id}`} 
                  className={isActiveSection ? "btn btn-primary" : "btn btn-outline"} 
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  {isActiveSection ? "Go to Class" : "View Past Records"}
                </Link>
              </div>
              
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div className="dashboard-header flex-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>My Course History</h2>
          <p>View your current active classes and past academic records.</p>
        </div>
        <Link href="/student/add-course" className="btn btn-outline">
          + Enroll in a Class
        </Link>
      </div>

      {/* Active Courses Section */}
      <section className="profile-section" style={{ marginTop: '2rem' }}>
        <div className="section-header" style={{ borderBottom: '2px solid var(--primary-blue)', paddingBottom: '10px', marginBottom: '20px' }}>
          <h3 style={{ color: 'var(--primary-blue)' }}>Current Classes</h3>
        </div>
        {renderCourseGrid(activeCourses, "You are not currently enrolled in any active classes.", true)}
      </section>

      {/* Disabled / Past Courses Section */}
      <section className="profile-section" style={{ marginTop: '3rem' }}>
        <div className="section-header" style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>
          <h3 style={{ color: 'var(--text-muted)' }}>Past Courses</h3>
        </div>
        {renderCourseGrid(pastCourses, "You do not have any past course records yet.", false)}
      </section>
    </>
  );
}