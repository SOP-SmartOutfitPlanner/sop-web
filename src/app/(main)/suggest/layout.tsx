import { AnimatedBackground } from "@/components/ui/animated-background";

export default function SuggestLayout({
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