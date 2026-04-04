// app/lib/definitions.js
import { z } from 'zod';

export const SignupSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: 'First name must be at least 2 characters long.' })
    .trim(),
  lastName: z
    .string()
    .min(2, { message: 'Last name must be at least 2 characters long.' })
    .trim(),
  email: z
    .string()
    .email({ message: 'Please enter a valid email.' })
    .trim(),
  password: z
    .string()
    .min(8, { message: 'Be at least 8 characters long' })
    .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Contain at least one number.' })
    .trim(),

    role: z.enum(["student", "admin"], {
    errorMap: () => ({ message: "Invalid role selected." }),
  }),
});

export const CreateCourseSchema = z.object({
  // Enforce strict exact matches for the term
  term: z.enum(["F", "W", "FW", "S", "S1", "S2"], { 
    errorMap: () => ({ message: "Invalid term selected. Must be F, W, FW, S, S1, or S2." }) 
  }),
  
  courseCode: z.string()
    .trim()
    .toUpperCase() 
    .regex(/^[A-Z]{3,4}[\s-]?\d{3,4}$/, { 
      message: "Course code must be 3-4 letters followed by 3-4 numbers (e.g., SOEN 287)." 
    }),

  courseName: z.string()
    .min(3, { message: "Course name must be at least 3 characters long." })
    .trim(),
    
  courseDescription: z.string()
    .min(10, { message: "Please provide a brief description (at least 10 characters)." })
    .trim(),
});

export const CreateAssessmentSchema = z.object({
  courseId: z.string().min(1, "Course ID is missing."),
  title: z.string().min(3, { message: "Title must be at least 3 characters." }).trim(),
  
  // z.coerce.number() takes the string from the HTML input and turns it into an integer
  weight: z.coerce.number()
    .min(1, { message: "Weight must be at least 1%." })
    .max(100, { message: "Weight cannot exceed 100%." }),
    
  type: z.enum(["Quiz", "Assignment", "Lab", "Project", "Exam"], {
    errorMap: () => ({ message: "Invalid assessment type selected." })
  }),
  
  date: z.string().min(1, { message: "Please select a date." }),
});