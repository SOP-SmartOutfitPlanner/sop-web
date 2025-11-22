"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Purchase } from "@/types/subscription";

interface PendingPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchase: Purchase | null;
  expiresAt: number | null;
  isExpired: boolean;
  timeLeftLabel: string;
  isCancelling: boolean;
  onContinuePayment: () => void;
  onCancelPayment: () => void;
}

export function PendingPaymentDialog({
  open,
  onOpenChange,
  purchase,
  expiresAt,
  isExpired,
  timeLeftLabel,
  isCancelling,
  onContinuePayment,
  onCancelPayment,
}: PendingPaymentDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white/10 border-white/20 backdrop-blur-xl text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-dela-gothic text-2xl text-white">
            Subscription Payment Pending
          </AlertDialogTitle>
          <AlertDialogDescription className="font-poppins text-gray-200 pt-2">
            You have a pending subscription payment. Would you like to continue
            with the payment or cancel it?
          </AlertDialogDescription>
        </AlertDialogHeader>
        {purchase && (
          <div className="rounded-xl border border-white/20 bg-white/5 p-4 space-y-2 my-4">
            <div className="flex items-center justify-between">
              <p className="font-poppins text-sm text-gray-400">Plan</p>
              <p className="font-semibold text-white">
                {purchase.subscriptionPlanName}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="font-poppins text-sm text-gray-400">Amount</p>
              <p className="font-semibold text-white">
                {typeof purchase.amount === "number"
                  ? purchase.amount.toLocaleString("vi-VN") + " ₫"
                  : "N/A"}
              </p>
            </div>
            {expiresAt && !isExpired && (
              <div className="flex items-center justify-between">
                <p className="font-poppins text-sm text-gray-400">
                  Expires in
                </p>
                <p className="font-semibold text-amber-200">{timeLeftLabel}</p>
              </div>
            )}
          </div>
        )}
        <AlertDialogFooter className="flex-col sm:flex-row gap-3">
          <Button
            onClick={onCancelPayment}
            className="w-full sm:w-auto bg-red-600/80 hover:bg-red-500 text-white border-0"
            disabled={isCancelling}
          >
            {isCancelling ? "Cancelling..." : "Cancel Payment"}
          </Button>
          <AlertDialogAction
            onClick={onContinuePayment}
            className="w-full sm:w-auto bg-linear-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500"
          >
            Continue Payment
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

