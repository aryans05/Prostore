"use server";

import {
  shippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
  paymentMethodSchema,
} from "../validators";
import { auth, signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcryptjs";
import prisma from "@/db/prisma";
import { ShippingAddress } from "@/types";
import { formatError } from "../utils";
import z from "zod";

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
      message: formatError(error),
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

    // ✅ Create user in DB (lowercase email for uniqueness)
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email.toLowerCase(),
        password: hashedPassword,
      },
    });

    // ✅ Auto sign in new user
    await signIn("credentials", {
      email: user.email,
      password: user.password, // plain password
      redirect: true,
      redirectTo: "/",
    });

    return { success: true, message: "Account created successfully" };
  } catch (error: any) {
    if (isRedirectError(error)) throw error;

    return { success: false, message: formatError(error) };
  }
}

// -------------------- GET USER BY ID --------------------
export async function getUserById(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId },
  });
  if (!user) throw new Error("User not found");

  return {
    ...user,
    address: user.address as ShippingAddress | null,
  };
}

// -------------------- UPDATE USER ADDRESS --------------------
export async function updateUserAddress(data: ShippingAddress) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("User not found");

    const address = shippingAddressSchema.parse(data);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { address },
    });

    return {
      success: true,
      message: "User address updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// -------------------- UPDATE USER PAYMENT METHOD --------------------
export async function updateUserPaymentMethod(type: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("User not found");

    // ✅ Validate payment method against schema
    paymentMethodSchema.parse({ type });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { paymentMethod: type },
    });

    return {
      success: true,
      message: "Payment method updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
