"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Camera,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
  Upload,
  Sparkles,
  Shield,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import GlassButton from "@/components/ui/glass-button";
import { ekycAPI } from "@/lib/api/ekyc-api";
import { userAPI } from "@/lib/api/user-api";
import type { OCRResponse } from "@/lib/api/ekyc-api";

type Step = "front" | "back" | "processing" | "result";

interface VerificationData {
  frontImageHash?: string;
  backImageHash?: string;
  ocrData?: OCRResponse["object"];
}

const STEPS = [
  { id: "front", label: "ID Front", icon: CreditCard },
  { id: "back", label: "ID Back", icon: CreditCard },
];

export default function EKYCPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<Step>("front");
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [verificationData, setVerificationData] = useState<VerificationData>({});
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(true);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shouldStartCameraRef = useRef<boolean>(false);

  const startCamera = useCallback(async () => {
    setIsCameraLoading(true);
    setIsCameraReady(false);
    setError(null);

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser");
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error("Video element not found"));
            return;
          }

          const video = videoRef.current;

          if (video.readyState >= 1) {
            resolve();
            return;
          }

          const handleLoadedMetadata = () => {
            cleanup();
            resolve();
          };

          const handleCanPlay = () => {
            cleanup();
            resolve();
          };

          const handleError = () => {
            cleanup();
            reject(new Error("Video failed to load"));
          };

          const cleanup = () => {
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
            video.removeEventListener("canplay", handleCanPlay);
            video.removeEventListener("error", handleError);
          };

          video.addEventListener("loadedmetadata", handleLoadedMetadata);
          video.addEventListener("canplay", handleCanPlay);
          video.addEventListener("error", handleError);

          setTimeout(() => {
            cleanup();
            resolve();
          }, 10000);
        });

        try {
          await videoRef.current.play();
          setIsCameraReady(true);
        } catch {
          setIsCameraReady(true);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      if (errorMsg.includes("Permission denied") || errorMsg.includes("NotAllowedError")) {
        setError("Camera permission denied. Please allow camera access or use the Upload button.");
      } else if (errorMsg.includes("NotFoundError") || errorMsg.includes("DevicesNotFoundError")) {
        setError("No camera found. Please connect a camera or use the Upload button.");
      } else {
        setError(`Camera error: ${errorMsg}. You can use the Upload button instead.`);
      }
    } finally {
      setIsCameraLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const videoRefCallback = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && shouldStartCameraRef.current) {
      shouldStartCameraRef.current = false;
      startCamera();
    }
  }, [startCamera]);

  useEffect(() => {
    if (["front", "back"].includes(currentStep) && !capturedImage) {
      shouldStartCameraRef.current = true;
      if (videoRef.current) {
        shouldStartCameraRef.current = false;
        startCamera();
      }
      return () => {
        shouldStartCameraRef.current = false;
        stopCamera();
      };
    }
    return () => stopCamera();
  }, [currentStep, capturedImage, startCamera, stopCamera]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setError(null);
    startCamera();
  }, [startCamera]);

  const dataURLtoFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const processStep = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    setError(null);

    try {
      const file = dataURLtoFile(capturedImage, `${currentStep}_${Date.now()}.jpg`);

      const uploadResponse = await ekycAPI.uploadFile(file, `ekyc_${currentStep}`);
      if (uploadResponse.message !== "IDG-00000000") {
        throw new Error("Failed to upload image");
      }
      const imageHash = uploadResponse.object.hash;

      if (currentStep === "front") {
        const classifyResponse = await ekycAPI.classifyId(imageHash);
        if (classifyResponse.message !== "IDG-00000000") {
          throw new Error("Failed to identify document type");
        }

        const idType = classifyResponse.object.type;
        if (idType !== 2) {
          const typeNames: Record<number, string> = {
            0: "CMND cu",
            1: "CMND cu (mat sau)",
            2: "CMND moi",
            3: "CMND moi (mat sau)",
            4: "CCCD",
            5: "CCCD (mat sau)",
            6: "CCCD gan chip",
            7: "CCCD gan chip (mat sau)",
            8: "Ho chieu",
            9: "Bang lai xe",
          };
          const detectedType = typeNames[idType] || `Unknown (${idType})`;
          throw new Error(`Only CMND moi is accepted. Detected: ${detectedType}. Please use your CMND moi.`);
        }

        const livenessResponse = await ekycAPI.checkCardLiveness(imageHash);
        if (livenessResponse.object.liveness !== "success") {
          throw new Error("Document appears to be a photo of a photo. Please use your actual ID card.");
        }

        const ocrResponse = await ekycAPI.ocrIdFront(imageHash, 2);
        if (ocrResponse.message !== "IDG-00000000") {
          throw new Error("Failed to read ID information");
        }

        setVerificationData((prev) => ({
          ...prev,
          frontImageHash: imageHash,
          ocrData: ocrResponse.object,
        }));

        setCapturedImage(null);
        setCurrentStep("back");
        toast.success("ID front captured successfully!");

      } else if (currentStep === "back") {
        const livenessResponse = await ekycAPI.checkCardLiveness(imageHash);
        if (livenessResponse.object.liveness !== "success") {
          throw new Error("Document appears to be a photo of a photo. Please use your actual ID card.");
        }

        const ocrResponse = await ekycAPI.ocrIdBack(imageHash, 3);

        setVerificationData((prev) => ({
          ...prev,
          backImageHash: imageHash,
          ocrData: { ...prev.ocrData, ...ocrResponse.object },
        }));

        setIsSuccess(true);
        setCurrentStep("result");
        toast.success("ID verification successful!");
      }
    } catch (err) {
      const stepNames: Record<string, string> = {
        front: "ID Front",
        back: "ID Back",
      };
      const stepName = stepNames[currentStep] || currentStep;

      let errorMessage = "An error occurred during processing";
      if (err instanceof Error) {
        errorMessage = err.message;
        if (errorMessage.startsWith("IDG-")) {
          switch (errorMessage) {
            case "IDG-00000001":
              errorMessage = `[${stepName}] Invalid image format. Please try with a clearer photo.`;
              break;
            case "IDG-00010102":
              errorMessage = `[${stepName}] The image is not a valid ID card. Please use a proper ID document.`;
              break;
            case "IDG-00010103":
              errorMessage = `[${stepName}] Unable to detect face in the image. Please ensure the ID photo is clear.`;
              break;
            case "IDG-00010104":
              errorMessage = `[${stepName}] Multiple faces detected. Please ensure only one face is in the image.`;
              break;
            default:
              errorMessage = `[${stepName}] Verification failed (${errorMessage}). Please try again.`;
          }
        } else {
          errorMessage = `[${stepName}] ${errorMessage}`;
        }
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = async () => {
    setIsProcessing(true);
    try {
      await userAPI.becomeStylist();
      router.push("/settings/stylist-verification/success");
    } catch {
      toast.error("Failed to complete registration. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="min-h-screen pt-32">
      <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Link
            href="/settings/stylist-verification"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors text-gray-200 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-dela-gothic text-2xl md:text-3xl">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400">
              Identity Verification
            </span>
          </h1>
        </motion.div>

        {/* Progress Steps */}
        {currentStep !== "result" && currentStep !== "processing" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-4"
          >
            {STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = step.id === currentStep;
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      isCompleted
                        ? "bg-green-500/20 border border-green-500/40"
                        : isCurrent
                        ? "bg-purple-500/20 border border-purple-500/40"
                        : "bg-white/5 border border-white/10"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <Icon className={`w-4 h-4 ${isCurrent ? "text-purple-400" : "text-gray-500"}`} />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        isCompleted ? "text-green-400" : isCurrent ? "text-purple-300" : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`w-12 h-0.5 mx-2 ${isCompleted ? "bg-green-500/50" : "bg-white/10"}`} />
                  )}
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {["front", "back"].includes(currentStep) && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
            >
              {/* Instructions Card */}
              <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {currentStep === "front" ? "Capture ID Front" : "Capture ID Back"}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {currentStep === "front"
                        ? "Position your CMND moi so the front side with your photo is clearly visible"
                        : "Now flip your CMND and capture the back side"}
                    </p>
                    {currentStep === "front" && (
                      <p className="text-xs text-amber-400/80 mt-2">
                        Only CMND moi is accepted. Other ID types will be rejected.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Camera/Preview */}
              <div className="max-w-2xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden bg-black/40 backdrop-blur-sm border border-white/10 aspect-[4/3]">
                {!capturedImage ? (
                  <>
                    <video
                      ref={videoRefCallback}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${!isCameraReady ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                    />
                    {isCameraLoading && !error && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <div className="text-center">
                          <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-3" />
                          <p className="text-gray-300 text-sm">Starting camera...</p>
                        </div>
                      </div>
                    )}
                    {isCameraReady && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="border-2 border-dashed border-white/30 rounded-xl w-72 h-44" />
                      </div>
                    )}
                  </>
                ) : (
                  <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                )}

                {error && !capturedImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                    <div className="text-center p-6 max-w-sm">
                      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                      <p className="text-red-300 text-sm mb-4">{error}</p>
                      <GlassButton onClick={() => { setError(null); startCamera(); }} size="sm">
                        <RotateCcw className="w-4 h-4" />
                        Retry Camera
                      </GlassButton>
                    </div>
                  </div>
                )}

                {error && capturedImage && !isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                    <div className="text-center p-6 max-w-sm">
                      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                      <p className="text-red-300 text-sm mb-4">{error}</p>
                      <div className="flex gap-3 justify-center">
                        <GlassButton onClick={retakePhoto} variant="secondary" size="sm">
                          <RotateCcw className="w-4 h-4" />
                          Retake
                        </GlassButton>
                        <GlassButton onClick={() => { setError(null); processStep(); }} size="sm">
                          <RotateCcw className="w-4 h-4" />
                          Retry
                        </GlassButton>
                      </div>
                    </div>
                  </div>
                )}

                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-3" />
                      <p className="text-gray-300">Processing...</p>
                    </div>
                  </div>
                )}
              </div>
              </div>

              <canvas ref={canvasRef} className="hidden" />
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4">
                {!capturedImage ? (
                  <>
                    <GlassButton onClick={() => fileInputRef.current?.click()} variant="secondary" size="lg">
                      <Upload className="w-5 h-5" />
                      Upload
                    </GlassButton>
                    <GlassButton
                      onClick={capturePhoto}
                      disabled={!isCameraReady || isCameraLoading}
                      size="lg"
                    >
                      <Camera className="w-5 h-5" />
                      {isCameraLoading ? "Loading..." : "Capture"}
                    </GlassButton>
                  </>
                ) : (
                  <>
                    <GlassButton onClick={retakePhoto} disabled={isProcessing} variant="secondary" size="lg">
                      <RotateCcw className="w-5 h-5" />
                      Retake
                    </GlassButton>
                    <GlassButton
                      onClick={processStep}
                      disabled={isProcessing}
                      variant="custom"
                      backgroundColor="rgba(34, 197, 94, 0.5)"
                      borderColor="rgba(34, 197, 94, 0.6)"
                      size="lg"
                    >
                      {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                      {isProcessing ? "Processing..." : "Confirm"}
                    </GlassButton>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Result View */}
          {currentStep === "result" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-center">
                {isSuccess ? (
                  <>
                    <div className="relative inline-flex mb-6">
                      <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-30" />
                      <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Verification Successful!</h2>
                    <p className="text-gray-400 mb-6">Your identity has been verified successfully.</p>

                    {verificationData.ocrData && (
                      <div className="text-left p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
                        <h3 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Verified Information
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {verificationData.ocrData.name && (
                            <div>
                              <span className="text-gray-500">Name</span>
                              <p className="text-white font-medium">{verificationData.ocrData.name}</p>
                            </div>
                          )}
                          {verificationData.ocrData.id && (
                            <div>
                              <span className="text-gray-500">ID Number</span>
                              <p className="text-white font-medium">{verificationData.ocrData.id}</p>
                            </div>
                          )}
                          {verificationData.ocrData.dob && (
                            <div>
                              <span className="text-gray-500">Date of Birth</span>
                              <p className="text-white font-medium">{verificationData.ocrData.dob}</p>
                            </div>
                          )}
                          {verificationData.ocrData.sex && (
                            <div>
                              <span className="text-gray-500">Gender</span>
                              <p className="text-white font-medium">{verificationData.ocrData.sex}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <GlassButton onClick={handleComplete} disabled={isProcessing} size="lg">
                      {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                      Complete Registration
                      <ArrowRight className="w-5 h-5" />
                    </GlassButton>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
                    <p className="text-gray-400 mb-6">{error || "Please try again."}</p>
                    <GlassButton
                      onClick={() => {
                        setCurrentStep("front");
                        setVerificationData({});
                        setCapturedImage(null);
                        setError(null);
                      }}
                      size="lg"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Try Again
                    </GlassButton>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
