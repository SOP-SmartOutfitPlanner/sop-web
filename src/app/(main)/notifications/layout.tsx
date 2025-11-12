import { AnimatedBackground } from "@/components/ui/animated-background";

export default function NotificationLayout({
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
