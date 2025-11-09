import { ConditionalNavbar } from "@/components/layout/conditional-navbar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ConditionalNavbar />
      <main className="relative">
        {children}
      </main>
    </>
  );
}

