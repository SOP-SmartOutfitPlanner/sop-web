import { AnimatedBackground } from "@/components/ui/animated-background";

export default function StylistVerificationLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-32 -mb-16">
      <AnimatedBackground />
      {children}
    </div>
  );
}
