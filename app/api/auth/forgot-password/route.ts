import { transporter } from "@/app/lib/mailer";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // 1. Find user
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = result[0];

    // 2. Always respond the same
    if (!user) {
      return NextResponse.json({
        message: "If that email exists, a reset link was sent.",
      });
    }

    // 3. Generate token
    const token = crypto.randomBytes(32).toString("hex");

    // 4. Expiry (1 hour)
    const expiry = new Date(Date.now() + 1000 * 60 * 60).toISOString();

    // 5. Save token
    await db
      .update(users)
      .set({
        resetToken: token,
        resetTokenExpiry: expiry,
      })
      .where(eq(users.email, email));

    // 6. Build reset link (use env later in prod)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    // 7. Send email safely
    try {
      await transporter.sendMail({
        from: '"Noodle Support" <noodle-noreply@zakabdi.dev>',
        to: email,
        subject: "Password Reset Request",
        html: `
          <p>You requested a password reset.</p>
          <p>Click the link below:</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>This link will expire in 1 hour.</p>
        `,
      });
    } catch (mailError) {
      console.error("Email sending failed:", mailError);
    }

    return NextResponse.json({
      message: "If that email exists, a reset link was sent.",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}