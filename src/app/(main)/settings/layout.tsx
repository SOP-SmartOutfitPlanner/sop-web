import { AnimatedBackground } from "@/components/ui/animated-background";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";

export default function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <AnimatedBackground />
      <div className="min-h-screen relative z-0 pt-32">
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <SettingsSidebar />

            {/* Main Content */}
            <div className="md:col-span-3">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

