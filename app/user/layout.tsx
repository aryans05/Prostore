import { APP_NAME } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import Menu from "@/components/shared/header/menu";
import MainNav from "./main-nav";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/" className="w-22" aria-label={`${APP_NAME} logo`}>
            <Image
              src="/images/logo.svg"
              width={48}
              height={48}
              alt={`${APP_NAME} logo`}
            />
          </Link>

          {/* ✅ User Main Navigation */}
          <MainNav className="mx-6" />

          {/* ✅ Global Menu (Sign In / User Dropdown) */}
          <div className="ml-auto flex items-center space-x-4">
            <Menu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 space-y-4 p-8 pt-6 container mx-auto">
        {children}
      </main>
    </div>
  );
}
