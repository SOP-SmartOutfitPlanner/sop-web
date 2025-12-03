import { AnimatedBackground } from "@/components/ui/animated-background";

export default function SuggestV2Layout({
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
