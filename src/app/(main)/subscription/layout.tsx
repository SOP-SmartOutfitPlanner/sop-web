import { AnimatedBackground } from "@/components/ui/animated-background";

export default function SubscriptionLayout({
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
