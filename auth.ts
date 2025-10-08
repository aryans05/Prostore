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
          // ✅ Fetch user safely
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.password) {
            console.warn("User not found or missing password");
            return null;
          }

          // ✅ Validate password
          const isValid = await compare(credentials.password, user.password);
          if (!isValid) {
            console.warn("Invalid password");
            return null;
          }

          // ✅ Return minimal user info for session
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
     * Adds user.id and user.role to the JWT token
     * Also handles name updates for session.refresh()
     */
    async jwt({ token, user, trigger, session }) {
      // 🪙 Add basic user info when first signing in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
      }

      // 🔄 Handle session updates (e.g., name change)
      if (trigger === "update" && session?.user?.name) {
        token.name = session.user.name;
      }

      return token;
    },

    /**
     * ✅ Session Callback:
     * Makes token fields available in session.user
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login", // redirect to your login page
  },

  secret: process.env.NEXTAUTH_SECRET,
});
