import { auth } from "@/auth";
import { db } from "@/db";
// 1. Added enrollments to the schema imports
import { courses, assessments, enrollments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import CreateAssessmentForm from "./_components/CreateAssessmentForm";
import AssessmentRow from "./_components/AssessmentRow";

// Helper function to split "YYYY-MM-DD" into Month and Day for the UI
function parseDateForUI(dateString) {
  if (!dateString) return { month: "TBD", day: "--" };
  const [year, month, day] = dateString.split('-');
  const date = new Date(year, month - 1, day);
  return {
    month: date.toLocaleString('en-US', { month: 'short' }), // e.g., "Oct"
    day: date.getDate().toString().padStart(2, '0')          // e.g., "14"
  };
}

// Dictionary to translate DB codes to readable full text
const termMap = {
  "F": "Fall", "W": "Winter", "FW": "Fall/Winter",
  "S": "Summer Full", "S1": "Summer 1", "S2": "Summer 2"
};

export default async function CourseManagementPage({ params }) {
  // Security Check
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }
  const resolvedParams = await params;
  const courseId = resolvedParams.id;

  // Fetch the specific course
  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId));

  // Handle 404
  if (!course) {
    return (
      <div className="dashboard-header">
        <h2>Course Not Found</h2>
        <p>The course you are looking for does not exist or has been deleted.</p>
        <Link href="/admin" className="btn btn-outline" style={{ marginTop: '1rem' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // IDOR Protection
  if (course.instructorId !== session.user.id) {
    return (
      <div className="dashboard-header">
        <h2>Access Denied</h2>
        <p>You do not have permission to manage a course created by another instructor.</p>
        <Link href="/admin" className="btn btn-outline" style={{ marginTop: '1rem' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Fetch all enrollments tied to this course to get the live student count
  const courseEnrollments = await db
    .select()
    .from(enrollments)
    .where(eq(enrollments.courseId, courseId));
    
  const studentCount = courseEnrollments.length;

  // Fetch all assessments tied to this specific course
  const courseAssessments = await db
    .select()
    .from(assessments)
    .where(eq(assessments.courseId, courseId));

  return (
    <>
      <div className="form-group" style={{ marginBottom: '20px' }}>
        <Link href="/admin" className="login-link">← Back to Dashboard</Link>
      </div>

      <div className="dashboard-header flex-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Manage: {course.title} <span className="course-code">{course.code}</span></h2>
          {/* Dynamically displaying the full term name and the real student count */}
          <p>{termMap[course.term] || course.term} - {studentCount} {studentCount === 1 ? 'Student' : 'Students'} Enrolled</p>
        </div>
        <button className="btn btn-outline">Disable Course</button>
      </div>

      {/* Inject the interactive Client Component Form here */}
      <CreateAssessmentForm courseId={courseId} />

      <div className="section-header" style={{ marginTop: '3rem' }}>
        <h3>Current Syllabus Items</h3>
      </div>

      <div className="assessment-list">
        {courseAssessments.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '20px 0' }}>No assessments have been added to this course yet.</p>
        ) : (
          courseAssessments.map((assessment) => {
            // Parse the date for each assessment
            const { month, day } = parseDateForUI(assessment.date);

            // Replace the static HTML with the interactive transforming row component
            return (
              <AssessmentRow 
                key={assessment.id} 
                assessment={assessment} 
                courseId={courseId} 
                month={month} 
                day={day} 
              />
            );
          })
        )}
      </div>
    </>
  );
}