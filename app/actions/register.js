// app/actions/register.js
"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function registerUser(formData) {
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const email = formData.get("email");
  const password = formData.get("password");
  const role = formData.get("role") || "student"; // Default to student

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