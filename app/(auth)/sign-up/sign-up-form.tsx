"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useActionState } from "react"; // ✅ from react (not react-dom)
import { useFormStatus } from "react-dom"; // ✅ still from react-dom
import { signUpUser } from "@/lib/actions/user.action";
import { signUpDefaultValues } from "@/lib/constants";

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? "Signing Up..." : "Sign Up"}
    </Button>
  );
};

async function handleSignUp(prevState: any, formData: FormData) {
  return await signUpUser(prevState, formData);
}

const SignUpForm = () => {
  // ✅ useActionState now works
  const [state, action] = useActionState(handleSignUp, {
    success: false,
    message: "",
  });

  return (
    <form action={action} className="space-y-6">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={signUpDefaultValues.name}
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={signUpDefaultValues.email}
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          defaultValue={signUpDefaultValues.password}
        />
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          defaultValue={signUpDefaultValues.confirmPassword}
        />
      </div>

      <SubmitButton />

      {state.message && (
        <div
          className={`text-center ${
            state.success ? "text-green-600" : "text-destructive"
          }`}
        >
          {state.message}
        </div>
      )}

      <div className="text-sm text-center text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="link">
          Sign In
        </Link>
      </div>
    </form>
  );
};

export default SignUpForm;
