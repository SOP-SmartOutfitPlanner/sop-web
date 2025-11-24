import { Metadata } from "next";
import { StylistDashboardScreen } from "@/components/stylist/StylistDashboardScreen";
import { AnimatedBackground } from "@/components/ui/animated-background";

export const metadata: Metadata = {
  title: "Stylist Studio Dashboard",
  description:
    "Track collection and community post performance to grow your stylist presence.",
};

export default function StylistDashboardPage() {
  return (
    <>
      <AnimatedBackground />
      <StylistDashboardScreen />
    </>
  );
}
