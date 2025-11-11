import { AnimatedBackground } from "@/components/ui/animated-background";

export default function WeeklyLayout({
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
