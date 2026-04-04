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