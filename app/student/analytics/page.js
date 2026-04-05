// app/student/analytics/page.js
import StatCard from '../_components/StatCard';
import CourseCompletionItem from '../_components/CourseCompletionItem';
import { auth } from "@/auth";
import { db } from "@/db";
import { courses, enrollments, assessments, grades } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";

// Helper function to translate a percentage into a GPA and Letter Grade
function getGradeStats(percentage) {
  if (percentage === 0) return { gpa: "0.0", letter: "N/A" };
  if (percentage >= 90) return { gpa: "4.3", letter: "A+" };
  if (percentage >= 85) return { gpa: "4.0", letter: "A" };
  if (percentage >= 80) return { gpa: "3.7", letter: "A-" };
  if (percentage >= 77) return { gpa: "3.3", letter: "B+" };
  if (percentage >= 73) return { gpa: "3.0", letter: "B" };
  if (percentage >= 70) return { gpa: "2.7", letter: "B-" };
  if (percentage >= 67) return { gpa: "2.3", letter: "C+" };
  if (percentage >= 63) return { gpa: "2.0", letter: "C" };
  if (percentage >= 60) return { gpa: "1.7", letter: "C-" };
  if (percentage >= 57) return { gpa: "1.3", letter: "D+" };
  if (percentage >= 53) return { gpa: "1.0", letter: "D" };
  if (percentage >= 50) return { gpa: "0.7", letter: "D-" };
  return { gpa: "0.0", letter: "F" };
}

export default async function AnalyticsDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "student") {
    redirect("/login");
  }

  // 1. DATA FETCH: Mega-join for ALL enrolled courses (active or disabled)
  const rawData = await db
    .select({
      course: courses,
      assessment: assessments,
      grade: grades,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .leftJoin(assessments, eq(assessments.courseId, courses.id))
    .leftJoin(
      grades,
      and(
        eq(grades.assessmentId, assessments.id),
        eq(grades.studentId, session.user.id)
      )
    )
    .where(eq(enrollments.studentId, session.user.id));

  // 2. STATE TRACKERS
  const courseStats = new Map();
  let completedAssessmentsCount = 0;
  let upcomingAssessmentsCount = 0;
  let overdueAssessmentsCount = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 3. PROCESS ROWS
  rawData.forEach((row) => {
    const { course, assessment, grade } = row;

    // Initialize course tracker if we haven't seen it yet
    if (!courseStats.has(course.id)) {
      courseStats.set(course.id, {
        id: course.id,
        title: `${course.code} ${course.title}`,
        attemptedWeight: 0,
        earnedWeightedScore: 0,
      });
    }

    const stats = courseStats.get(course.id);

    // Process assessments and grades
    if (assessment) {
      const isCompleted = grade?.earned !== null && grade?.earned !== undefined;

      if (isCompleted) {
        completedAssessmentsCount++;
        // Calculate the weighted score for this specific assignment
        const percentage = grade.earned / grade.total;
        stats.earnedWeightedScore += percentage * assessment.weight;
        stats.attemptedWeight += assessment.weight;
      } else {
        // Categorize uncompleted assessments by date
        const dueDate = new Date(assessment.date);
        if (dueDate < today) {
          overdueAssessmentsCount++;
        } else {
          upcomingAssessmentsCount++;
        }
      }
    }
  });

  // 4. CALCULATE AGGREGATES
  const completionRates = [];
  let sumOfCoursePercentages = 0;
  let coursesWithGradesCount = 0;

  courseStats.forEach((stats) => {
    // A course's progress is how much of its weight has been attempted
    // Capping at 100 just in case weights were entered incorrectly by a prof
    const progress = Math.min(stats.attemptedWeight, 100);
    completionRates.push({
      id: stats.id,
      title: stats.title,
      progress: progress,
    });

    // Only include courses in the cumulative GPA if they actually have a grade submitted
    if (stats.attemptedWeight > 0) {
      const courseAvg = (stats.earnedWeightedScore / stats.attemptedWeight) * 100;
      sumOfCoursePercentages += courseAvg;
      coursesWithGradesCount++;
    }
  });

  // Calculate final cumulative projected metrics
  const overallPercentage = coursesWithGradesCount > 0 
    ? (sumOfCoursePercentages / coursesWithGradesCount) 
    : 0;
    
  const { gpa, letter } = getGradeStats(overallPercentage);

  // 5. BUILD UI ARRAYS
  const gradeMetrics = [
    { id: 1, title: "Current GPA", subtitle: "Projected From Current Grades", value: gpa },
    { id: 2, title: "Current Grade As Percentage", subtitle: "Projected From Current Grades", value: `${overallPercentage.toFixed(1)}%` },
    { id: 3, title: "Current Grade As Letter", subtitle: "Projected From Current Grades", value: letter }
  ];

  const assessmentMetrics = [
    { id: 201, title: "Upcoming Assessments", subtitle: "Assessments You Need To Complete", value: upcomingAssessmentsCount.toString() },
    { id: 202, title: "Assessments Completed", subtitle: "Total Assessments you have completed", value: completedAssessmentsCount.toString() },
    { id: 203, title: "Overdue Assessments", subtitle: "Assessments You Have Missed", value: overdueAssessmentsCount.toString() }
  ];

  return (
    <>
      <div className="dashboard-header">
        <h2>Analytics Dashboard</h2>
      </div>

      {/* 1. Grade Overview Section */}
      <section className="profile-section">
        <div className="section-header">
          <h3>Grade Overview</h3>
        </div>
        <div className="course-cards">
          {gradeMetrics.map((metric) => (
            <StatCard 
              key={metric.id}
              title={metric.title}
              subtitle={metric.subtitle}
              value={metric.value}
            />
          ))}
        </div>
      </section>

      {/* 2. Course Completion Rates Section */}
      <section className="profile-section">
        <div className="section-header">
          <h3>Course Completion Rates</h3>
        </div>
        <div className="assessment-list">
          {completionRates.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic', padding: '10px' }}>No course data available.</p>
          ) : (
            completionRates.map((course) => (
              <CourseCompletionItem 
                key={course.id}
                title={course.title}
                progress={course.progress}
              />
            ))
          )}
        </div>
      </section>

      {/* 3. Assessments Overview Section */}
      <section className="profile-section">
        <div className="section-header">
          <h3>Assessments Overview</h3>
        </div>
        <div className="course-cards">
          {assessmentMetrics.map((metric) => (
            <StatCard 
              key={metric.id}
              title={metric.title}
              subtitle={metric.subtitle}
              value={metric.value}
            />
          ))}
        </div>
      </section>
    </>
  );
}