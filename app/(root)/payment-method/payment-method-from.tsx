"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { paymentMethodSchema } from "@/lib/validators";
import { PAYMENT_METHODS, DEFAULT_PAYMENT_METHOD } from "@/lib/constants";
import CheckoutSteps from "@/components/shared/checkout-steps";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserPaymentMethod } from "@/lib/actions/user.action"; // ✅ import server action

type PaymentMethodFormProps = {
  preferredPaymentMethod: string | null;
};

const PaymentMethodForm = ({
  preferredPaymentMethod,
}: PaymentMethodFormProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof paymentMethodSchema>>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      type: preferredPaymentMethod ?? DEFAULT_PAYMENT_METHOD,
    },
  });

  const onSubmit = (data: z.infer<typeof paymentMethodSchema>) => {
    startTransition(async () => {
      try {
        const res = await updateUserPaymentMethod(data.type); // ✅ save to DB
        if (res.success) {
          toast({ description: `Payment method set to ${data.type}` });
          router.push("/place-order"); // ✅ go to place order
        } else {
          toast({
            description: res.message ?? "Failed to update payment method",
          });
        }
      } catch (err) {
        toast({ description: "Failed to update payment method" });
      }
    });
  };

  return (
    <>
      <CheckoutSteps current={2} />

      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-2xl shadow">
        <h1 className="text-xl font-bold mb-2">Payment Method</h1>
        <p className="text-gray-600 mb-6">Please select a payment method</p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-3">
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="radio"
                  value={method}
                  {...form.register("type")}
                  defaultChecked={
                    method ===
                    (preferredPaymentMethod ?? DEFAULT_PAYMENT_METHOD)
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-800">{method}</span>
              </label>
            ))}
          </div>

          {form.formState.errors.type && (
            <p className="text-red-500 text-sm">
              {form.formState.errors.type.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </>
  );
};

export default PaymentMethodForm;
