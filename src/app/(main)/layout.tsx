import { ConditionalNavbar } from "@/components/layout/conditional-navbar";
import GlassCursor from "@/components/ui/glass-cursor";
import LoadingPreloader from "@/components/ui/preloading";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <LoadingPreloader />
      <GlassCursor />
      <ConditionalNavbar />
      {children}
    </>
  );
}

