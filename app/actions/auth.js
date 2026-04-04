// app/actions/auth.js
"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { signOut } from "@/auth";

export async function loginUser(formData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false, // We'll handle redirect on the client for better UX
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    throw error;
  }
}


export async function logoutUser() {
  try {
    // This clears the cookie and tells the browser to head home
    await signOut({ redirectTo: "/login" }); 
  } catch (error) {
    // Standard Next.js redirect throws an error to stop execution, 
    // so we re-throw it to let the redirect happen.
    throw error;
  }
}