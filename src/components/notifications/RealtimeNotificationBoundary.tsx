"use client";

import dynamic from "next/dynamic";

const RealtimeNotificationListener = dynamic(
  () =>
    import("./RealtimeNotificationListener").then(
      (m) => m.RealtimeNotificationListener
    ),
  {
    ssr: false,
  }
);

export function RealtimeNotificationBoundary() {
  return <RealtimeNotificationListener />;
}


