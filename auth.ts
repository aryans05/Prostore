// lib/auth.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";

/* ============================================================
   ✅ NextAuth Configuration
   ============================================================ */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // ✅ Validate input safely
        if (
          !credentials ||
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          console.error("Missing or invalid credentials");
          return null;
        }

        try {
          // ✅ Safely fetch user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.password) {
            console.warn("User not found or missing password hash");
            return null;
          }

          // ✅ Validate password with bcrypt
          const isValid = await compare(credentials.password, user.password);
          if (!isValid) {
            console.warn("Invalid password attempt");
            return null;
          }

          // ✅ Return minimal user object for session/token
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (err) {
          console.error("❌ Error during credentials authorization:", err);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    /**
     * ✅ JWT Callback:
     * Adds user.id and user.role to the JWT payload
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },

    /**
     * ✅ Session Callback:
     * Makes token fields accessible in session.user
     */
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login", // Optional: redirect to your login page
  },

  secret: process.env.NEXTAUTH_SECRET,
});
