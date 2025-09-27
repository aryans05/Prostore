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
import { auth } from "@/auth"; // ✅ v5 import
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign In",
};

const SignInPage = async ({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) => {
  // ✅ Check session on the server (v5 style)
  const session = await auth();

  if (session) {
    redirect(searchParams?.callbackUrl || "/");
  }

  return (
    <div className="w-full max-w-md mx-auto">
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
          <CardTitle className="text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ✅ Client component that calls signIn("credentials") */}
          <CredentialsSignInForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;
