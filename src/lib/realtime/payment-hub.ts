import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

const rawPaymentHubUrl =
  process.env.NEXT_PUBLIC_PAYMENT_HUB_URL ?? "https://sop.wizlab.io.vn/paymentHub";

const PAYMENT_HUB_URL = (() => {
  if (!rawPaymentHubUrl) return "";
  if (rawPaymentHubUrl.startsWith("https://")) return rawPaymentHubUrl;
  if (rawPaymentHubUrl.startsWith("http://")) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[payment-hub] Changing endpoint from http to https to avoid security issues."
      );
    }
    return rawPaymentHubUrl.replace("http://", "https://");
  }
  return `https://${rawPaymentHubUrl.replace(/^\/+/, "")}`;
})();

export type PaymentHubConnection = HubConnection;

export const buildPaymentHubConnection = () => {
  if (!PAYMENT_HUB_URL) {
    throw new Error(
      "Missing realtime base URL. Please set NEXT_PUBLIC_API_BASE_URL or NEXT_PUBLIC_REALTIME_BASE_URL."
    );
  }

  const connection = new HubConnectionBuilder()
    .withUrl(PAYMENT_HUB_URL, {
      withCredentials: false,
      // accessTokenFactory: () => localStorage.getItem("accessToken") ?? "",
    })
    .withAutomaticReconnect()
    .configureLogging(
      process.env.NODE_ENV === "development" ? LogLevel.Information : LogLevel.Error
    )
    .build();

  return connection;
};

