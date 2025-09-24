"use server";

import { signInFormSchema, signUpFormSchema } from "../validators";
import { signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcryptjs";
import prisma from "@/lib/prisma"; // ✅ use your Prisma client

// -------------------- SIGN IN --------------------
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const callbackUrl = (formData.get("callbackUrl") as string) || "/";

    const res = await signIn("credentials", {
      ...user,
      redirect: false,
      redirectTo: callbackUrl,
    });

    if (res?.error) {
      return { success: false, message: "Invalid email or password" };
    }

    return { success: true, message: "Signed in successfully", callbackUrl };
  } catch (error) {
    if (isRedirectError(error)) throw error;

    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}

// -------------------- SIGN OUT --------------------
export async function signOutUser() {
  await signOut();
}

// -------------------- SIGN UP --------------------
export async function signUpUser(prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    // ✅ Store hashed password
    const hashedPassword = hashSync(user.password, 10);
    const plainPassword = user.password;

    // ✅ Create user in DB
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
      },
    });

    // ✅ Auto sign in new user
    await signIn("credentials", {
      email: user.email,
      password: plainPassword,
      redirect: true,
      redirectTo: "/",
    });

    return { success: true, message: "Account created successfully" };
  } catch (error: any) {
    if (isRedirectError(error)) throw error;

    if (error.code === "P2002") {
      // Prisma unique constraint violation
      return { success: false, message: "Email is already in use" };
    }

    return { success: false, message: "Something went wrong during sign up" };
  }
}
