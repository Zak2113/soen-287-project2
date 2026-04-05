// auth.js
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { 
    strategy: "jwt",
    maxAge: 4 * 60 * 60, // 4 hours
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 1. Find the user in your SQLite database
        const result = await db.select().from(users).where(eq(users.email, credentials.email));
        const user = result[0];

        // If no user is found, reject the login
        if (!user) return null;

        // 2. Securely compare the typed password with the hashed password in the DB
        const passwordsMatch = await bcrypt.compare(credentials.password, user.password);

        // 3. If it matches, log them in and pass the explicit fields to the JWT
        if (passwordsMatch) {
          return { 
            id: user.id, 
            firstName: user.firstName, 
            lastName: user.lastName,
            email: user.email, 
            studentId: user.studentId, // Added for the Settings page
            role: user.role // Extremely important for protecting Admin pages!
          };
        }

        // If password fails, reject
        return null;
      }
    })
  ],
  callbacks: {
    // 4. JWT Callback: Builds the encrypted token
    async jwt({ token, user, trigger, session }) {
      // Initial sign-in: attach user data to the token
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.studentId = user.studentId;
        token.role = user.role;
      }

      // Profile Update: Refresh the token with new data from the settings page
      if (trigger === "update" && session?.user) {
        token.firstName = session.user.firstName;
        token.lastName = session.user.lastName;
        token.email = session.user.email;
      }

      return token;
    },

    // 5. Session Callback: Exposes the token data to the frontend (useSession)
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.studentId = token.studentId;
        session.user.role = token.role;
      }
      return session;
    }
  },
  // Tell Auth.js where our custom login page lives
  pages: {
    signIn: '/login',
  }
});