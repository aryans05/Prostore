import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) throw new Error("Missing credentials");

        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        if (!email || !password) throw new Error("Missing email or password");

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) throw new Error("Invalid credentials");

        const isValid = await compare(password, user.password);
        if (!isValid) throw new Error("Invalid credentials");

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  pages: {
    signIn: "/sign-in",
    error: "/sign-in", // errors redirect to sign-in page
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role ?? token.role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});
