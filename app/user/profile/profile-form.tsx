"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { updateProfileSchema } from "@/lib/validators";
import { updateProfile } from "@/lib/actions/user.action"; // ✅ corrected import path

const ProfileForm = () => {
  const { data: session, update } = useSession();
  const { toast } = useToast();

  // ✅ setup form with Zod validation
  const form = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
    },
  });

  // ✅ handle form submission
  const onSubmit = async (values: z.infer<typeof updateProfileSchema>) => {
    try {
      const res = await updateProfile(values);

      // ❌ if update failed
      if (!res.success) {
        return toast({
          title: "Update failed",
          description: res.message,
          variant: "destructive",
        });
      }

      // ✅ update session name instantly (no refresh needed)
      const newSession = {
        ...session,
        user: {
          ...session?.user,
          name: values.name,
        },
      };

      await update(newSession);

      toast({
        title: "Profile updated",
        description: res.message,
      });
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Unable to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5 max-w-md mx-auto mt-6"
      >
        {/* Email (disabled) */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Input
                  disabled
                  placeholder="Email"
                  {...field}
                  className="input-field"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Name (editable) */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Input placeholder="Name" {...field} className="input-field" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="button w-full"
        >
          {form.formState.isSubmitting ? "Submitting..." : "Update Profile"}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;
