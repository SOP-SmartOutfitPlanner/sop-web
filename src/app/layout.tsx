import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/navbar";
import { GoogleAuthProvider } from "@/components/providers/google-oauth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { StagewiseProvider } from "@/components/providers/stagewise-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SOP Wardrobe",
  description: "Standard Operating Procedure for Wardrobe Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <StagewiseProvider>
          <QueryProvider>
            <GoogleAuthProvider>
              <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100">
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                  {children}
                </main>
              </div>
              <Toaster />
            </GoogleAuthProvider>
          </QueryProvider>
        </StagewiseProvider>
      </body>
    </html>
  );
}
