 
importScripts("https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDwHrOG7ysQ_oVBuH7W3b5VaAToc9GDgmo",
  authDomain: "smartoutfitplanner-a41fc.firebaseapp.com",
  projectId: "smartoutfitplanner-a41fc",
  storageBucket: "smartoutfitplanner-a41fc.firebasestorage.app",
  messagingSenderId: "1092345063105",
  appId: "1:1092345063105:web:3d5111e03279d564b19640",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title ?? "SOP Notification";
  const notificationOptions = {
    body: payload.notification?.body,
    icon: "/icons/icon-192x192.png",
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

