import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    // 1. Find user by token
    const result = await db
      .select()
      .from(users)
      .where(eq(users.resetToken, token))
      .limit(1);

    const user = result[0];

    if (!user) {
      return NextResponse.json({ message: "Invalid or expired token" });
    }

    // 2. Check expiry
    if (!user.resetTokenExpiry) {
  return NextResponse.json({ message: "Invalid token" });
}

if (new Date(user.resetTokenExpiry) < new Date()) {
  return NextResponse.json({ message: "Token expired" });
}

    // 3. Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Update password + clear token
    await db
      .update(users)
      .set({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({
      message: "Password updated successfully",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}