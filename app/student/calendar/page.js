// app/student/calendar/page.js
import { auth } from "@/auth";
import { db } from "@/db";
// 1. Add 'grades' to the import
import { courses, enrollments, assessments, grades } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import CalendarWidget from "./_components/CalendarWidget";

export default async function CalendarPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "student") {
    redirect("/login");
  }

  // 2. Add the leftJoin for grades
  const rawAssessments = await db
    .select({
      id: assessments.id,
      title: assessments.title,
      date: assessments.date,
      courseId: courses.id,
      courseCode: courses.code,
      earned: grades.earned, // Pulling the grade to check completion status!
    })
    .from(assessments)
    .innerJoin(courses, eq(assessments.courseId, courses.id))
    .innerJoin(enrollments, eq(courses.id, enrollments.courseId))
    .leftJoin(
      grades,
      and(
        eq(grades.assessmentId, assessments.id),
        eq(grades.studentId, session.user.id) // Only look for THIS student's grade
      )
    )
    .where(
      and(
        eq(enrollments.studentId, session.user.id),
        eq(courses.isActive, true)
      )
    );

  return (
    <>
      <div className="dashboard-header">
        <h2>My Calendar</h2>
        <p>Track all your upcoming deadlines across your enrolled courses.</p>
      </div>

      <CalendarWidget assessments={rawAssessments} />
    </>
  );
}