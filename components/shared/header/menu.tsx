"use client";

import { Button } from "@/components/ui/button";
import { EllipsisVertical, ShoppingCart, UserIcon } from "lucide-react";
import ModeToggle from "./mode-toggle";
import Link from "next/link";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import UserButton from "./user-button";

const Menu = () => {
  return (
    <div className="flex justify-end gap-3 items-center">
      {/* Desktop / tablet */}
      <nav className="hidden md:flex items-center gap-2">
        <ModeToggle />

        <Button asChild variant="ghost">
          <Link href="/cart" className="flex items-center">
            <ShoppingCart className="h-4 w-4 mr-2" />
            <span>Cart</span>
          </Link>
        </Button>

        <UserButton />
      </nav>

      {/* Mobile */}
      <nav className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" aria-label="Open menu">
              <EllipsisVertical className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent className="flex flex-col items-start space-y-4">
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>Quick actions and navigation</SheetDescription>

            <div className="w-full flex flex-col gap-2">
              <ModeToggle />

              <Button asChild variant="ghost" className="w-full justify-start">
                <Link href="/cart" className="flex items-center w-full">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  <span>Cart</span>
                </Link>
              </Button>

              <UserButton />
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

export default Menu;
