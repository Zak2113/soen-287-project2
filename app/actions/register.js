// app/actions/register.js
"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { SignupSchema } from "@/app/lib/definitions";

export async function registerUser(formData) {

    const rawFormData = Object.fromEntries(formData.entries());
    const validatedFields = SignupSchema.safeParse(rawFormData);
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Register User.",
        };
    }
    const { firstName, lastName, email, password, role } = validatedFields.data;
    

    // 1. Check if user exists
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
        return { error: "User already exists" };
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insert into Drizzle
    try {
        await db.insert(users).values({
            id: crypto.randomUUID(),
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: role,
        });
    } catch (err) {
        return { error: "Database insertion failed" };
    }

    // 4. Send them to login
    redirect("/login");
}