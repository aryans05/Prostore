import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CredentialsSignInForm from "./credentials-signin-form";
import { auth } from "@/auth"; // ✅ NextAuth v5 server import
import { redirect } from "next/navigation";

/* -----------------------------------------------
 ✅ Page Metadata
----------------------------------------------- */
export const metadata: Metadata = {
  title: "Sign In",
};

/* -----------------------------------------------
 ✅ Dynamic Mode
 Needed for `auth()` + `redirect()` to work on server
----------------------------------------------- */
export const dynamic = "force-dynamic";

/* -----------------------------------------------
 ✅ Sign-In Page (Server Component)
----------------------------------------------- */
export default async function SignInPage({
  searchParams,
}: {
  searchParams?: { callbackUrl?: string };
}) {
  const session = await auth();

  // ✅ Redirect logged-in users to dashboard/home
  if (session) {
    redirect(searchParams?.callbackUrl || "/");
  }

  return (
    <div className="w-full max-w-md mx-auto py-10">
      <Card>
        <CardHeader className="space-y-4">
          <Link href="/" className="flex justify-center">
            <Image
              src="/images/logo.svg"
              width={100}
              height={100}
              alt={`${APP_NAME} logo`}
              priority
            />
          </Link>
          <CardTitle className="text-center text-2xl font-semibold">
            Sign In
          </CardTitle>
          <CardDescription className="text-center text-gray-500">
            Sign in to your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* ✅ Client Component handles credential login */}
          <CredentialsSignInForm />
        </CardContent>
      </Card>
    </div>
  );
}
