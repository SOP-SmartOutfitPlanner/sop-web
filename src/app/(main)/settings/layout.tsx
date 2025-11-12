import { AnimatedBackground } from "@/components/ui/animated-background";

export default function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <AnimatedBackground />
      <div className="min-h-screen relative z-0 pt-32 pb-16">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </>
  );
}

