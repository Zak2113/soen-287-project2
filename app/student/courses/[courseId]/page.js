// app/student/courses/[courseId]/page.js
import Link from 'next/link';
import CourseAssessmentItem from '../../_components/CourseAssessmentItem';
import { auth } from "@/auth";
import { db } from "@/db";
import { courses, users, enrollments, assessments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function CourseDetail({ params }) {
  // 1. Security Check
  const session = await auth();
  if (!session?.user || session.user.role !== "student") {
    redirect("/login");
  }

  const resolvedParams = await params;
  const courseId = resolvedParams.courseId;

  // 2. Fetch Course & Verify Enrollment (IDOR Protection)
  // This query only returns a result if the student is actively enrolled
  const [enrollmentRecord] = await db
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
        eq(enrollments.courseId, courseId)
      )
    );

  // If no record is found, they aren't enrolled (or the course doesn't exist)
  if (!enrollmentRecord) {
    return (
      <div className="dashboard-header">
        <h2>Access Denied</h2>
        <p>You are not enrolled in this course, or it does not exist.</p>
        <Link href="/student" className="btn btn-outline" style={{ marginTop: '1rem' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const { course, instructor } = enrollmentRecord;
  const instructorName = instructor ? `${instructor.firstName} ${instructor.lastName}` : "Unknown";

  // 3. Fetch real assessments for this course
  const courseAssessments = await db
    .select()
    .from(assessments)
    .where(eq(assessments.courseId, courseId));

  return (
    <div>
      {/* Navigation Back Button */}
      <div className="form-group">
        <Link href="/student" className="login-link">&larr; Back to Dashboard</Link>
      </div>

      {/* Course Header */}
      <div className="dashboard-header flex-between">
        <div>
          <h2>{course.title} <span className="course-code">{course.code}</span></h2>
          <p>Prof. {instructorName}</p>
        </div>
        {/* Admin buttons successfully removed from student view */}
      </div>

      {/* Course Progress Summary */}
      <section className="profile-section">
        <div className="course-progress">
          <div className="progress-info">
            <span>Current Overall Average</span>
            {/* Hardcoded at 0% until we build the grading system */}
            <strong>0%</strong>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `0%` }}></div>
          </div>
        </div>
      </section>

      {/* Assessments Header */}
      <div className="section-header" style={{ marginTop: '2rem' }}>
        <h3>Course Assessments</h3>
      </div>

      {/* Assessments List */}
      <div className="assessment-list">
        {courseAssessments.length === 0 ? (
          <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #eaeaea' }}>
            <p style={{ color: '#666', fontStyle: 'italic' }}>No assessments have been posted for this course yet.</p>
          </div>
        ) : (
          courseAssessments.map((item) => (
            <CourseAssessmentItem 
              key={item.id}
              title={item.title}
              weight={item.weight}
              status="Pending" // Defaulted to Pending until grading is implemented
              earned={null}
              total={null}
            />
          ))
        )}
      </div>
    </div>
  );
}