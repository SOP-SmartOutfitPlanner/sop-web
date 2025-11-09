import { AnimatedBackground } from "@/components/ui/animated-background";

export default function WardrobeLayout({
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
