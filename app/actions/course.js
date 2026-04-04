// app/actions/course.js
"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { CreateCourseSchema } from "@/app/lib/definitions";
import { eq } from "drizzle-orm";

export async function createCourse(formData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized. Please log in." };
  if (session.user.role !== "admin") return { error: "Forbidden. Only admins can create courses." };

  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = CreateCourseSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check your inputs.",
    };
  }

  const { courseCode, courseName, term, courseDescription } = validatedFields.data;

  // Generate the unique ID upfront so we can return it
  const newCourseId = crypto.randomUUID();

  try {
    await db.insert(courses).values({
      id: newCourseId, // Use the generated ID
      code: courseCode,
      title: courseName,
      term: term,
      description: courseDescription,
      instructorId: session.user.id, 
      isActive: true,
    });

    // Clear the cache for the admin dashboard
    revalidatePath("/admin");
    
    // Return the new ID back to the React component!
    return { success: true, courseId: newCourseId };

  } catch (err) {
    console.error("Course Creation Error:", err);
    return { error: "Failed to create course in the database." };
  }
}

export async function toggleCourseStatus(courseId, currentStatus) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized." };
  }

  try {
    // Flip the boolean to the opposite of what it currently is
    const newStatus = !currentStatus;

    await db.update(courses)
      .set({ isActive: newStatus })
      .where(eq(courses.id, courseId));

    // Refresh the dashboard so the course instantly moves to the other list
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("Status Update Error:", err);
    return { error: "Failed to update course status." };
  }
}