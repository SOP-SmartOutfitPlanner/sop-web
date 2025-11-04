"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import GlassButton from "@/components/ui/glass-button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { TagInput } from "./tag-input";
import { userAPI } from "@/lib/api/user-api";
import { toast } from "sonner";
import GlassCard from "@/components/ui/glass-card";
import { Input as AntInput, Select as AntSelect, DatePicker, ConfigProvider, ColorPicker } from "antd";
import dayjs from "dayjs";


const { TextArea } = AntInput;
import {
  Sparkles,
  Shirt,
  Palette,
  Heart,
  ChevronRight,
  ChevronLeft,
  Check,
  Briefcase,
  MapPin,
  Calendar,
  User,
  Wand2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface OnboardingData {
  preferedColor: string[];
  avoidedColor: string[];
  gender: string;
  location: string;
  province: string;
  district: string;
  ward: string;
  jobId: number | null;
  otherJob: string;
  dob: string;
  bio: string;
  styleIds: number[];
  otherStyles: string[];
}

interface Province {
  id: string;
  name: string;
  type: string;
}

interface District {
  id: string;
  name: string;
  provinceId: string;
  type: string;
}

interface Ward {
  id: string;
  name: string;
  districtId: string;
  type: string;
}

interface Job {
  id: number;
  name: string;
  description: string;
  createdBy?: string;
}

interface StyleOption {
  id: number;
  name: string;
  description: string;
}

const STEPS = {
  WELCOME: 0,
  WHY_SOP: 1,
  PERSONAL_INFO: 2,
  COLORS: 3,
  STYLES: 4,
} as const;

const TOTAL_STEPS = Object.keys(STEPS).length;

export function OnboardingDialog({ open, onOpenChange }: OnboardingDialogProps) {
  const [currentStep, setCurrentStep] = useState<number>(STEPS.WELCOME);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [styles, setStyles] = useState<StyleOption[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingStyles, setLoadingStyles] = useState(false);
  const [jobSearchQuery, setJobSearchQuery] = useState("");

  // Location data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Disable body scroll when dialog is open
  useEffect(() => {
    if (open) {
      // Save the current styles
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;

      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      // Disable scrolling and add padding to prevent layout shift
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      // Re-enable scrolling when dialog closes
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [open]);

  // Load jobs, styles, and provinces when dialog opens
  useEffect(() => {
    if (open) {
      loadJobs();
      loadStyles();
      loadProvinces();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Debounced search for jobs
  useEffect(() => {
    if (!open || currentStep !== STEPS.PERSONAL_INFO) return;

    const debounceTimer = setTimeout(() => {
      loadJobs(jobSearchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobSearchQuery]);

  const [formData, setFormData] = useState<OnboardingData>({
    preferedColor: [],
    avoidedColor: [],
    gender: "Male",
    location: "",
    province: "",
    district: "",
    ward: "",
    jobId: null,
    otherJob: "",
    dob: "",
    bio: "",
    styleIds: [],
    otherStyles: [],
  });

  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);

  // Load jobs when dialog opens or when reaching personal info step
  const loadJobs = async (search?: string) => {
    setLoadingJobs(true);
    try {
      const params: { "take-all": boolean; search?: string } = { "take-all": true };
      if (search) {
        params.search = search;
      }
      const response = await userAPI.getJobs(params);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allJobs = (response as any).data.data;
      // Filter only SYSTEM jobs
      const systemJobs = allJobs.filter((job: Job) => job.createdBy === "SYSTEM");
      setJobs(systemJobs);
    } catch (error) {
      console.error("Failed to load jobs:", error);
      toast.error("Failed to load job options");
    } finally {
      setLoadingJobs(false);
    }
  };

  // Load styles when dialog opens or when reaching styles step
  const loadStyles = async () => {
    if (styles.length > 0) return;
    setLoadingStyles(true);
    try {
      const response = await userAPI.getStyles({ "take-all": true });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setStyles((response as any).data.data);
    } catch (error) {
      console.error("Failed to load styles:", error);
      toast.error("Failed to load style options");
    } finally {
      setLoadingStyles(false);
    }
  };

  // Load provinces from Vietnam location API
  const loadProvinces = async () => {
    if (provinces.length > 0) return;
    setLoadingProvinces(true);
    try {
      const response = await fetch('https://open.oapi.vn/location/provinces?page=0&size=100');
      const data = await response.json();
      setProvinces(data.data || []);
    } catch (error) {
      console.error("Failed to load provinces:", error);
      toast.error("Failed to load provinces");
    } finally {
      setLoadingProvinces(false);
    }
  };

  // Load districts based on selected province
  const loadDistricts = async (provinceId: string) => {
    setLoadingDistricts(true);
    try {
      const response = await fetch(`https://open.oapi.vn/location/districts/${provinceId}?page=0&size=100`);
      const data = await response.json();
      setDistricts(data.data || []);
    } catch (error) {
      console.error("Failed to load districts:", error);
      toast.error("Failed to load districts");
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Load wards based on selected district
  const loadWards = async (districtId: string) => {
    setLoadingWards(true);
    try {
      const response = await fetch(`https://open.oapi.vn/location/wards/${districtId}?page=0&size=100`);
      const data = await response.json();
      setWards(data.data || []);
    } catch (error) {
      console.error("Failed to load wards:", error);
      toast.error("Failed to load wards");
    } finally {
      setLoadingWards(false);
    }
  };

  // Handle province change
  const handleProvinceChange = (provinceId: string) => {
    const selectedProvince = provinces.find(p => p.id === provinceId);
    setFormData({
      ...formData,
      province: provinceId,
      district: '',
      ward: '',
      location: selectedProvince?.name || ''
    });
    setDistricts([]);
    setWards([]);
    loadDistricts(provinceId);
  };

  // Handle district change
  const handleDistrictChange = (districtId: string) => {
    const selectedDistrict = districts.find(d => d.id === districtId);
    const selectedProvince = provinces.find(p => p.id === formData.province);
    setFormData({
      ...formData,
      district: districtId,
      ward: '',
      location: selectedDistrict && selectedProvince
        ? `${selectedDistrict.name}, ${selectedProvince.name}`
        : formData.location
    });
    setWards([]);
    loadWards(districtId);
  };

  // Handle ward change
  const handleWardChange = (wardId: string) => {
    const selectedWard = wards.find(w => w.id === wardId);
    const selectedDistrict = districts.find(d => d.id === formData.district);
    const selectedProvince = provinces.find(p => p.id === formData.province);
    setFormData({
      ...formData,
      ward: wardId,
      location: selectedWard && selectedDistrict && selectedProvince
        ? `${selectedWard.name}, ${selectedDistrict.name}, ${selectedProvince.name}`
        : formData.location
    });
  };

  const handleNext = async () => {
    // Validate PERSONAL_INFO step fields
    if (currentStep === STEPS.PERSONAL_INFO) {
      if (!formData.dob) {
        toast.error("Please select your date of birth");
        return;
      }
      // Validate that DOB is in the past
      if (dayjs(formData.dob).isAfter(dayjs().startOf('day')) || dayjs(formData.dob).isSame(dayjs().startOf('day'))) {
        toast.error("Date of birth must be in the past");
        return;
      }
      if (!formData.province || !formData.district || !formData.ward) {
        toast.error("Please select your complete location (Province, District, Ward)");
        return;
      }
      if (!formData.jobId) {
        toast.error("Please select your occupation");
        return;
      }
      if (!formData.bio || formData.bio.trim() === "") {
        toast.error("Please tell us about yourself");
        return;
      }
    }

    // Validate COLORS step
    if (currentStep === STEPS.COLORS) {
      if (formData.preferedColor.length === 0) {
        toast.error("Please add at least one preferred color");
        return;
      }
    }

    // Load jobs when needed
    if (currentStep === STEPS.PERSONAL_INFO && jobs.length === 0) {
      await loadJobs();
    }
    // Load styles when needed
    if (currentStep === STEPS.COLORS && styles.length === 0) {
      await loadStyles();
    }
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Validate required fields
      if (!formData.dob) {
        toast.error("Please select your date of birth");
        setIsSubmitting(false);
        return;
      }

      // Validate that DOB is in the past
      if (dayjs(formData.dob).isAfter(dayjs().startOf('day')) || dayjs(formData.dob).isSame(dayjs().startOf('day'))) {
        toast.error("Date of birth must be in the past");
        setIsSubmitting(false);
        return;
      }

      if (!formData.province || !formData.district || !formData.ward || !formData.location) {
        toast.error("Please select your complete location");
        setIsSubmitting(false);
        return;
      }

      if (!formData.jobId) {
        toast.error("Please select your occupation");
        setIsSubmitting(false);
        return;
      }

      if (!formData.bio || formData.bio.trim() === "") {
        toast.error("Please tell us about yourself");
        setIsSubmitting(false);
        return;
      }

      if (formData.preferedColor.length === 0) {
        toast.error("Please add at least one preferred color");
        setIsSubmitting(false);
        return;
      }

      if (formData.styleIds.length === 0 && formData.otherStyles.length === 0) {
        toast.error("Please select at least one style");
        setIsSubmitting(false);
        return;
      }

      // Convert gender to number (0 = Unknown/Male, 1 = Female)
      const genderValue = formData.gender === "Female" ? 1 : 0;

      const payload = {
        preferedColor: formData.preferedColor,
        avoidedColor: formData.avoidedColor,
        gender: genderValue,
        location: formData.location,
        jobId: formData.jobId || 1,
        otherJob: formData.otherJob,
        dob: formData.dob,
        bio: formData.bio,
        styleIds: formData.styleIds,
        otherStyles: formData.otherStyles,
      };

      await userAPI.submitOnboarding(payload);
      toast.success("Welcome to SOP! Your profile has been set up successfully.");
      onOpenChange(false);
    } catch (error) {
      console.error("Onboarding failed:", error);
      toast.error("Failed to complete onboarding. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStyle = (styleId: number) => {
    setFormData((prev) => ({
      ...prev,
      styleIds: prev.styleIds.includes(styleId)
        ? prev.styleIds.filter((id) => id !== styleId)
        : [...prev.styleIds, styleId],
    }));
  };

  const toggleBenefit = (benefit: string) => {
    setSelectedBenefits((prev) =>
      prev.includes(benefit)
        ? prev.filter((b) => b !== benefit)
        : [...prev, benefit]
    );
  };

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed h-full inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-hidden overscroll-none touch-none"
        onClick={() => onOpenChange(false)}
        style={{ position: 'fixed', inset: 0 }}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 pointer-events-none overflow-hidden">
        <div
          className="w-[1400px] max-w-[90vw] h-[85vh] rounded-3xl overflow-hidden shadow-2xl pointer-events-auto relative"
          onClick={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {/* Full Background Container with Glassmorphism */}
          <div className="absolute inset-0 bg-gradient-to-br bg-opacity-70 from-slate-900/50 via-blue-900/90 to-slate-900/50">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 -right-32 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 -left-32 w-[500px] h-[500px] bg-cyan-200/30 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 h-full flex flex-col">
            {/* Progress Bar */}
            {currentStep > STEPS.WELCOME && (
              <div className="px-12 pt-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-base font-semibold bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-200 bg-clip-text text-transparent transition-all duration-300 hover:scale-105">
                    Step {currentStep} of {TOTAL_STEPS - 1}
                  </span>
                  <span className="text-base font-semibold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent transition-all duration-300 hover:scale-110 inline-flex items-center gap-1">
                    <span className="animate-in zoom-in duration-300">{Math.round(progress)}%</span>
                  </span>
                </div>
                <div className="relative group">
                  <Progress value={progress} className="h-2.5 transition-all duration-700 ease-out" />
                  {/* Animated glow effect on progress bar */}
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400/0 via-cyan-400/50 to-blue-400/0 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Content Container  */}
            <div className="flex-1 px-12 py-6 overflow-hidden">
              {/* Step 0: Welcome */}
              {currentStep === STEPS.WELCOME && (
                <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                  <div className="text-center space-y-3 max-w-4xl">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 blur-2xl opacity-40 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
                      <div className="relative w-80 h-32 flex items-center justify-center" style={{
                        filter: 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.6)) drop-shadow(0 0 15px rgba(59, 130, 246, 0.4))'
                      }}>
                        <Image
                          src="/SOP-logo (2).png"
                          alt="SOP Logo"
                          width={200}
                          height={100}
                          priority
                        />
                      </div>
                    </div>

                    {/* Welcome Text */}
                    <div className="space-y-3">
                      <h1
                        className="font-dela-gothic text-4xl md:text-5xl lg:text-6xl leading-tight"
                      >
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
                          Welcome to
                        </span>
                        <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300">
                          Smart Outfit Planner
                        </span>
                      </h1>
                      <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-cyan-500 to-transparent rounded-full"></div>
                      <p className="font-bricolage text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
                        Let&apos;s set up your profile so our AI can create the perfect outfits for you
                      </p>
                    </div>

                    {/* Feature Cards - 2x2 Grid */}
                    <div className="grid grid-cols-4 gap-6 max-w-5xl mx-auto pt-6">
                      <GlassCard
                        padding="2rem"
                        borderRadius="20px"
                        className="hover:scale-105 transition-transform"
                        backgroundColor="rgba(255, 255, 255, 0.4)"
                        borderColor="rgba(255, 255, 255, 0.6)"
                        width="100%"
                      >
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <Wand2 className="w-7 h-7 text-white" />
                        </div>
                        <p className="text-base font-semibold text-gray-700">AI-Powered</p>
                      </GlassCard>

                      <GlassCard
                        padding="2rem"
                        borderRadius="20px"
                        className="hover:scale-105 transition-transform"
                        backgroundColor="rgba(255, 255, 255, 0.4)"
                        borderColor="rgba(255, 255, 255, 0.6)"
                        width="100%"
                      >
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <Shirt className="w-7 h-7 text-white" />
                        </div>
                        <p className="text-base font-semibold text-gray-700">Smart Wardrobe</p>
                      </GlassCard>

                      <GlassCard
                        padding="2rem"
                        borderRadius="20px"
                        className="hover:scale-105 transition-transform"
                        backgroundColor="rgba(255, 255, 255, 0.4)"
                        borderColor="rgba(255, 255, 255, 0.6)"
                        width="100%"
                      >
                        <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <Palette className="w-7 h-7 text-white" />
                        </div>
                        <p className="text-base font-semibold text-gray-700">Style Matching</p>
                      </GlassCard>

                      <GlassCard
                        padding="2rem"
                        borderRadius="20px"
                        className="hover:scale-105 transition-transform"
                        backgroundColor="rgba(255, 255, 255, 0.4)"
                        borderColor="rgba(255, 255, 255, 0.6)"
                        width="100%"
                      >
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <Heart className="w-7 h-7 text-white" />
                        </div>
                        <p className="text-base font-semibold text-gray-700">Personalized</p>
                      </GlassCard>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Why SOP */}
              {currentStep === STEPS.WHY_SOP && (
                <div className="h-full flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="space-y-8 max-w-6xl mx-auto w-full">
                    <div className="text-center space-y-3">
                      <h2 className="font-dela-gothic text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
                        What You Use SOP For?
                      </h2>
                      <p className="font-bricolage text-lg text-gray-200">Select what matters most to you (optional)</p>
                    </div>

                    {/* 2x2 Grid for Benefits */}
                    <div className="grid grid-cols-2 gap-6">
                      <button
                        type="button"
                        onClick={() => toggleBenefit("ai-recommendations")}
                        className="text-left"
                      >
                        <GlassCard
                          padding="2rem"
                          borderRadius="24px"
                          className={cn(
                            "hover:shadow-lg transition-all hover:scale-[1.02] duration-300 relative",
                            selectedBenefits.includes("ai-recommendations") && "ring-2 ring-blue-500 shadow-lg shadow-blue-200/50"
                          )}
                          backgroundColor={selectedBenefits.includes("ai-recommendations") ? "rgba(59, 130, 246, 0.15)" : "rgba(255, 255, 255, 0.4)"}
                          borderColor="rgba(255, 255, 255, 0.6)"
                          width="100%"
                        >
                          {selectedBenefits.includes("ai-recommendations") && (
                            <div className="absolute top-3 right-3 w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div className="flex items-start gap-4 h-full">
                            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center transition-transform duration-300 hover:rotate-12">
                              <Sparkles className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <h3 className={cn(
                                "font-bricolage text-xl font-semibold mb-2 transition-colors duration-300",
                                selectedBenefits.includes("ai-recommendations") ? "text-white" : "text-gray-800"
                              )}>AI-Powered Recommendations</h3>
                              <p className={cn(
                                "font-bricolage transition-colors duration-300",
                                selectedBenefits.includes("ai-recommendations") ? "text-white/90" : "text-gray-600"
                              )}>Get personalized outfit suggestions based on weather, occasion, and your personal style preferences.</p>
                            </div>
                          </div>
                        </GlassCard>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleBenefit("wardrobe-management")}
                        className="text-left"
                      >
                        <GlassCard
                          padding="2rem"
                          borderRadius="24px"
                          className={cn(
                            "hover:shadow-lg transition-all hover:scale-[1.02] duration-300 relative",
                            selectedBenefits.includes("wardrobe-management") && "ring-2 ring-blue-500 shadow-lg shadow-blue-200/50"
                          )}
                          backgroundColor={selectedBenefits.includes("wardrobe-management") ? "rgba(59, 130, 246, 0.15)" : "rgba(255, 255, 255, 0.4)"}
                          borderColor="rgba(255, 255, 255, 0.6)"
                          width="100%"
                        >
                          {selectedBenefits.includes("wardrobe-management") && (
                            <div className="absolute top-3 right-3 w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div className="flex items-start gap-4 h-full">
                            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center transition-transform duration-300 hover:rotate-12">
                              <Shirt className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <h3 className={cn(
                                "font-bricolage text-xl font-semibold mb-2 transition-colors duration-300",
                                selectedBenefits.includes("wardrobe-management") ? "text-white" : "text-gray-800"
                              )}>Smart Wardrobe Management</h3>
                              <p className={cn(
                                "font-bricolage transition-colors duration-300",
                                selectedBenefits.includes("wardrobe-management") ? "text-white/90" : "text-gray-600"
                              )}>Organize your clothes digitally, track what you wear, and discover new combinations you never thought of.</p>
                            </div>
                          </div>
                        </GlassCard>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleBenefit("style-profile")}
                        className="text-left"
                      >
                        <GlassCard
                          padding="2rem"
                          borderRadius="24px"
                          className={cn(
                            "hover:shadow-lg transition-all hover:scale-[1.02] duration-300 relative",
                            selectedBenefits.includes("style-profile") && "ring-2 ring-blue-500 shadow-lg shadow-blue-200/50"
                          )}
                          backgroundColor={selectedBenefits.includes("style-profile") ? "rgba(59, 130, 246, 0.15)" : "rgba(255, 255, 255, 0.4)"}
                          borderColor="rgba(255, 255, 255, 0.6)"
                          width="100%"
                        >
                          {selectedBenefits.includes("style-profile") && (
                            <div className="absolute top-3 right-3 w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div className="flex items-start gap-4 h-full">
                            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center transition-transform duration-300 hover:rotate-12">
                              <Heart className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <h3 className={cn(
                                "font-bricolage text-xl font-semibold mb-2 transition-colors duration-300",
                                selectedBenefits.includes("style-profile") ? "text-white" : "text-gray-800"
                              )}>Personalized Style Profile</h3>
                              <p className={cn(
                                "font-bricolage transition-colors duration-300",
                                selectedBenefits.includes("style-profile") ? "text-white/90" : "text-gray-600"
                              )}>Build a profile that reflects your unique taste, favorite colors, and lifestyle needs.</p>
                            </div>
                          </div>
                        </GlassCard>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleBenefit("save-time")}
                        className="text-left"
                      >
                        <GlassCard
                          padding="2rem"
                          borderRadius="24px"
                          className={cn(
                            "hover:shadow-lg transition-all hover:scale-[1.02] duration-300 relative",
                            selectedBenefits.includes("save-time") && "ring-2 ring-blue-500 shadow-lg shadow-blue-200/50"
                          )}
                          backgroundColor={selectedBenefits.includes("save-time") ? "rgba(59, 130, 246, 0.15)" : "rgba(255, 255, 255, 0.4)"}
                          borderColor="rgba(255, 255, 255, 0.6)"
                          width="100%"
                        >
                          {selectedBenefits.includes("save-time") && (
                            <div className="absolute top-3 right-3 w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div className="flex items-start gap-4 h-full">
                            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center transition-transform duration-300 hover:rotate-12">
                              <Wand2 className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <h3 className={cn(
                                "font-bricolage text-xl font-semibold mb-2 transition-colors duration-300",
                                selectedBenefits.includes("save-time") ? "text-white" : "text-gray-800"
                              )}>Save Time Every Morning</h3>
                              <p className={cn(
                                "font-bricolage transition-colors duration-300",
                                selectedBenefits.includes("save-time") ? "text-white/90" : "text-gray-600"
                              )}>No more staring at your closet wondering what to wear. Get instant outfit suggestions that work.</p>
                            </div>
                          </div>
                        </GlassCard>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Personal Info - Form Layout */}
              {currentStep === STEPS.PERSONAL_INFO && (
                <div className="h-full flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="space-y-6 max-w-4xl mx-auto w-full">
                    <div className="text-center space-y-3">
                      <h2 className="font-dela-gothic text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
                        Tell Us About Yourself
                      </h2>
                      <p className="font-bricolage text-lg text-gray-200">Help us understand you better</p>
                    </div>

                    <ConfigProvider
                      theme={{
                        components: {
                          Select: {
                            optionActiveBg: 'rgba(229, 231, 235, 0.6)',
                            optionSelectedBg: 'rgba(229, 231, 235, 0.8)',
                          },
                        },
                      }}
                    >
                      <div className="space-y-4 font-bricolage">
                        {/* Gender and DOB Row */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="gender" className="text-md font-semibold flex items-center gap-2 text-white">
                              <User className="w-4 h-4" />
                              Gender
                            </Label>
                            <AntSelect
                              id="gender"
                              value={formData.gender}
                              onChange={(value) => setFormData({ ...formData, gender: value })}
                              placeholder="Select gender"
                              className="w-full [&_.ant-select-selector]:!bg-gray-100/90 [&_.ant-select-selector]:!border-gray-300"
                              size="large"
                              options={[
                                { value: "Male", label: "Male" },
                                { value: "Female", label: "Female" },
                              ]}
                              dropdownStyle={{ backgroundColor: 'rgba(243, 244, 246, 0.95)' }}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="dob" className="text-md font-semibold flex items-center gap-2 text-white">
                              <Calendar className="w-4 h-4" />
                              Date of Birth <span className="text-red-500">*</span>
                            </Label>
                            <DatePicker
                              id="dob"
                              value={formData.dob ? dayjs(formData.dob) : null}
                              onChange={(date) => setFormData({ ...formData, dob: date ? date.format('YYYY-MM-DD') : '' })}
                              placeholder="Select date of birth"
                              className="w-full"
                              size="large"
                              format="YYYY-MM-DD"
                              style={{ backgroundColor: 'rgba(243, 244, 246, 0.9)' }}
                              disabledDate={(current) => {
                                // Disable all dates from today onwards
                                return current && current >= dayjs().startOf('day');
                              }}
                            />
                          </div>
                        </div>

                        {/* Location Row - Province, District, Ward */}
                        <div className="space-y-2">
                          <Label className="text-md font-semibold flex items-center gap-2 text-white">
                            <MapPin className="w-4 h-4" />
                            Location <span className="text-red-500">*</span>
                          </Label>
                          <div className="grid grid-cols-3 gap-4">
                            <AntSelect
                              placeholder="Select Province"
                              value={formData.province || undefined}
                              onChange={handleProvinceChange}
                              loading={loadingProvinces}
                              showSearch
                              filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                              }
                              size="large"
                              className="w-full [&_.ant-select-selector]:!bg-gray-100/90 [&_.ant-select-selector]:!border-gray-300"
                              options={provinces.map((province) => ({
                                value: province.id,
                                label: province.name,
                              }))}
                              dropdownStyle={{ backgroundColor: 'rgba(243, 244, 246, 0.95)' }}
                            />
                            <AntSelect
                              placeholder="Select District"
                              value={formData.district || undefined}
                              onChange={handleDistrictChange}
                              loading={loadingDistricts}
                              disabled={!formData.province}
                              showSearch
                              filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                              }
                              size="large"
                              className="w-full [&_.ant-select-selector]:!bg-gray-100/90 [&_.ant-select-selector]:!border-gray-300"
                              options={districts.map((district) => ({
                                value: district.id,
                                label: district.name,
                              }))}
                              dropdownStyle={{ backgroundColor: 'rgba(243, 244, 246, 0.95)' }}
                            />
                            <AntSelect
                              placeholder="Select Ward"
                              value={formData.ward || undefined}
                              onChange={handleWardChange}
                              loading={loadingWards}
                              disabled={!formData.district}
                              showSearch
                              filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                              }
                              size="large"
                              className="w-full [&_.ant-select-selector]:!bg-gray-100/90 [&_.ant-select-selector]:!border-gray-300"
                              options={wards.map((ward) => ({
                                value: ward.id,
                                label: ward.name,
                              }))}
                              dropdownStyle={{ backgroundColor: 'rgba(243, 244, 246, 0.95)' }}
                            />
                          </div>
                        </div>

                        {/* Occupation Row */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="job" className="text-md font-semibold flex items-center gap-2 text-white">
                              <Briefcase className="w-4 h-4" />
                              Occupation <span className="text-red-500">*</span>
                            </Label>
                            {loadingJobs ? (
                              <div className="text-sm text-gray-300">Loading jobs...</div>
                            ) : (
                              <AntSelect
                                id="job"
                                value={formData.jobId || undefined}
                                onChange={(value) => setFormData({ ...formData, jobId: value })}
                                placeholder="Select your occupation"
                                className="w-full [&_.ant-select-selector]:!bg-gray-100/90 [&_.ant-select-selector]:!border-gray-300"
                                size="large"
                                showSearch
                                onSearch={(value) => setJobSearchQuery(value)}
                                filterOption={false}
                                options={jobs.map((job) => ({
                                  value: job.id,
                                  label: job.name,
                                }))}
                                dropdownStyle={{ backgroundColor: 'rgba(243, 244, 246, 0.95)' }}
                              />
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="otherJob" className="text-md font-semibold text-white">
                              Specify Other Occupation (If not listed)
                            </Label>
                            <AntInput
                              id="otherJob"
                              placeholder="e.g., Software Engineer"
                              value={formData.otherJob}
                              onChange={(e) => setFormData({ ...formData, otherJob: e.target.value })}
                              size="large"
                              style={{ backgroundColor: 'rgba(243, 244, 246, 0.9)' }}
                            />
                          </div>
                        </div>

                        {/* Bio Row */}
                        <div className="space-y-2">
                          <Label htmlFor="bio" className="text-md font-semibold text-white">
                            About You <span className="text-red-500">*</span>
                          </Label>
                          <TextArea
                            id="bio"
                            placeholder="Tell us a bit about yourself, your lifestyle, and fashion preferences..."
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            rows={4}
                            size="large"
                            style={{
                              backgroundColor: 'rgba(243, 244, 246, 0.9)',
                              resize: 'none',
                              minHeight: '120px',
                              maxHeight: '120px'
                            }}
                          />
                        </div>
                      </div>
                    </ConfigProvider>
                  </div>
                </div>
              )}

              {/* Step 3: Colors - Single Row Layout */}
              {currentStep === STEPS.COLORS && (
                <div className="h-full flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-500 font-bricolage">
                  <div className="space-y-6 max-w-6xl mx-auto w-full">
                    <div className="text-center space-y-3">

                      <h2 className="font-dela-gothic text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
                        Your Color Palette
                      </h2>
                      <p className="font-bricolage text-lg text-gray-200">Choose colors that define your style</p>
                    </div>

                    <div className="flex gap-6 items-stretch">
                      {/* Preferred Colors */}
                      <div className="flex-1 flex flex-col p-8 rounded-3xl bg-white/50 backdrop-blur-md shadow-xl space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                            <Heart className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <Label className="text-xl font-bold text-gray-800">
                              Preferred Colors <span className="text-red-500">*</span>
                            </Label>
                            <p className="text-sm text-gray-700 font-medium">Colors you love to wear ({formData.preferedColor.length} selected)</p>
                          </div>
                        </div>

                        {/* Color Presets */}
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-gray-700">Select colors:</p>
                          <div className="grid grid-cols-8 gap-2">
                            {[
                              { name: "Red", color: "#EF4444" },
                              { name: "Pink", color: "#EC4899" },
                              { name: "Purple", color: "#A855F7" },
                              { name: "Blue", color: "#3B82F6" },
                              { name: "Cyan", color: "#06B6D4" },
                              { name: "Green", color: "#10B981" },
                              { name: "Yellow", color: "#F59E0B" },
                              { name: "Orange", color: "#F97316" },
                              { name: "Brown", color: "#92400E" },
                              { name: "Gray", color: "#6B7280" },
                              { name: "Black", color: "#1F2937" },
                              { name: "White", color: "#F9FAFB" },
                              { name: "Beige", color: "#D4C5B9" },
                              { name: "Navy", color: "#1E3A8A" },
                              { name: "Maroon", color: "#7C2D12" },
                              { name: "Olive", color: "#84CC16" },
                            ].map((preset) => (
                              <button
                                key={preset.name}
                                type="button"
                                onClick={() => {
                                  if (formData.preferedColor.includes(preset.name)) {
                                    setFormData({
                                      ...formData,
                                      preferedColor: formData.preferedColor.filter((c) => c !== preset.name)
                                    });
                                  } else {
                                    if (formData.preferedColor.length >= 8) {
                                      toast.error("Maximum 8 preferred colors allowed");
                                      return;
                                    }
                                    setFormData({
                                      ...formData,
                                      preferedColor: [...formData.preferedColor, preset.name]
                                    });
                                  }
                                }}
                                className={cn(
                                  "w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-110 shadow-sm",
                                  formData.preferedColor.includes(preset.name)
                                    ? "border-green-500 ring-2 ring-green-300"
                                    : "border-gray-300 hover:border-gray-400"
                                )}
                                style={{ backgroundColor: preset.color }}
                                title={preset.name}
                              >
                                {formData.preferedColor.includes(preset.name) && (
                                  <Check className="w-5 h-5 text-white drop-shadow-lg mx-auto" strokeWidth={3} />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Custom Color Input */}
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-700">Or add custom color:</p>
                          <div className="flex items-center gap-2">
                            <ColorPicker
                              disabledAlpha
                              format="hex"
                              onChangeComplete={(color) => {
                                if (formData.preferedColor.length >= 8) {
                                  toast.error("Maximum 8 preferred colors allowed");
                                  return;
                                }
                                const colorName = color.toHexString();
                                if (!formData.preferedColor.includes(colorName)) {
                                  setFormData({ ...formData, preferedColor: [...formData.preferedColor, colorName] });
                                }
                              }}
                              size="large"
                            />
                            {formData.preferedColor.length >= 8 && (
                              <p className="text-xs text-red-600 font-medium">Maximum limit reached (8/8)</p>
                            )}
                          </div>
                        </div>

                        {/* Custom Colors Display */}
                        {formData.preferedColor.some(c => c.startsWith('#')) && (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-gray-700">Custom colors:</p>
                            <div className="grid grid-cols-8 gap-2">
                              {formData.preferedColor.filter(c => c.startsWith('#')).map((colorHex) => (
                                <button
                                  key={colorHex}
                                  type="button"
                                  onClick={() => {
                                    setFormData({
                                      ...formData,
                                      preferedColor: formData.preferedColor.filter((c) => c !== colorHex)
                                    });
                                  }}
                                  className="group relative w-10 h-10 rounded-lg border-2 border-green-500 ring-2 ring-green-300 shadow-sm hover:scale-110 transition-all duration-200"
                                  style={{ backgroundColor: colorHex }}
                                  title={`${colorHex} (click to remove)`}
                                >
                                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 rounded-lg transition-opacity" />
                                  <X className="w-5 h-5 text-white drop-shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Avoided Colors */}
                      <div className="flex-1 flex flex-col p-8 rounded-3xl bg-white/50 backdrop-blur-md shadow-xl space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-rose-500 rounded-xl flex items-center justify-center shadow-md">
                            <X className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <Label className="text-xl font-bold text-gray-800">Avoided Colors</Label>
                            <p className="text-sm text-gray-700 font-medium">Colors you prefer not to wear ({formData.avoidedColor.length} selected)</p>
                          </div>
                        </div>

                        {/* Color Presets */}
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-gray-700">Select colors:</p>
                          <div className="grid grid-cols-8 gap-2">
                            {[
                              { name: "Red", color: "#EF4444" },
                              { name: "Pink", color: "#EC4899" },
                              { name: "Purple", color: "#A855F7" },
                              { name: "Blue", color: "#3B82F6" },
                              { name: "Cyan", color: "#06B6D4" },
                              { name: "Green", color: "#10B981" },
                              { name: "Yellow", color: "#F59E0B" },
                              { name: "Orange", color: "#F97316" },
                              { name: "Brown", color: "#92400E" },
                              { name: "Gray", color: "#6B7280" },
                              { name: "Black", color: "#1F2937" },
                              { name: "White", color: "#F9FAFB" },
                              { name: "Beige", color: "#D4C5B9" },
                              { name: "Navy", color: "#1E3A8A" },
                              { name: "Maroon", color: "#7C2D12" },
                              { name: "Olive", color: "#84CC16" },
                            ].map((preset) => (
                              <button
                                key={preset.name}
                                type="button"
                                onClick={() => {
                                  if (formData.avoidedColor.includes(preset.name)) {
                                    setFormData({
                                      ...formData,
                                      avoidedColor: formData.avoidedColor.filter((c) => c !== preset.name)
                                    });
                                  } else {
                                    if (formData.avoidedColor.length >= 8) {
                                      toast.error("Maximum 8 avoided colors allowed");
                                      return;
                                    }
                                    setFormData({
                                      ...formData,
                                      avoidedColor: [...formData.avoidedColor, preset.name]
                                    });
                                  }
                                }}
                                className={cn(
                                  "w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-110 shadow-sm",
                                  formData.avoidedColor.includes(preset.name)
                                    ? "border-red-500 ring-2 ring-red-300"
                                    : "border-gray-300 hover:border-gray-400"
                                )}
                                style={{ backgroundColor: preset.color }}
                                title={preset.name}
                              >
                                {formData.avoidedColor.includes(preset.name) && (
                                  <X className="w-5 h-5 text-white drop-shadow-lg mx-auto" strokeWidth={3} />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Custom Color Input */}
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-700">Or add custom color:</p>
                          <div className="flex items-center gap-2">
                            <ColorPicker
                              disabledAlpha
                              format="hex"
                              onChangeComplete={(color) => {
                                if (formData.avoidedColor.length >= 8) {
                                  toast.error("Maximum 8 avoided colors allowed");
                                  return;
                                }
                                const colorName = color.toHexString();
                                if (!formData.avoidedColor.includes(colorName)) {
                                  setFormData({ ...formData, avoidedColor: [...formData.avoidedColor, colorName] });
                                }
                              }}
                              size="large"
                            />
                            {formData.avoidedColor.length >= 8 && (
                              <p className="text-xs text-red-600 font-medium">Maximum limit reached (8/8)</p>
                            )}
                          </div>
                        </div>

                        {/* Custom Colors Display */}
                        {formData.avoidedColor.some(c => c.startsWith('#')) && (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-gray-700">Custom colors:</p>
                            <div className="grid grid-cols-8 gap-2">
                              {formData.avoidedColor.filter(c => c.startsWith('#')).map((colorHex) => (
                                <button
                                  key={colorHex}
                                  type="button"
                                  onClick={() => {
                                    setFormData({
                                      ...formData,
                                      avoidedColor: formData.avoidedColor.filter((c) => c !== colorHex)
                                    });
                                  }}
                                  className="group relative w-10 h-10 rounded-lg border-2 border-red-500 ring-2 ring-red-300 shadow-sm hover:scale-110 transition-all duration-200"
                                  style={{ backgroundColor: colorHex }}
                                  title={`${colorHex} (click to remove)`}
                                >
                                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 rounded-lg transition-opacity" />
                                  <X className="w-5 h-5 text-white drop-shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Styles */}
              {currentStep === STEPS.STYLES && (
                <div className="h-full flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="space-y-6 max-w-6xl mx-auto w-full">
                    <div className="text-center space-y-3">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="font-dela-gothic text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
                        Choose Your Style
                      </h2>
                      <p className="font-bricolage text-lg text-gray-200">Select styles that resonate with you</p>
                    </div>

                    <GlassCard
                      padding="2.5rem"
                      borderRadius="24px"
                      backgroundColor="rgba(255, 255, 255, 0.4)"
                      borderColor="rgba(255, 255, 255, 0.6)"
                      width="100%"
                      className="space-y-6"
                    >
                      {loadingStyles ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="text-sm text-gray-600 mt-3">Loading styles...</p>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-4 gap-4 max-h-[300px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                            {styles.map((style) => (
                              <button
                                key={style.id}
                                type="button"
                                onClick={() => toggleStyle(style.id)}
                                className={cn(
                                  "relative p-5 rounded-2xl border-2 transition-all duration-300 hover:scale-105 backdrop-blur-sm h-full",
                                  formData.styleIds.includes(style.id)
                                    ? "border-blue-500 bg-gradient-to-br from-blue-50/80 to-cyan-50/80 shadow-lg shadow-blue-200/50"
                                    : "border-white/60 bg-white/60 hover:border-blue-300 hover:shadow-md"
                                )}
                              >
                                {formData.styleIds.includes(style.id) && (
                                  <div className="absolute top-2 right-2 w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                                    <Check className="w-4 h-4 text-white" />
                                  </div>
                                )}
                                <div className="space-y-2 text-left">
                                  <h3 className="font-semibold text-gray-800 text-sm">{style.name}</h3>
                                  <p className="text-xs text-gray-600 line-clamp-2">{style.description}</p>
                                </div>
                              </button>
                            ))}
                          </div>

                          {/* Other Styles */}
                          <div className="pt-4 border-t border-gray-200/50 space-y-3">
                            <Label className="text-base font-semibold text-gray-800">Other Styles (Optional)</Label>
                            <p className="text-sm text-gray-600">Add any other styles not listed above</p>
                            <TagInput
                              value={formData.otherStyles}
                              onChange={(styles) => setFormData({ ...formData, otherStyles: styles })}
                              placeholder="e.g., Minimalist, Bohemian, Streetwear"
                            />
                          </div>
                        </>
                      )}
                    </GlassCard>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions - Glass Card with Buttons at Bottom Right */}
            <div className="px-12 pb-8">

              <div className="flex items-center justify-between">
                <div className="flex-1"></div>
                <div className="flex items-center gap-4">
                  {currentStep > STEPS.WELCOME && (
                    <GlassButton
                      onClick={handleBack}
                      disabled={isSubmitting}
                      variant="custom"
                      backgroundColor="rgba(255, 255, 255, 0.3)"
                      borderColor="rgba(255, 255, 255, 0.5)"
                      textColor="#374151"
                      size="lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Back
                    </GlassButton>
                  )}

                  {currentStep === STEPS.STYLES ? (
                    <GlassButton
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      variant="custom"
                      backgroundColor="rgba(59, 130, 246, 0.6)"
                      borderColor="rgba(59, 130, 246, 0.8)"
                      textColor="white"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Completing...
                        </>
                      ) : (
                        <>
                          Complete Setup
                          <Check className="w-5 h-5" />
                        </>
                      )}
                    </GlassButton>
                  ) : (
                    <GlassButton
                      onClick={handleNext}
                      variant="custom"
                      backgroundColor="rgba(59, 130, 246, 0.6)"
                      borderColor="rgba(59, 130, 246, 0.8)"
                      textColor="white"
                      size="lg"
                    >
                      {currentStep === STEPS.WELCOME ? "Get Started" : "Continue"}
                      <ChevronRight className="w-5 h-5" />
                    </GlassButton>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
