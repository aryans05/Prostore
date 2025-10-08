import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { APP_NAME, SERVER_URL } from "@/lib/constants/index";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "next-auth/react"; // ✅ Import SessionProvider

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: `%s | Prostore`,
    default: APP_NAME,
  },
  description: "Ecommerce Platform",
  metadataBase: new URL(SERVER_URL),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased bg-background text-foreground min-h-screen`}
      >
        <SessionProvider>
          {/* ✅ Wrap everything that uses useSession() inside */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
