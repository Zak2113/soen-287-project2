// app/admin/analytics/page.js
import { auth } from "@/auth";
import { db } from "@/db";
import { courses, enrollments, assessments, grades } from "@/db/schema";
import { eq, inArray, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  // 1. Fetch ONLY the Admin's ACTIVE Courses
  const myCourses = await db
    .select()
    .from(courses)
    .where(
      and(
        eq(courses.instructorId, session.user.id),
        eq(courses.isActive, true) 
      )
    );

  const courseIds = myCourses.map(c => c.id);

  if (courseIds.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: 'var(--white)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <h2 style={{ color: 'var(--text-main)', marginBottom: '10px' }}>Admin Analytics</h2>
        <p style={{ color: 'var(--text-muted)' }}>You do not have any active courses to analyze right now.</p>
        <Link href="/admin/add-course" className="btn btn-primary" style={{ marginTop: '15px' }}>
          Create Course
        </Link>
      </div>
    );
  }

  // 2. Fetch all Enrollments, Assessments, and Grades for these active courses
  const myEnrollments = await db
    .select()
    .from(enrollments)
    .where(inArray(enrollments.courseId, courseIds));

  const myAssessments = await db
    .select()
    .from(assessments)
    .where(inArray(assessments.courseId, courseIds));

  const assessmentIds = myAssessments.map(a => a.id);

  const myGrades = assessmentIds.length > 0 
    ? await db
        .select()
        .from(grades)
        .where(inArray(grades.assessmentId, assessmentIds))
    : [];

  // --- DATA PROCESSING: NESTED GROUPING ---

  const uniqueStudents = new Set(myEnrollments.map(e => e.studentId)).size;
  const activeCoursesCount = myCourses.length; 

  const enrollmentCounts = {};
  myEnrollments.forEach(e => {
    enrollmentCounts[e.courseId] = (enrollmentCounts[e.courseId] || 0) + 1;
  });

  const gradeCounts = {};
  myGrades.forEach(g => {
    if (g.earned !== null && g.earned !== undefined) {
      gradeCounts[g.assessmentId] = (gradeCounts[g.assessmentId] || 0) + 1;
    }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 3. Build the grouped Course Data Structure
  const courseInsights = myCourses.map(course => {
    const studentCount = enrollmentCounts[course.id] || 0;

    const courseAssessments = myAssessments
      .filter(a => a.courseId === course.id)
      .map(assessment => {
        const expected = studentCount;
        const submitted = gradeCounts[assessment.id] || 0;
        const completionRate = expected > 0 ? Math.round((submitted / expected) * 100) : 0;
        
        const dueDate = new Date(assessment.date);
        dueDate.setDate(dueDate.getDate() + 1);
        dueDate.setHours(0,0,0,0);
        
        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        const isAtRisk = daysUntilDue >= 0 && daysUntilDue <= 3 && completionRate < 40;

        return { ...assessment, expected, submitted, completionRate, daysUntilDue, isAtRisk };
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      ...course,
      studentCount,
      assessments: courseAssessments
    };
  });

  return (
    <>
      <div className="dashboard-header">
        <h2 style={{ color: 'var(--primary-blue)' }}>Platform Analytics</h2>
        <p style={{ color: 'var(--text-muted)' }}>Anonymized student progress and platform usage metrics.</p>
      </div>

      {/* 1. Global Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--white)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h4 style={{ color: 'var(--text-main)', margin: '0 0 5px 0' }}>Total Unique Students</h4>
          <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-blue)' }}>{uniqueStudents}</span>
        </div>
        <div style={{ background: 'var(--white)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h4 style={{ color: 'var(--text-main)', margin: '0 0 5px 0' }}>Active Courses</h4>
          <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-blue)' }}>{activeCoursesCount}</span>
        </div>
        <div style={{ background: 'var(--white)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h4 style={{ color: 'var(--text-main)', margin: '0 0 5px 0' }}>Total Assessments</h4>
          <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-blue)' }}>{myAssessments.length}</span>
        </div>
      </div>

      {/* 2. Grouped Course Analytics */}
      <section className="profile-section">
        <div className="section-header" style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>
          <h3 style={{ color: 'var(--text-main)' }}>Assessment Completion by Course</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Monitor submission rates to determine if deadline extensions are necessary.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {courseInsights.map(course => (
            
            <div key={course.id} style={{ background: 'var(--white)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
              
              {/* Course Header */}
              <div style={{ background: 'var(--bg-light)', padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ display: 'inline-block', background: 'var(--dev-bg)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--dev-text)', marginBottom: '8px', border: '1px solid var(--dev-border)' }}>
                    {course.code}
                  </span>
                  {/* 🚨 THE FIX: Made the Course Title a direct link to the course page */}
                  <Link href={`/admin/course/${course.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <h3 style={{ margin: 0, color: 'var(--primary-blue)' }}>
                      {course.title} <span style={{ fontSize: '1rem' }}>&rarr;</span>
                    </h3>
                  </Link>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-blue)', lineHeight: 1 }}>
                    {course.studentCount}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Students Enrolled</span>
                </div>
              </div>

              {/* Assessments List inside the Course */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {course.assessments.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>No assessments created for this course yet.</p>
                ) : (
                  course.assessments.map((assessment, index) => (
                    
                    <div key={assessment.id} style={{ 
                      paddingBottom: index !== course.assessments.length - 1 ? '20px' : '0', 
                      borderBottom: index !== course.assessments.length - 1 ? '1px solid var(--border-color)' : 'none',
                      background: assessment.isAtRisk ? 'var(--dev-bg)' : 'transparent',
                      padding: assessment.isAtRisk ? '15px' : '0',
                      borderRadius: assessment.isAtRisk ? '6px' : '0',
                      border: assessment.isAtRisk ? '1px solid var(--dev-border)' : 'none',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                          <h5 style={{ margin: '0 0 5px 0', color: assessment.isAtRisk ? 'var(--dev-text)' : 'var(--text-main)', fontSize: '1.1rem' }}>
                            {assessment.title}
                          </h5>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {assessment.daysUntilDue < 0 
                              ? `Due ${Math.abs(assessment.daysUntilDue)} days ago` 
                              : assessment.daysUntilDue === 0 
                                ? "Due Today" 
                                : `Due in ${assessment.daysUntilDue} days`}
                          </p>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 'bold', color: assessment.isAtRisk ? 'var(--dev-text)' : 'var(--text-main)', lineHeight: 1 }}>
                            {assessment.completionRate}%
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {assessment.submitted} / {assessment.expected} Submitted
                          </span>
                        </div>
                      </div>

                      <div style={{ width: '100%', height: '8px', background: 'var(--bg-light)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', 
                          width: `${assessment.completionRate}%`, 
                          background: assessment.isAtRisk ? 'var(--accent-orange)' : 'var(--primary-blue)',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>

                      {assessment.isAtRisk && (
                        <div style={{ marginTop: '10px', textAlign: 'right' }}>
                          <Link href={`/admin/course/${course.id}`} style={{ fontSize: '0.85rem', color: 'var(--accent-orange)', fontWeight: 'bold', textDecoration: 'none' }}>
                            Manage Deadline &rarr;
                          </Link>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}