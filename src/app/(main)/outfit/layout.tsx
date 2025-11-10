import { AnimatedBackground } from "@/components/ui/animated-background";

export default function OutfitLayout({
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
