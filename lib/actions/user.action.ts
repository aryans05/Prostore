"use server";

import {
  shippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
  paymentMethodSchema,
  updateProfileSchema,
} from "../validators";
import { auth, signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcryptjs";
import prisma from "@/lib/prisma";
import { ShippingAddress } from "@/types";
import { formatError } from "../utils";

/* =======================================================
   🔐 SIGN IN
   ======================================================= */
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
    return { success: false, message: formatError(error) };
  }
}

/* =======================================================
   🚪 SIGN OUT
   ======================================================= */
export async function signOutUser() {
  try {
    await signOut();
    return { success: true, message: "Signed out successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

/* =======================================================
   🧾 SIGN UP
   ======================================================= */
export async function signUpUser(prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    // ✅ Hash password
    const hashedPassword = hashSync(user.password, 10);

    // ✅ Create user (store lowercase email)
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email.toLowerCase(),
        password: hashedPassword,
      },
    });

    // ✅ Auto sign-in new user
    await signIn("credentials", {
      email: user.email,
      password: user.password,
      redirect: true,
      redirectTo: "/",
    });

    return { success: true, message: "Account created successfully" };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: formatError(error) };
  }
}

/* =======================================================
   👤 GET USER BY ID
   ======================================================= */
export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) throw new Error("User not found");

    return {
      ...user,
      address: user.address as ShippingAddress | null,
    };
  } catch (error) {
    throw new Error(formatError(error));
  }
}

/* =======================================================
   🏠 UPDATE USER ADDRESS
   ======================================================= */
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
      message: "Address updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

/* =======================================================
   💳 UPDATE USER PAYMENT METHOD
   ======================================================= */
export async function updateUserPaymentMethod(type: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("User not found");

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

/* =======================================================
   ✏️ UPDATE USER PROFILE (FIXED ✅)
   ======================================================= */
export async function updateProfile(user: { name: string; email: string }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("User not found");

    // ✅ Validate the data
    const validatedUser = updateProfileSchema.parse(user);

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser) throw new Error("User not found");

    // ✅ Only update the name, not the email (prevents duplicate error)
    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: validatedUser.name,
      },
    });

    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
