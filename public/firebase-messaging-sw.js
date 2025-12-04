 
importScripts("https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging-compat.js");

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDwHrOG7ysQ_oVBuH7W3b5VaAToc9GDgmo",
  authDomain: "smartoutfitplanner-a41fc.firebaseapp.com",
  projectId: "smartoutfitplanner-a41fc",
  storageBucket: "smartoutfitplanner-a41fc.firebasestorage.app",
  messagingSenderId: "1092345063105",
  appId: "1:1092345063105:web:3d5111e03279d564b19640",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Check if any client (browser tab) is currently visible
async function isClientVisible() {
  const clients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  return clients.some((client) => client.visibilityState === "visible");
}

// Show OS notification
function showOSNotification(payload) {
  const title = payload.notification?.title || payload.data?.title || "SOP Notification";
  const options = {
    body: payload.notification?.body || payload.data?.message || "",
    icon: "/icon/icon-192x192.png",
    badge: "/icon/icon-72x72.png",
    tag: payload.data?.notificationId || `sop-${Date.now()}`,
    data: payload.data,
    requireInteraction: false,
    silent: false,
  };

  console.log("[SW] Showing notification:", title, options);
  return self.registration.showNotification(title, options);
}

// Handle background messages
messaging.onBackgroundMessage(async (payload) => {
  console.log("[SW] Background message received:", payload);

  const isVisible = await isClientVisible();
  console.log("[SW] Client visible:", isVisible);

  if (isVisible) {
    // App is open, foreground handler will show toast
    console.log("[SW] Skipping OS notification - app is visible");
    return;
  }

  // App is in background, show OS notification
  return showOSNotification(payload);
});

// Handle push event directly (fallback for data-only messages)
self.addEventListener("push", (event) => {
  console.log("[SW] Push event received");
  
  if (!event.data) {
    console.log("[SW] No data in push event");
    return;
  }

  // Let Firebase SDK handle it first via onBackgroundMessage
  // This is a fallback for edge cases
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked", event.notification.data);
  event.notification.close();

  // Get the URL to open - use href from data or default to notifications page
  const baseUrl = "https://smartoutfitplanner.com";
  const path = event.notification.data?.href || "/notifications";
  const urlToOpen = path.startsWith("http") ? path : `${baseUrl}${path}`;

  console.log("[SW] Opening URL:", urlToOpen);

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      console.log("[SW] Found clients:", clients.length);
      
      // Try to focus existing tab with our app
      for (const client of clients) {
        if (client.url.includes("smartoutfitplanner.com") && "focus" in client) {
          console.log("[SW] Focusing existing client");
          return client.focus().then(() => {
            if ("navigate" in client) {
              return client.navigate(urlToOpen);
            }
          });
        }
      }
      
      // No existing tab, open new window
      console.log("[SW] Opening new window");
      return self.clients.openWindow(urlToOpen);
    })
  );
});
