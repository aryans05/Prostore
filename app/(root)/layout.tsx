import Header from "@/components/shared/header";
import Footer from "@/components/footer";
import { AuthProvider } from "@/components/providers/session-provider";
import "../globals.css"; // ✅ still fine

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        {/* Header always on top */}
        <Header />

        {/* Page content */}
        <main className="flex-1 wrapper">{children}</main>

        {/* Footer always at bottom */}
        <Footer />
      </div>
    </AuthProvider>
  );
}
