// app/student/page.js
import Link from 'next/link';
import CourseCard from './_components/CourseCard';
import AssessmentItem from './_components/AssessmentItem';
import { auth } from "@/auth";
import { db } from "@/db";
// 1. Added assessments to the schema import
import { courses, users, enrollments, assessments } from "@/db/schema";
// 2. Added `asc` so we can sort deadlines chronologically
import { eq, asc, and } from "drizzle-orm";
import { redirect } from "next/navigation";

// Dictionary to translate DB codes to readable text
const termMap = {
  "F": "Fall", "W": "Winter", "FW": "Fall/Winter",
  "S": "Summer Full", "S1": "Summer 1", "S2": "Summer 2"
};

// Helper function for the date UI
function parseDateForUI(dateString) {
  if (!dateString) return { month: "TBD", day: "--" };
  const [year, month, day] = dateString.split('-');
  const date = new Date(year, month - 1, day);
  return {
    month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
    day: date.getDate().toString().padStart(2, '0')
  };
}

export default async function StudentDashboard() {
  const session = await auth();

  if (!session?.user || session.user.role !== "student") {
    redirect("/login");
  }

  const firstName = session.user.firstName || "Student";

  // ---------------------------------------------------------
  // 1. FETCH ENROLLED COURSES (Now filtering out disabled ones!)
  const enrolledCoursesData = await db
    .select({
      course: courses,
      instructor: users,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .leftJoin(users, eq(courses.instructorId, users.id))
    .where(
      and(
        eq(enrollments.studentId, session.user.id),
        eq(courses.isActive, true) // 🚨 THE FIX 🚨
      )
    );

  const myCourses = enrolledCoursesData.map((row) => {
    const { course, instructor } = row;
    const instructorName = instructor ? `${instructor.firstName} ${instructor.lastName}` : "Unknown";

    return {
      id: course.id,
      code: course.code,
      term: termMap[course.term] || course.term,
      title: course.title,
      instructor: `Prof. ${instructorName}`,
      progress: 0
    };
  });

  // ---------------------------------------------------------
  // 2. FETCH REAL ASSESSMENTS 
  const rawAssessments = await db
    .select({
      assessment: assessments,
      courseCode: courses.code, 
    })
    .from(assessments)
    .innerJoin(courses, eq(assessments.courseId, courses.id))
    .innerJoin(enrollments, eq(courses.id, enrollments.courseId))
    .where(
      and(
        eq(enrollments.studentId, session.user.id),
        eq(courses.isActive, true) // 🚨 THE FIX 🚨
      )
    )
    .orderBy(asc(assessments.date));

  // Setup today's date at midnight for accurate "Late" calculations
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Map the raw DB data into the exact format your AssessmentItem component needs
  const myDeadlines = rawAssessments.map((row) => {
    const { month, day } = parseDateForUI(row.assessment.date);

    // Calculate if it's late or due soon
    const assessmentDate = new Date(row.assessment.date);
    const isLate = assessmentDate < today;

    // Calculate days between today and the due date
    const diffTime = assessmentDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Dynamic Status text
    let status = "Upcoming";
    if (isLate) status = "Past Due";
    else if (diffDays <= 3) status = "Due Soon";

    return {
      id: row.assessment.id,
      month,
      day,
      title: row.assessment.title,
      course: row.courseCode, // e.g., "SOEN 287"
      status,
      isLate,
    };
  });

  return (
    <>
      <div className="dashboard-header">
        <h2>Welcome back, {firstName}!</h2>
        <p>You have {myDeadlines.length} upcoming assignments due this week.</p>
      </div>

      <div className="dashboard-grid">

        {/* LEFT COLUMN: My Courses Grid */}
        <section className="courses-section">
          <div className="section-header">
            <h3>Enrolled Courses</h3>
            <Link href="/student/add-course" className="btn btn-outline btn-sm">Add Course</Link>
          </div>

          <div className="course-cards">
            {myCourses.length === 0 ? (
              <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #eaeaea' }}>
                <p style={{ color: '#666', fontStyle: 'italic' }}>You are not enrolled in any courses yet.</p>
              </div>
            ) : (
              myCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  courseCode={course.code}
                  term={course.term}
                  title={course.title}
                  instructor={course.instructor}
                  progress={course.progress}
                />
              ))
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: Upcoming Assessments List */}
        <section className="assessments-section">
          <div className="section-header">
            <h3>Upcoming Deadlines</h3>
            <Link href="/student/calendar" className="btn btn-outline btn-sm">Calendar</Link>
          </div>

          <div className="assessment-list">
            {myDeadlines.length === 0 ? (
              <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #eaeaea', textAlign: 'center' }}>
                <p style={{ color: '#666', fontStyle: 'italic' }}>No upcoming deadlines!</p>
              </div>
            ) : (
              myDeadlines.map((item) => (
                <AssessmentItem
                  key={item.id}
                  month={item.month}
                  day={item.day}
                  title={item.title}
                  course={item.course}
                  status={item.status}
                  isLate={item.isLate}
                />
              ))
            )}
          </div>
        </section>

      </div>
    </>
  );
}