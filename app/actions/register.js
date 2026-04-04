// app/actions/register.js
"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";
import { eq, and, like } from "drizzle-orm";
import { SignupSchema } from "@/app/lib/definitions";

export async function registerUser(formData) {
    const rawFormData = Object.fromEntries(formData.entries());

    // 1. Zod Validation (Includes Name, Email, Password, and Role whitelist)
    const validatedFields = SignupSchema.safeParse(rawFormData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed. Please check your inputs.",
        };
    }

    const { firstName, lastName, email, password, role } = validatedFields.data;

    try {
        // 2. Check for Existing User
        const existing = await db.select().from(users).where(eq(users.email, email));
        if (existing.length > 0) {
            return { error: "An account with this email already exists." };
        }

        // 3. Securely Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        const prefix = role === "admin" ? "A" : "S";

        // 1. Get the current year (e.g., "26")
        const year = new Date().getFullYear().toString().slice(-2);

        // 2. Get Initials (e.g., "ZA")
        const initials = (firstName[0] + lastName[0]).toUpperCase();

        // 3. Count how many users already have these specific initials this year
        const existingMatches = await db
            .select()
            .from(users)
            .where(
                and(
                    like(users.studentId, `${prefix}${year}${initials}%`),
                    // Optional: filter by year specifically if your DB grows large
                )
            );

        // 4. Increment by 1 (Starting at 1)
        const nextNumber = existingMatches.length + 1;

        // 5. Format with 4 digits total, padded with zeros (e.g., 0001, 0012, 0123)
        const paddedNumber = nextNumber.toString().padStart(4, "0");

        // 6. Final ID: S26ZA0001
        const generatedId = `${prefix}${year}${initials}${paddedNumber}`;

        // 4. Database Insertion
        await db.insert(users).values({
            id: crypto.randomUUID(),
            studentId: generatedId,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: role, // Validated as "student" or "admin" by Zod
        });

        // 5. Return Success
        // We return this instead of redirecting here so the UI can handle the transition
        return { success: true };

    } catch (err) {
        console.error("Database Error:", err);
        return { error: "Database insertion failed. Please try again." };
    }
}