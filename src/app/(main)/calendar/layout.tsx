import { AnimatedBackground } from "@/components/ui/animated-background";

export default function Calendarayout({
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
