"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User as UserIcon } from "lucide-react";

const UserButton = () => {
  const { data: session } = useSession();

  // ✅ If user is NOT logged in → show “Sign In” button
  if (!session) {
    return (
      <Button asChild>
        <Link href="/sign-in">
          <UserIcon className="mr-2 h-4 w-4" />
          Sign In
        </Link>
      </Button>
    );
  }

  // ✅ If user IS logged in → show dropdown menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <UserIcon className="mr-2 h-4 w-4" />
          {session.user?.name || session.user?.email || "Account"}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>

        {/* ✅ Correct profile and orders links */}
        <DropdownMenuItem asChild>
          <Link href="/user/profile" className="w-full">
            User Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/user/orders" className="w-full">
            Order History
          </Link>
        </DropdownMenuItem>

        {/* ✅ Sign Out button */}
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/sign-in" })}
          className="text-red-600 focus:text-red-600"
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
