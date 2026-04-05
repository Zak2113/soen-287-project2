// app/student/grades/page.js
import CourseGradesCard from '../_components/CourseGradesCard';
import { auth } from "@/auth";
import { db } from "@/db";
import { courses, users, enrollments, assessments, grades } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";

// Dictionary to translate DB codes to readable text
const termMap = {
  "F": "Fall", "W": "Winter", "FW": "Fall/Winter",
  "S": "Summer Full", "S1": "Summer 1", "S2": "Summer 2"
};

export default async function GradesPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "student") {
    redirect("/login");
  }

  // 1. THE MEGA-JOIN: Fetch active courses, assessments, and the student's grades
  const rawData = await db
    .select({
      course: courses,
      instructor: users,
      assessment: assessments,
      grade: grades,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .leftJoin(users, eq(courses.instructorId, users.id))
    // Left join assessments because a course might not have any yet
    .leftJoin(assessments, eq(assessments.courseId, courses.id))
    // Left join grades, filtered to ONLY this student's submissions
    .leftJoin(
      grades,
      and(
        eq(grades.assessmentId, assessments.id),
        eq(grades.studentId, session.user.id)
      )
    )
    .where(
      and(
        eq(enrollments.studentId, session.user.id),
        eq(courses.isActive, true) // Only show active courses!
      )
    );

  // 2. DATA GROUPING: Transform the flat SQL rows into structured Course objects
  const coursesMap = new Map();

  rawData.forEach((row) => {
    const { course, instructor, assessment, grade } = row;

    // If we haven't seen this course yet, create its base structure
    if (!coursesMap.has(course.id)) {
      const instructorName = instructor ? `${instructor.firstName} ${instructor.lastName}` : "Unknown";
      
      coursesMap.set(course.id, {
        id: course.id,
        code: course.code,
        term: termMap[course.term] || course.term,
        title: course.title,
        instructor: `Prof. ${instructorName}`,
        completed: [],
        incomplete: [],
        // Temporary variables to calculate the overall average
        totalAttemptedWeight: 0,
        totalWeightedScore: 0,
      });
    }

    const courseData = coursesMap.get(course.id);

    // If an assessment exists for this course, sort it into the right bucket
    if (assessment) {
      const isCompleted = grade?.earned !== null && grade?.earned !== undefined;

      if (isCompleted) {
        // Do the math for the live average
        const percentage = grade.earned / grade.total;
        courseData.totalWeightedScore += percentage * assessment.weight;
        courseData.totalAttemptedWeight += assessment.weight;

        // Push to Completed bucket
        courseData.completed.push({
          id: assessment.id,
          title: assessment.title,
          weight: assessment.weight,
          earned: grade.earned,
          total: grade.total,
        });
      } else {
        // Push to Incomplete bucket
        courseData.incomplete.push({
          id: assessment.id,
          title: assessment.title,
          weight: assessment.weight,
        });
      }
    }
  });

  // 3. FINAL POLISH: Convert the Map to an Array and calculate the final progress %
  const myGradesData = Array.from(coursesMap.values()).map((course) => {
    const currentAverage = course.totalAttemptedWeight > 0
      ? ((course.totalWeightedScore / course.totalAttemptedWeight) * 100).toFixed(1)
      : 0;

    return {
      id: course.id,
      code: course.code,
      term: course.term,
      title: course.title,
      instructor: course.instructor,
      progress: currentAverage, // Injected the calculated average
      completed: course.completed,
      incomplete: course.incomplete,
    };
  });

  return (
    <>
      <div className="dashboard-header">
        <h2>My Grades</h2>
        <p>Review your completed assessments and current standing across all enrolled courses.</p>
      </div>

      <div className="grades-container">
        {myGradesData.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '8px', border: '1px solid #eaeaea' }}>
            <p style={{ color: '#666', fontStyle: 'italic' }}>You do not have any grades to display yet.</p>
          </div>
        ) : (
          myGradesData.map((course) => (
            <CourseGradesCard
              key={course.id}
              code={course.code}
              term={course.term}
              title={course.title}
              instructor={course.instructor}
              progress={course.progress}
              completed={course.completed}
              incomplete={course.incomplete}
            />
          ))
        )}
      </div>
    </>
  );
}