// app/actions/enrollment.js
"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { enrollments, courses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function enrollInCourse(courseId) {
  const session = await auth();
  
  // Security Check: Only students can enroll
  if (!session?.user || session.user.role !== "student") {
    return { error: "Unauthorized. Only students can enroll." };
  }

  try {
    // 1. Verify the course is still active
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId));

    if (!course || !course.isActive) {
      return { error: "This course is not currently available for enrollment." };
    }

    // 2. Prevent duplicate enrollments
    const [existingEnrollment] = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.studentId, session.user.id),
          eq(enrollments.courseId, courseId)
        )
      );

    if (existingEnrollment) {
      return { error: "You are already enrolled in this course." };
    }

    // 3. Save the enrollment
    await db.insert(enrollments).values({
      id: crypto.randomUUID(),
      studentId: session.user.id,
      courseId: courseId,
      enrolledAt: new Date().toISOString(),
    });

    // Refresh the page so the button updates
    revalidatePath("/student/add-course");
    return { success: true };

  } catch (err) {
    console.error("Enrollment Error:", err);
    return { error: "Failed to enroll in the course." };
  }
}