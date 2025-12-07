import { AnimatedBackground } from "@/components/ui/animated-background";

export default function ProfileLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Profile page has its own full-width layout like wardrobe/suggest pages
  // Break out of parent settings layout constraints
  return (
    <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-32 -mb-16">
      <AnimatedBackground />
      {children}
    </div>
  );
}
