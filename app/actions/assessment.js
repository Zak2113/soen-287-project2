// app/actions/assessment.js
"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { courses, assessments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { CreateAssessmentSchema } from "@/app/lib/definitions";

export async function createAssessment(formData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized." };
  }

  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = CreateAssessmentSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed.",
    };
  }

  const { courseId, title, weight, type, date } = validatedFields.data;

  try {
    // SECURITY CHECK: Does this admin actually own this course?
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId));

    if (!course) return { error: "Course not found." };
    if (course.instructorId !== session.user.id) {
      return { error: "Forbidden. You do not own this course." };
    }

    // Insert the assessment
    await db.insert(assessments).values({
      id: crypto.randomUUID(),
      courseId,
      title,
      type,
      weight,
      date,
    });

    // Refresh the specific course page
    revalidatePath(`/admin/course/${courseId}`);
    return { success: true };

  } catch (err) {
    console.error("Assessment Creation Error:", err);
    return { error: "Failed to add assessment to database." };
  }
}

export async function deleteAssessment(assessmentId, courseId) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized." };
  }

  try {
    // SECURITY CHECK: Ensure this admin actually owns the course
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId));

    if (!course || course.instructorId !== session.user.id) {
      return { error: "Forbidden. You do not own this course." };
    }

    // Delete the assessment
    await db.delete(assessments).where(eq(assessments.id, assessmentId));

    // Refresh the specific course page
    revalidatePath(`/admin/course/${courseId}`);
    return { success: true };

  } catch (err) {
    console.error("Assessment Deletion Error:", err);
    return { error: "Failed to delete assessment." };
  }
}

export async function updateAssessment(formData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized." };
  }

  // Extract exactly what we need
  const assessmentId = formData.get("assessmentId");
  const courseId = formData.get("courseId");
  const title = formData.get("title");
  const weight = parseInt(formData.get("weight"), 10);
  const type = formData.get("type");
  const date = formData.get("date");

  try {
    // SECURITY CHECK: Ensure this admin owns the course
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId));

    if (!course || course.instructorId !== session.user.id) {
      return { error: "Forbidden. You do not own this course." };
    }

    // Update the database
    await db.update(assessments)
      .set({ title, weight, type, date })
      .where(eq(assessments.id, assessmentId));

    // Refresh the page to show the new data
    revalidatePath(`/admin/course/${courseId}`);
    return { success: true };

  } catch (err) {
    console.error("Assessment Update Error:", err);
    return { error: "Failed to update assessment." };
  }
}