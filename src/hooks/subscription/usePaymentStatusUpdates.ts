import { useEffect, useRef, useState } from "react";
import type { HubConnection } from "@microsoft/signalr";

import { buildPaymentHubConnection } from "@/lib/realtime/payment-hub";
import type {
  PaymentStatusUpdate,
  PaymentStatusDetails,
} from "@/types/subscription";

type ConnectionState = "idle" | "connecting" | "connected" | "error";

interface UsePaymentStatusUpdatesOptions {
  enabled?: boolean;
  onUpdate?: (payload: PaymentStatusUpdate) => void;
  userId?: number | null;
  userSubscriptionId?: number | null;
}

interface UsePaymentStatusUpdatesResult {
  statusUpdate: PaymentStatusUpdate | null;
  connectionState: ConnectionState;
  error: Error | null;
}

export function usePaymentStatusUpdates(
  transactionId?: number | null,
  options?: UsePaymentStatusUpdatesOptions
): UsePaymentStatusUpdatesResult {
  const [statusUpdate, setStatusUpdate] = useState<PaymentStatusUpdate | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [error, setError] = useState<Error | null>(null);
  const connectionRef = useRef<HubConnection | null>(null);
  const onUpdateRef =
    useRef<UsePaymentStatusUpdatesOptions["onUpdate"]>(undefined);
  const enabled = options?.enabled ?? true;
  const userId = options?.userId ?? null;
  const userSubscriptionId = options?.userSubscriptionId ?? null;

  useEffect(() => {
    onUpdateRef.current = options?.onUpdate;
  }, [options?.onUpdate]);

  useEffect(() => {
    // Cần có transactionId hoặc userSubscriptionId để lắng nghe
    if ((!transactionId && !userSubscriptionId) || !enabled || !userId) {
      cleanupConnection(connectionRef);
      setConnectionState("idle");
      setStatusUpdate(null);
      if (!userId && (transactionId || userSubscriptionId)) {
        setError(new Error("Missing user information for payment updates."));
      }
      return;
    }

    let isMounted = true;
    setConnectionState("connecting");
    setError(null);

    const connection = buildPaymentHubConnection();
    connectionRef.current = connection;

    connection.on("PaymentStatusUpdated", (payload: unknown) => {
      if (!isMounted) return;
      
      // BE gửi payload với structure: { statusCode, message, data: {...} }
      const rawPayload = payload as {
        statusCode?: number;
        message?: string;
        data?: PaymentStatusDetails;
        transactionId?: number;
        status?: string;
      };
      
      // Extract transactionId và userSubscriptionId từ data hoặc top level
      const payloadTransactionId =
        rawPayload.data?.transactionId ?? rawPayload.transactionId ?? 0;
      const payloadUserSubscriptionId = rawPayload.data?.userSubscriptionId ?? 0;
      
      // Normalize thành PaymentStatusUpdate format
      const normalizedPayload: PaymentStatusUpdate = {
        transactionId: payloadTransactionId,
        status: rawPayload.data?.status ?? rawPayload.status ?? "PENDING",
        message: rawPayload.message,
        data: rawPayload.data,
      };
      
      if (process.env.NODE_ENV === "development") {
        console.info("[PaymentStatusUpdated:received]", {
          payloadTransactionId,
          payloadUserSubscriptionId,
          expectedTransactionId: transactionId,
          expectedUserSubscriptionId: userSubscriptionId,
          rawPayload,
          normalizedPayload,
        });
      }
      
      // Accept event nếu userSubscriptionId khớp (ưu tiên) hoặc transactionId khớp
      const isUserSubscriptionMatch =
        userSubscriptionId && payloadUserSubscriptionId === userSubscriptionId;
      const isTransactionMatch =
        transactionId && payloadTransactionId === transactionId;
      
      if (!isUserSubscriptionMatch && !isTransactionMatch) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[PaymentStatusUpdated:ignored] No match", {
            receivedTransactionId: payloadTransactionId,
            receivedUserSubscriptionId: payloadUserSubscriptionId,
            expectedTransactionId: transactionId,
            expectedUserSubscriptionId: userSubscriptionId,
          });
        }
        return;
      }

      if (process.env.NODE_ENV === "development") {
        console.info("[PaymentStatusUpdated:accepted]", normalizedPayload);
      }
      
      // Cập nhật state với normalized payload để trigger re-render
      setStatusUpdate(normalizedPayload);
      onUpdateRef.current?.(normalizedPayload);
      
      // Nếu status là final state (COMPLETED, FAILED, CANCEL), đóng connection
      const finalStatus = normalizedPayload.status?.toUpperCase();
      if (finalStatus === "COMPLETED" || finalStatus === "FAILED" || finalStatus === "CANCEL") {
        if (process.env.NODE_ENV === "development") {
          console.info("[PaymentStatusUpdated] Final status received, closing connection", {
            status: finalStatus,
          });
        }
        // Đóng connection sau một chút để đảm bảo state đã được cập nhật
        setTimeout(() => {
          if (connectionRef.current) {
            cleanupConnection(connectionRef);
            setConnectionState("idle");
          }
        }, 100);
      }
    });

    connection
      .start()
      .then(async () => {
        if (!isMounted) return;
        try {
          await connection.invoke("AddToGroup", userId, transactionId);
          if (!isMounted) return;
          setConnectionState("connected");
        } catch (groupError) {
          if (!isMounted) return;
          setError(
            groupError instanceof Error
              ? groupError
              : new Error("Unable to subscribe to payment updates.")
          );
          setConnectionState("error");
          try {
            await connection.stop();
          } catch {
            // ignore
          }
        }
      })
      .catch((connectionError) => {
        if (!isMounted) return;
        setError(
          connectionError instanceof Error
            ? connectionError
            : new Error("Unable to connect to payment hub.")
        );
        setConnectionState("error");
      });

    return () => {
      isMounted = false;
      cleanupConnection(connectionRef);
    };
  }, [transactionId, enabled, userId, userSubscriptionId]);

  return {
    statusUpdate,
    connectionState,
    error,
  };
}

type ConnectionRef = { current: HubConnection | null };

const cleanupConnection = (connectionRef: ConnectionRef) => {
  const connection = connectionRef.current;
  if (!connection) return;

  connection.off("PaymentStatusUpdated");
  connection
    .stop()
    .catch(() => {
      // no-op: best effort stop
    })
    .finally(() => {
      connectionRef.current = null;
    });
};

