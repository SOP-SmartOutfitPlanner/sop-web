import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins, Bricolage_Grotesque } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { LayoutContent } from "@/components/layout/layout-content";
import { GoogleAuthProvider } from "@/components/providers/google-oauth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";
import LoadingPreloader from "@/components/ui/preloading";

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

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-bricolage-grotesque",
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
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${bricolageGrotesque.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <LoadingPreloader/>
        <QueryProvider>
          <GoogleAuthProvider>
            <LayoutContent>{children}</LayoutContent>
            <Toaster />
          </GoogleAuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
