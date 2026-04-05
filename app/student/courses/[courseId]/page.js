// app/student/courses/[courseId]/page.js
import Link from 'next/link';
import CourseAssessmentItem from '../../_components/CourseAssessmentItem';
import { auth } from "@/auth";
import { db } from "@/db";
// Added grades to the schema import
import { courses, users, enrollments, assessments, grades } from "@/db/schema";
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

  // 3. Fetch assessments AND the student's specific grades
  const assessmentsWithGrades = await db
    .select({
      assessment: assessments,
      grade: grades,
    })
    .from(assessments)
    // LEFT JOIN because an assessment exists even if a grade doesn't yet!
    .leftJoin(
      grades,
      and(
        eq(grades.assessmentId, assessments.id),
        eq(grades.studentId, session.user.id) // Only pull grades for THIS student
      )
    )
    .where(eq(assessments.courseId, courseId));

  // 4. Calculate the live course average
  let totalWeightedScore = 0;
  let totalAttemptedWeight = 0;

  assessmentsWithGrades.forEach((row) => {
    const { assessment, grade } = row;
    if (grade?.earned !== undefined && grade?.earned !== null) {
      const percentage = grade.earned / grade.total;
      totalWeightedScore += percentage * assessment.weight;
      totalAttemptedWeight += assessment.weight;
    }
  });

  // Prevent division by zero if they haven't submitted anything yet
  const currentAverage = totalAttemptedWeight > 0 
    ? ((totalWeightedScore / totalAttemptedWeight) * 100).toFixed(1) 
    : 0;

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
      </div>

      {/* Course Progress Summary */}
      <section className="profile-section">
        <div className="course-progress">
          <div className="progress-info">
            <span>Current Overall Average</span>
            <strong>{currentAverage}%</strong>
          </div>
          <div className="progress-bar">
            {/* The width now dynamically grows as their average changes! */}
            <div className="progress-fill" style={{ width: `${currentAverage}%` }}></div>
          </div>
          {totalAttemptedWeight > 0 && (
            <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#666' }}>
              Based on {totalAttemptedWeight}% of the total course weight completed.
            </div>
          )}
        </div>
      </section>

      {/* Assessments Header */}
      <div className="section-header" style={{ marginTop: '2rem' }}>
        <h3>Course Assessments</h3>
      </div>

      {/* Assessments List */}
      <div className="assessment-list">
        {assessmentsWithGrades.length === 0 ? (
          <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #eaeaea' }}>
            <p style={{ color: '#666', fontStyle: 'italic' }}>No assessments have been posted for this course yet.</p>
          </div>
        ) : (
          assessmentsWithGrades.map((row) => {
            const { assessment, grade } = row;
            
            return (
              <CourseAssessmentItem 
                key={assessment.id}
                assessmentId={assessment.id}
                courseId={courseId}
                title={assessment.title}
                weight={assessment.weight}
                status={grade?.earned !== undefined && grade?.earned !== null ? "Completed" : "Pending"}
                earned={grade?.earned ?? null} // Pass the real grade, or null if unsubmitted
                total={grade?.total ?? 100}
              />
            );
          })
        )}
      </div>
    </div>
  );
}