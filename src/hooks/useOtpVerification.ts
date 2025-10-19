import { useState, useEffect } from "react";

interface UseOtpVerificationOptions {
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  autoVerify?: boolean;
}

export function useOtpVerification({
  onVerify,
  onResend,
  autoVerify = true,
}: UseOtpVerificationOptions) {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-verify when OTP is complete
  useEffect(() => {
    if (autoVerify && otp.length === 6 && !isVerifying) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, autoVerify]);

  const handleVerify = async () => {
    if (otp.length !== 6) return;

    setIsVerifying(true);
    try {
      await onVerify(otp);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    try {
      await onResend();
      setCountdown(60);
      setOtp("");
    } finally {
      setIsResending(false);
    }
  };

  return {
    otp,
    setOtp,
    isVerifying,
    isResending,
    countdown,
    handleVerify,
    handleResend,
  };
}

