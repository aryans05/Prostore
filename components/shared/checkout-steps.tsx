import React from "react";
import { cn } from "@/lib/utils";

interface CheckoutStepsProps {
  current?: number;
}

const CheckoutSteps = ({ current = 0 }: CheckoutStepsProps) => {
  const steps = [
    "User Login",
    "Shipping Address",
    "Payment Method",
    "Place Order",
  ];

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div
            className={cn(
              "flex items-center justify-center gap-2 p-2 w-56 rounded-full text-center text-sm text-black", // ✅ always black text
              index === current ? "bg-secondary font-semibold" : "bg-gray-200"
            )}
          >
            {/* Step number */}
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-400 text-xs font-bold">
              {index + 1}
            </span>
            {/* Step name */}
            <span>{step}</span>
          </div>

          {/* Connector line between steps */}
          {index < steps.length - 1 && (
            <hr className="hidden md:block w-16 border-t border-gray-300 mx-2" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CheckoutSteps;
