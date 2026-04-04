// db/schema.js
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// 1. USERS TABLE
// Handles both Students and Admins via the 'role' column.
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), 
  role: text("role").default("student").notNull(), // "student" or "admin"
  studentId: text("student_id"), // Admins can leave this blank
});

export const courses = sqliteTable("courses", {
  id: text("id").primaryKey(), // We will use crypto.randomUUID() again
  
  code: text("code").notNull(),          // e.g., "SOEN-287"
  title: text("title").notNull(),        // e.g., "Web Programming"
  term: text("term").notNull(),          // e.g., "Winter 2026" (NEW)
  description: text("description"),      // e.g., "Brief overview..." (NEW)
  
  // Links the course to the specific Admin/Instructor who created it
  instructorId: text("instructor_id")
    .notNull()
    .references(() => users.id),
    
  // Allows admins to hide/disable a course without deleting the data
  isActive: integer("is_active", { mode: 'boolean' })
    .default(true)
    .notNull(), 
});
// 3. ENROLLMENTS TABLE (The "Add Course" Logic)
// This is a "Join Table". It connects a Student to a Course.
export const enrollments = sqliteTable("enrollments", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull().references(() => users.id),
  courseId: text("course_id").notNull().references(() => courses.id),
});

// 4. ASSESSMENTS TABLE
// Created by Admins. Belongs to a specific course.
export const assessments = sqliteTable("assessments", {
  id: text("id").primaryKey(),
  
  // Link this assessment to a specific course. 
  // onDelete: 'cascade' means if the course is deleted, its assessments are deleted too!
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
    
  title: text("title").notNull(),          // e.g., "Midterm Exam"
  type: text("type").notNull(),            // e.g., "Exam", "Quiz"
  weight: integer("weight").notNull(),     // e.g., 20 (for 20%)
  date: text("date").notNull(),            // e.g., "2026-10-14"
});

// 5. GRADES TABLE
// Links a specific Student to a specific Assessment
export const grades = sqliteTable("grades", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull().references(() => users.id),
  assessmentId: text("assessment_id").notNull().references(() => assessments.id),
  earned: real("earned"), 
  total: real("total").default(100).notNull(),
  // Makes it easy to filter "Completed" vs "Incomplete" in your UI
  isGraded: integer("is_graded", { mode: 'boolean' }).default(false).notNull(), 
});