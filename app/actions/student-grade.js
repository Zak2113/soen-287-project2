// app/actions/student-grade.js
"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { enrollments, grades } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function submitAssessmentScore(formData) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "student") {
    return { error: "Unauthorized. Only students can submit assessments." };
  }

  const courseId = formData.get("courseId");
  const assessmentId = formData.get("assessmentId");
  
  // 1. Grab the raw input string before converting it to a number
  const earnedRaw = formData.get("earned");
  
  // 2. Determine if the student is clearing their grade
  const isClearingGrade = earnedRaw === ""; 
  const earnedScore = isClearingGrade ? null : Number(earnedRaw);

  try {
    const [isEnrolled] = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.studentId, session.user.id),
          eq(enrollments.courseId, courseId)
        )
      );

    if (!isEnrolled) {
      return { error: "Forbidden. You are not enrolled in this course." };
    }

    const [existingGrade] = await db
      .select()
      .from(grades)
      .where(
        and(
          eq(grades.studentId, session.user.id),
          eq(grades.assessmentId, assessmentId)
        )
      );

    if (existingGrade) {
      if (isClearingGrade) {
        // If they submitted an empty box, delete the record to revert to "Incomplete"
        await db.delete(grades).where(eq(grades.id, existingGrade.id));
      } else {
        // Otherwise, just update the score normally
        await db.update(grades)
          .set({ earned: earnedScore, isGraded: true })
          .where(eq(grades.id, existingGrade.id));
      }
    } else {
      // If no grade exists, only insert if they actually typed a number
      if (!isClearingGrade) {
        await db.insert(grades).values({
          id: crypto.randomUUID(),
          studentId: session.user.id,
          assessmentId: assessmentId,
          earned: earnedScore,
          total: 100, 
          isGraded: true, 
        });
      }
    }

    revalidatePath(`/student/courses/${courseId}`);
    return { success: true };

  } catch (err) {
    console.error("Submission Error:", err);
    return { error: "Failed to submit assessment." };
  }
}