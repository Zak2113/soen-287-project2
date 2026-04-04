"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function updateProfile(formData) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const email = formData.get("email");

  try {
    await db.update(users)
      .set({ firstName, lastName, email })
      .where(eq(users.id, session.user.id));
    return { success: true };
  } catch (e) {
    return { error: "Failed to update database" };
  }
}

export async function updatePassword(formData) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");

  // 1. Fetch user from DB to get the current hash
  const [user] = await db.select().from(users).where(eq(users.id, session.user.id));

  // 2. Verify current password
  const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
  if (!passwordsMatch) return { error: "Current password incorrect." };

  // 3. Hash new password and update
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db.update(users).set({ password: hashedPassword }).where(eq(users.id, session.user.id));

  return { success: true };
}