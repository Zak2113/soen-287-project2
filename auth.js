// auth.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/db"; // Assuming your db folder is set up with aliases, or use "./db"
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      async authorize(credentials) {
        
        // 1. Find the user in your SQLite database
        const result = await db.select().from(users).where(eq(users.email, credentials.email));
        const user = result[0];

        // If no user is found, reject the login
        if (!user) return null;

        // 2. Securely compare the typed password with the hashed password in the DB
        const passwordsMatch = await bcrypt.compare(credentials.password, user.password);

        // 3. If it matches, log them in and save their info to the encrypted cookie
        if (passwordsMatch) {
          return { 
            id: user.id, 
            name: `${user.firstName} ${user.lastName}`, 
            email: user.email, 
            role: user.role // Extremely important for protecting Admin pages!
          };
        }

        // If password fails, reject
        return null;
      }
    })
  ],
  callbacks: {
    // These callbacks ensure the user's role is passed into the session so you can check it later
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.role = token.role;
      return session;
    }
  },
  // Tell Auth.js where our custom login page lives
  pages: {
    signIn: '/login',
  }
});