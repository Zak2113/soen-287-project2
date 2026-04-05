// app/student/add-course/page.js
import { auth } from "@/auth";
import { db } from "@/db";
import { courses, users, enrollments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import EnrollButton from "./_components/EnrollButton";
import TermFilter from "./_components/TermFilter";

const termMap = {
  "F": "Fall", "W": "Winter", "FW": "Fall/Winter",
  "S": "Summer Full", "S1": "Summer 1", "S2": "Summer 2"
};

export default async function StudentAddCoursePage({ searchParams }) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "student") {
    redirect("/login");
  }

  // Await the params for Next.js 15 compatibility
  const resolvedParams = await searchParams;
  const selectedTerm = resolvedParams.term;

  // 1. Build dynamic conditions for Drizzle
  const queryConditions = [eq(courses.isActive, true)];
  
  // If the user selected a term, add it to our requirements
  if (selectedTerm) {
    queryConditions.push(eq(courses.term, selectedTerm));
  }

  // 2. Fetch courses based on our dynamic conditions
  const availableCoursesData = await db
    .select({
      course: courses,
      instructor: users,
    })
    .from(courses)
    .leftJoin(users, eq(courses.instructorId, users.id))
    .where(and(...queryConditions));

  // 3. Fetch current enrollments to hide classes they are already in
  const myEnrollments = await db
    .select({ courseId: enrollments.courseId })
    .from(enrollments)
    .where(eq(enrollments.studentId, session.user.id));
    
  const enrolledCourseIds = myEnrollments.map(e => e.courseId);

  // 4. Filter out courses the student is already enrolled in
  const coursesToDisplay = availableCoursesData.filter(
    (row) => !enrolledCourseIds.includes(row.course.id)
  );

  return (
    <>
      <div className="dashboard-header">
        <h2>Course Directory</h2>
        <p>Browse available classes and enroll for the upcoming term.</p>
      </div>

      {/* FIX: Wrapped the TermFilter in its own block above the form container */}
      <div style={{ display: 'block', width: '100%', marginBottom: '20px' }}>
        <TermFilter />
      </div>

      <div className="dashboard-form">
        {coursesToDisplay.length === 0 ? (
          <div className="add-course-card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#666' }}>No courses found for this term, or you are already enrolled in all of them!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {coursesToDisplay.map((row) => {
              const { course, instructor } = row;
              const instructorName = instructor ? `${instructor.firstName} ${instructor.lastName}` : "Unknown";

              return (
                <div key={course.id} className="add-course-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span className="course-code" style={{ fontWeight: 'bold', color: '#2c3e50', background: '#f0f2f5', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>
                        {course.code}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: '500' }}>
                        {termMap[course.term] || course.term}
                      </span>
                    </div>
                    
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '5px', color: '#333' }}>{course.title}</h3>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '15px' }}>
                      Prof. {instructorName}
                    </p>
                    <p style={{ color: '#555', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {course.description}
                    </p>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <EnrollButton courseId={course.id} />
                  </div>
                  
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}