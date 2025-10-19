import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins, Bricolage_Grotesque } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/auth-provider";
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
        <StagewiseProvider>
          <AuthProvider>
            <QueryProvider>
              <GoogleAuthProvider>
                {children}
                <Toaster />
              </GoogleAuthProvider>
            </QueryProvider>
          </AuthProvider>
        </StagewiseProvider>
      </body >
    </html >
  );
}
