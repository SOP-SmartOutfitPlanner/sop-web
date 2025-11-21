import { AnimatedBackground } from "@/components/ui/animated-background";

export default function PurchaseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AnimatedBackground />
      {children}
    </>
  );
}
