import { AnimatedBackground } from "@/components/ui/animated-background";

export default function CollectionsLayout({
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
