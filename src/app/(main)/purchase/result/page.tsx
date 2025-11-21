"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const formatTimeLeft = (seconds: number) => {
  return seconds.toString().padStart(2, "0");
};

export default function PurchaseResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const [isLoading, setIsLoading] = useState(true);

  // Lấy thông tin từ query params
  const status = searchParams.get("status") ?? "COMPLETED";
  const amount = searchParams.get("amount");
  const planName = searchParams.get("planName") ?? "Subscription";
  const transactionCode = searchParams.get("transactionCode");
  const message = searchParams.get("message") ?? "Payment successful. Subscription activated.";
  const dateExp = searchParams.get("dateExp");

  // Simulate loading khi component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const isSuccess = status === "COMPLETED";
  const isFailed = status === "FAILED";
  const isCancelled = status === "CANCEL";
  const isPending = status === "PENDING";

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      router.push("/wardrobe");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push("/wardrobe");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, router]);

  const handleGoToWardrobe = () => {
    router.push("/wardrobe");
  };

  // Xác định màu sắc và styling cho từng trường hợp
  const statusConfig = {
    COMPLETED: {
      icon: CheckCircle2,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/20",
      borderColor: "border-emerald-400/40",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-300",
      title: "Payment Successful!",
      titleColor: "text-emerald-300",
      buttonClass: "bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500",
      showSparkles: true,
      backgroundGradient: "bg-linear-to-br from-emerald-900/40 via-teal-900/30 to-slate-900",
    },
    FAILED: {
      icon: XCircle,
      iconColor: "text-red-400",
      iconBg: "bg-red-500/20",
      borderColor: "border-red-400/40",
      bgColor: "bg-red-500/10",
      textColor: "text-red-300",
      title: "Payment Failed",
      titleColor: "text-red-300",
      buttonClass: "bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500",
      showSparkles: false,
      backgroundGradient: "bg-linear-to-br from-red-900/40 via-rose-900/30 to-slate-900",
    },
    CANCEL: {
      icon: AlertCircle,
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/20",
      borderColor: "border-amber-400/40",
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-300",
      title: "Payment Cancelled",
      titleColor: "text-amber-300",
      buttonClass: "bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500",
      showSparkles: false,
      backgroundGradient: "bg-linear-to-br from-amber-900/40 via-orange-900/30 to-slate-900",
    },
    PENDING: {
      icon: Clock,
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/20",
      borderColor: "border-blue-400/40",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-300",
      title: "Payment Processing",
      titleColor: "text-blue-300",
      buttonClass: "bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500",
      showSparkles: false,
      backgroundGradient: "bg-linear-to-br from-blue-900/40 via-cyan-900/30 to-slate-900",
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.COMPLETED;
  const IconComponent = config.icon;

  // Loading state
  if (isLoading) {
    const loadingConfig = statusConfig[status as keyof typeof statusConfig] || statusConfig.COMPLETED;
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 py-24 ${loadingConfig.backgroundGradient}`}>
        <div className="rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl p-8 space-y-6 text-center max-w-md w-full">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-cyan-400 rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="font-dela-gothic text-xl text-white">
              Loading Payment Result...
            </h2>
            <p className="font-poppins text-sm text-gray-300">
              Please wait while we fetch your payment information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-24 ${config.backgroundGradient}`}>
      <div className="max-w-xl w-full rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl p-8 space-y-6 text-center relative overflow-hidden">
        {/* Background decoration */}
        {config.showSparkles && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl -z-10" />
        )}

        {/* Icon with animation */}
        <div className="flex justify-center relative">
          <div
            className={`${config.iconBg} ${config.borderColor} rounded-full p-6 border-2 animate-pulse`}
          >
            <IconComponent className={`w-16 h-16 ${config.iconColor}`} />
          </div>
          {config.showSparkles && (
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 text-emerald-400/30 animate-pulse" />
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className={`font-dela-gothic text-3xl md:text-4xl ${config.titleColor} mb-2`}>
            {config.title}
          </h1>
          <p className="font-poppins text-sm text-gray-300">{message}</p>
        </div>

        {/* Payment Details Card */}
        <div
          className={`rounded-2xl border ${config.borderColor} ${config.bgColor} p-6 space-y-4 text-left`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <p className="text-sm text-gray-400 font-medium">Subscription Plan</p>
            <p className="font-semibold text-white text-lg">{planName}</p>
          </div>

          {amount && (
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <p className="text-sm text-gray-400 font-medium">Amount Paid</p>
              <p className={`font-bold text-xl ${isSuccess ? "text-emerald-300" : "text-white"}`}>
                {Number(amount).toLocaleString("vi-VN")} ₫
              </p>
            </div>
          )}

          {transactionCode && (
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <p className="text-sm text-gray-400 font-medium">Transaction Code</p>
              <p className="font-mono font-semibold text-white">{transactionCode}</p>
            </div>
          )}

          {dateExp && isSuccess && (
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <p className="text-sm text-gray-400 font-medium">Expires On</p>
              <p className="font-semibold text-white">
                {new Date(dateExp).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-gray-400 font-medium">Status</p>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.textColor} border ${config.borderColor}`}
            >
              {status}
            </span>
          </div>
        </div>

        {/* Countdown */}
        <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
          <p className="font-poppins text-sm text-gray-300 mb-3">
            Redirecting to Wardrobe in:
          </p>
          <div className="flex items-center justify-center gap-2">
            <p className="font-dela-gothic text-5xl text-white tabular-nums">
              {formatTimeLeft(countdown)}
            </p>
            <span className="text-gray-400 text-sm">seconds</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleGoToWardrobe}
            className={`flex-1 ${config.buttonClass} text-white`}
          >
            <span>Go to Wardrobe</span>
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          {!isSuccess && (
            <Button
              onClick={() => router.push("/subscription")}
              variant="outline"
              className="flex-1 border-white/40 text-white hover:bg-white/10"
            >
              View Plans
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

