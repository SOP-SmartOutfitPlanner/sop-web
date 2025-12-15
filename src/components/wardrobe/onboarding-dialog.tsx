"use client";

import { useState, useEffect, useRef } from "react";
import {
  Input as AntInput,
  Select as AntSelect,
  DatePicker,
  ConfigProvider,
  ColorPicker,
  Card,
  Tag,
  Spin,
  Empty,
} from "antd";
import dayjs from "dayjs";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Briefcase,
  MapPin,
  Calendar,
  User,
  X,
  Search,
  Plus,
  Palette,
  Heart,
  Upload,
  Edit2,
  UserCircle,
} from "lucide-react";
import { toast } from "sonner";

import GlassButton from "@/components/ui/glass-button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { userAPI } from "@/lib/api/user-api";
import { minioAPI } from "@/lib/api/minio-api";
import { cn } from "@/lib/utils";
import { useScrollLock } from "@/hooks/useScrollLock";
import { Image as AntImage } from "antd";
import { useAuthStore } from "@/store/auth-store";

// Import from extracted modules
import { STEPS, TOTAL_STEPS, MAX_COLORS, MAX_STYLES, LOCATION_API_BASE, COLOR_PRESETS } from "./onboarding-dialog/constants";
import type { OnboardingData, Province, District, Ward, Job, StyleOption } from "./onboarding-dialog/types";
import { validatePersonalInfo, validateColors, validateStyles, buildLocationString } from "./onboarding-dialog/helpers";
import { WelcomeStep, WhySopStep } from "./onboarding-dialog/steps";

const { TextArea } = AntInput;

// ========== Interfaces ==========
interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ========== Main Component ==========
export function OnboardingDialog({ open, onOpenChange }: OnboardingDialogProps) {
  // ===== Auth Store =====
  const { updateUser, setIsFirstTime } = useAuthStore();

  // ===== State Management =====
  const [currentStep, setCurrentStep] = useState<number>(STEPS.WELCOME);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);

  // Jobs & Styles state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [styles, setStyles] = useState<StyleOption[]>([]);
  const [loadingStyles, setLoadingStyles] = useState(false);
  const [jobSearchQuery, setJobSearchQuery] = useState("");
  const [styleSearchQuery, setStyleSearchQuery] = useState("");
  const [otherStyleInput, setOtherStyleInput] = useState("");

  // Location data state
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Full body image state
  const [fullBodyImagePreview, setFullBodyImagePreview] = useState<string | null>(null);
  const fullBodyInputRef = useRef<HTMLInputElement>(null);

  // Form data state
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
    tryOnImageUrl: "",
    tryOnImageFile: null,
  });

  // ===== Effects =====
useScrollLock(open);

  // Load jobs, styles, and provinces when dialog opens
  useEffect(() => {
    if (open) {
      loadJobs();
      loadStyles();
      loadProvinces();
    }
  }, [open]);

  // Debounced search for jobs - only triggers when jobSearchQuery changes
  useEffect(() => {
    if (!open) return;

    // Only run search if we're on the personal info step
    if (currentStep !== STEPS.PERSONAL_INFO) return;

    const debounceTimer = setTimeout(() => {
      // If search query is empty, reset to all jobs
      if (jobSearchQuery.trim() === '') {
        loadJobs();
      } else {
        loadJobs(jobSearchQuery);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
  }, [jobSearchQuery]);

  // Debounced search for styles
  useEffect(() => {
    if (!open || currentStep !== STEPS.STYLES) return;

    const debounceTimer = setTimeout(() => {
      // If search query is empty, reset to all styles
      if (styleSearchQuery.trim() === '') {
        loadStyles();
      } else {
        loadStyles(styleSearchQuery);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
  }, [styleSearchQuery]);

  // ===== API Functions =====
  // Load jobs when dialog opens or when reaching personal info step
  const loadJobs = async (search?: string) => {
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
    }
  };

  // Load styles when dialog opens or when reaching styles step
  const loadStyles = async (search?: string) => {
    setLoadingStyles(true);
    try {
      const params: { "take-all": boolean; search?: string } = { "take-all": true };
      if (search) {
        params.search = search;
      }
      const response = await userAPI.getStyles(params);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allStyles = (response as any).data.data;
      // Filter only SYSTEM styles
      const systemStyles = allStyles.filter((style: StyleOption) => style.createdBy === "SYSTEM");
      setStyles(systemStyles);
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
      const response = await fetch(`${LOCATION_API_BASE}/provinces?page=0&size=100`);
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
      const response = await fetch(`${LOCATION_API_BASE}/districts/${provinceId}?page=0&size=100`);
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
      const response = await fetch(`${LOCATION_API_BASE}/wards/${districtId}?page=0&size=100`);
      const data = await response.json();
      setWards(data.data || []);
    } catch (error) {
      console.error("Failed to load wards:", error);
      toast.error("Failed to load wards");
    } finally {
      setLoadingWards(false);
    }
  };

  // ===== Event Handlers =====
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

    const locationStr = buildLocationString(selectedProvince, selectedDistrict, selectedWard);

    setFormData({
      ...formData,
      ward: wardId,
      location: locationStr
    });
  };

  const handleNext = async () => {
    // Validate current step
    let validationError: string | null = null;

    if (currentStep === STEPS.PERSONAL_INFO) {
      validationError = validatePersonalInfo(formData);
    } else if (currentStep === STEPS.COLORS) {
      validationError = validateColors(formData);
    }

    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Load data for next step if needed
    if (currentStep === STEPS.PERSONAL_INFO && jobs.length === 0) {
      await loadJobs();
    }
    if (currentStep === STEPS.COLORS && styles.length === 0) {
      await loadStyles();
    }

    // Move to next step
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
      // Validate all required fields
      const personalInfoError = validatePersonalInfo(formData);
      const colorsError = validateColors(formData);
      const stylesError = validateStyles(formData);

      const validationError = personalInfoError || colorsError || stylesError;
      if (validationError) {
        toast.error(validationError);
        return;
      }

      // Upload and validate full body image if provided
      let uploadedTryOnImageUrl: string | undefined;
      if (formData.tryOnImageFile) {
        // Step 1: Upload to MinIO
        try {
          console.log("📤 Uploading full body image to MinIO...");
          uploadedTryOnImageUrl = await minioAPI.uploadImage(formData.tryOnImageFile);
          console.log("✅ Full body image uploaded successfully:", uploadedTryOnImageUrl);
        } catch (error) {
          console.error("Failed to upload full body image:", error);
          toast.error("Failed to upload full body image. Please try again.");
          setIsSubmitting(false);
          return;
        }

        // Step 2: Validate the image
        try {
          console.log("🔍 Validating full body image...");
          const validationResponse = await userAPI.validateFullBodyImage(uploadedTryOnImageUrl);

          if (!validationResponse.data.isValid) {
            console.warn("❌ Full body image validation failed:", validationResponse.data.message);
            toast.error(validationResponse.data.message || "Invalid full body image. Please upload a clear full body photo from head to toe.");
            setIsSubmitting(false);
            return;
          }
          console.log("✅ Full body image validated successfully");
        } catch (error) {
          console.error("Failed to validate full body image:", error);
          toast.error("Failed to validate full body image. Please try again.");
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare payload
      const payload = {
        preferedColor: formData.preferedColor,
        avoidedColor: formData.avoidedColor,
        gender: formData.gender === "Female" ? 1 : 0,
        location: formData.location,
        // Only send jobId if it's a system job, otherwise send otherJob
        jobId: formData.jobId || undefined,
        otherJob: formData.otherJob || undefined,
        dob: formData.dob,
        bio: formData.bio,
        styleIds: formData.styleIds,
        otherStyles: formData.otherStyles,
        tryOnImageUrl: uploadedTryOnImageUrl,
      };

      await userAPI.submitOnboarding(payload);

      // Update auth store with tryOnImageUrl if uploaded
      if (uploadedTryOnImageUrl) {
        updateUser({ tryOnImageUrl: uploadedTryOnImageUrl });
      }

      // Mark user as no longer first time
      setIsFirstTime(false);

      toast.success("Welcome to SOP! Your profile has been set up successfully.");
      onOpenChange(false);
    } catch (error) {
      console.error("Onboarding failed:", error);
      toast.error("Failed to complete onboarding. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleBenefit = (benefit: string) => {
    setSelectedBenefits((prev) =>
      prev.includes(benefit)
        ? prev.filter((b) => b !== benefit)
        : [...prev, benefit]
    );
  };

  const toggleStyle = (styleId: number) => {
    setFormData((prev) => {
      const isSelected = prev.styleIds.includes(styleId);

      // If deselecting, allow it
      if (isSelected) {
        return {
          ...prev,
          styleIds: prev.styleIds.filter((id) => id !== styleId)
        };
      }

      // If selecting, check maximum limit (total of styleIds + otherStyles)
      const totalSelected = prev.styleIds.length + prev.otherStyles.length;
      if (totalSelected >= MAX_STYLES) {
        toast.error(`Maximum ${MAX_STYLES} styles allowed`);
        return prev;
      }

      return {
        ...prev,
        styleIds: [...prev.styleIds, styleId]
      };
    });
  };

  // Full body image handlers
  const handleFullBodyImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and WEBP files are allowed");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setFullBodyImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Store file in form data
    setFormData((prev) => ({
      ...prev,
      tryOnImageFile: file,
    }));

    toast.success("Image selected successfully");
  };

  const handleRemoveFullBodyImage = () => {
    setFullBodyImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      tryOnImageFile: null,
      tryOnImageUrl: "",
    }));
    if (fullBodyInputRef.current) {
      fullBodyInputRef.current.value = "";
    }
  };

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  // ===== Render =====
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed h-full inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-hidden overscroll-none touch-none"
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
              {currentStep === STEPS.WELCOME && <WelcomeStep />}

              {/* Step 1: Why SOP */}
              {currentStep === STEPS.WHY_SOP && (
                <WhySopStep
                  selectedBenefits={selectedBenefits}
                  onToggleBenefit={toggleBenefit}
                />
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
                              styles={{ popup: { root: { backgroundColor: 'rgba(243, 244, 246, 0.95)' } } }}
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
                            Location <span className="text-red-500">*</span> <span className="text-sm text-gray-300">(Ward is optional)</span>
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
                              styles={{ popup: { root: { backgroundColor: 'rgba(243, 244, 246, 0.95)' } } }}
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
                              styles={{ popup: { root: { backgroundColor: 'rgba(243, 244, 246, 0.95)' } } }}
                            />
                            <AntSelect
                              placeholder="Select Ward (Optional)"
                              value={formData.ward || undefined}
                              onChange={handleWardChange}
                              loading={loadingWards}
                              disabled={!formData.district}
                              showSearch
                              allowClear
                              filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                              }
                              size="large"
                              className="w-full [&_.ant-select-selector]:!bg-gray-100/90 [&_.ant-select-selector]:!border-gray-300"
                              options={wards.map((ward) => ({
                                value: ward.id,
                                label: ward.name,
                              }))}
                              styles={{ popup: { root: { backgroundColor: 'rgba(243, 244, 246, 0.95)' } } }}
                            />
                          </div>
                        </div>

                        {/* Occupation */}
                        <div className="space-y-2">
                          <Label htmlFor="job" className="text-md font-semibold flex items-center gap-2 text-white">
                            <Briefcase className="w-4 h-4" />
                            Occupation <span className="text-red-500">*</span>
                            <span className="text-xs text-gray-300 font-normal">(Select or type your own)</span>
                          </Label>
                          <AntSelect
                            id="job"
                            value={(() => {
                              // If otherJob is set, always show it (custom job takes priority)
                              if (formData.otherJob) {
                                return `other:${formData.otherJob}`;
                              }
                              // If jobId is set and exists in system jobs, show it
                              if (formData.jobId && jobs.some(j => j.id === formData.jobId)) {
                                return formData.jobId;
                              }
                              // Otherwise show nothing
                              return undefined;
                            })()}
                            onChange={(value: string | number | undefined) => {
                              if (typeof value === 'string' && value.startsWith('other:')) {
                                // Custom value entered
                                const customJob = value.replace('other:', '');
                                setFormData({ ...formData, jobId: null, otherJob: customJob });
                              } else if (typeof value === 'number') {
                                // Existing job selected
                                setFormData({ ...formData, jobId: value, otherJob: '' });
                              } else {
                                // Cleared
                                setFormData({ ...formData, jobId: null, otherJob: '' });
                              }
                              setJobSearchQuery('');
                            }}
                            placeholder="Select or type your occupation"
                            className="w-full [&_.ant-select-selector]:!bg-gray-100/90 [&_.ant-select-selector]:!border-gray-300"
                            size="large"
                            showSearch
                            searchValue={jobSearchQuery}
                            onSearch={(value) => setJobSearchQuery(value)}
                            filterOption={(input, option) =>
                              (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                            }
                            allowClear
                            options={[
                              ...jobs.map((job) => ({ value: job.id, label: job.name })),
                              // Show custom job option if user is typing something not in the list
                              ...(jobSearchQuery && !jobs.some(j => j.name.toLowerCase() === jobSearchQuery.toLowerCase())
                                ? [{ value: `other:${jobSearchQuery}`, label: `"${jobSearchQuery}" (Custom)` }]
                                : []),
                              // Always show "Other" option if otherJob has a value (for display purposes)
                              ...(formData.otherJob && !jobSearchQuery
                                ? [{ value: `other:${formData.otherJob}`, label: formData.otherJob }]
                                : [])
                            ]}
                            styles={{ popup: { root: { backgroundColor: 'rgba(243, 244, 246, 0.95)' } } }}
                            notFoundContent={
                              <div className="p-2 text-gray-500 text-sm">
                                Type to add a custom occupation
                              </div>
                            }
                          />
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
                            {COLOR_PRESETS.map((preset) => (
                              <button
                                key={preset.name}
                                type="button"
                                onClick={() => {
                                  if (formData.preferedColor.includes(preset.color)) {
                                    setFormData({
                                      ...formData,
                                      preferedColor: formData.preferedColor.filter((c) => c !== preset.color)
                                    });
                                  } else {
                                    if (formData.preferedColor.length >= MAX_COLORS) {
                                      toast.error(`Maximum ${MAX_COLORS} preferred colors allowed`);
                                      return;
                                    }
                                    // Remove from avoided colors if it exists there
                                    setFormData({
                                      ...formData,
                                      preferedColor: [...formData.preferedColor, preset.color],
                                      avoidedColor: formData.avoidedColor.filter((c) => c !== preset.color)
                                    });
                                  }
                                }}
                                className={cn(
                                  "w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-110 shadow-sm",
                                  formData.preferedColor.includes(preset.color)
                                    ? "border-green-500 ring-2 ring-green-300"
                                    : "border-gray-300 hover:border-gray-400"
                                )}
                                style={{ backgroundColor: preset.color }}
                                title={preset.name}
                              >
                                {formData.preferedColor.includes(preset.color) && (
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
                                if (formData.preferedColor.length >= MAX_COLORS) {
                                  toast.error(`Maximum ${MAX_COLORS} preferred colors allowed`);
                                  return;
                                }
                                const colorName = color.toHexString();
                                if (!formData.preferedColor.includes(colorName)) {
                                  // Remove from avoided colors if it exists there
                                  setFormData({
                                    ...formData,
                                    preferedColor: [...formData.preferedColor, colorName],
                                    avoidedColor: formData.avoidedColor.filter((c) => c !== colorName)
                                  });
                                }
                              }}
                              size="large"
                            />
                            {formData.preferedColor.length >= MAX_COLORS && (
                              <p className="text-xs text-red-600 font-medium">Maximum limit reached ({MAX_COLORS}/{MAX_COLORS})</p>
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
                            <Label className="text-xl font-bold text-gray-800">
                              Avoided Colors <span className="text-red-500">*</span>
                            </Label>
                            <p className="text-sm text-gray-700 font-medium">Colors you prefer not to wear ({formData.avoidedColor.length} selected)</p>
                          </div>
                        </div>

                        {/* Color Presets */}
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-gray-700">Select colors:</p>
                          <div className="grid grid-cols-8 gap-2">
                            {COLOR_PRESETS.map((preset) => (
                              <button
                                key={preset.name}
                                type="button"
                                onClick={() => {
                                  if (formData.avoidedColor.includes(preset.color)) {
                                    setFormData({
                                      ...formData,
                                      avoidedColor: formData.avoidedColor.filter((c) => c !== preset.color)
                                    });
                                  } else {
                                    if (formData.avoidedColor.length >= MAX_COLORS) {
                                      toast.error(`Maximum ${MAX_COLORS} avoided colors allowed`);
                                      return;
                                    }
                                    // Remove from preferred colors if it exists there
                                    setFormData({
                                      ...formData,
                                      avoidedColor: [...formData.avoidedColor, preset.color],
                                      preferedColor: formData.preferedColor.filter((c) => c !== preset.color)
                                    });
                                  }
                                }}
                                className={cn(
                                  "w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-110 shadow-sm",
                                  formData.avoidedColor.includes(preset.color)
                                    ? "border-red-500 ring-2 ring-red-300"
                                    : "border-gray-300 hover:border-gray-400"
                                )}
                                style={{ backgroundColor: preset.color }}
                                title={preset.name}
                              >
                                {formData.avoidedColor.includes(preset.color) && (
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
                                if (formData.avoidedColor.length >= MAX_COLORS) {
                                  toast.error(`Maximum ${MAX_COLORS} avoided colors allowed`);
                                  return;
                                }
                                const colorName = color.toHexString();
                                if (!formData.avoidedColor.includes(colorName)) {
                                  // Remove from preferred colors if it exists there
                                  setFormData({
                                    ...formData,
                                    avoidedColor: [...formData.avoidedColor, colorName],
                                    preferedColor: formData.preferedColor.filter((c) => c !== colorName)
                                  });
                                }
                              }}
                              size="large"
                            />
                            {formData.avoidedColor.length >= MAX_COLORS && (
                              <p className="text-xs text-red-600 font-medium">Maximum limit reached ({MAX_COLORS}/{MAX_COLORS})</p>
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
                      <h2 className="font-dela-gothic text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
                        Choose Your Style
                      </h2>
                      <p className="font-bricolage text-lg text-gray-200">
                        Select at least one style or add your own <span className="text-red-500">*</span>
                      </p>
                    </div>

                    <ConfigProvider
                      theme={{
                        components: {
                          Card: {
                            colorBgContainer: 'rgba(255, 255, 255, 0.5)',
                            colorBorderSecondary: 'rgba(255, 255, 255, 0.6)',
                          },
                          Spin: {
                            colorPrimary: '#3b82f6',
                          },
                          Tag: {
                            colorBorder: 'rgba(255, 255, 255, 0.6)',
                          },
                          Input: {
                            colorBgContainer: 'rgba(255, 255, 255, 0.9)',
                            colorBorder: 'rgba(255, 255, 255, 0.6)',
                            colorPrimaryHover: '#3b82f6',
                            colorPrimary: '#3b82f6',
                          },
                        },
                      }}
                    >
                      <div className="space-y-4">
                        {/* Search Bar Row */}
                        <div className="flex items-center gap-4">
                          {/* Search Styles */}
                          <div className="flex-1">
                            <AntInput
                              size="large"
                              placeholder="Search styles... (e.g., Casual, Formal)"
                              prefix={<Search className="w-4 h-4 text-gray-400" />}
                              value={styleSearchQuery}
                              onChange={(e) => setStyleSearchQuery(e.target.value)}
                              allowClear
                              style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '12px',
                                border: '2px solid rgba(255, 255, 255, 0.6)',
                              }}
                              className="font-bricolage"
                            />
                          </div>

                          {/* Other Styles Input */}
                          <div className="flex-1 flex items-center gap-2">
                            <AntInput
                              size="large"
                              placeholder="Other styles (e.g., Minimalist, Bohemian)"
                              prefix={<Palette className="w-4 h-4 text-gray-400" />}
                              value={otherStyleInput}
                              onChange={(e) => setOtherStyleInput(e.target.value)}
                              onPressEnter={() => {
                                const trimmed = otherStyleInput.trim();
                                if (!trimmed) return;
                                if (formData.otherStyles.includes(trimmed)) {
                                  toast.error("This style is already added");
                                  return;
                                }
                                const totalSelected = formData.styleIds.length + formData.otherStyles.length;
                                if (totalSelected >= MAX_STYLES) {
                                  toast.error(`Maximum ${MAX_STYLES} styles allowed`);
                                  return;
                                }
                                setFormData({ ...formData, otherStyles: [...formData.otherStyles, trimmed] });
                                setOtherStyleInput("");
                              }}
                              style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '12px',
                                border: '2px solid rgba(255, 255, 255, 0.6)',
                              }}
                              className="font-bricolage"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const trimmed = otherStyleInput.trim();
                                if (!trimmed) return;
                                if (formData.otherStyles.includes(trimmed)) {
                                  toast.error("This style is already added");
                                  return;
                                }
                                const totalSelected = formData.styleIds.length + formData.otherStyles.length;
                                if (totalSelected >= MAX_STYLES) {
                                  toast.error(`Maximum ${MAX_STYLES} styles allowed`);
                                  return;
                                }
                                setFormData({ ...formData, otherStyles: [...formData.otherStyles, trimmed] });
                                setOtherStyleInput("");
                              }}
                              disabled={!otherStyleInput.trim()}
                              className={cn(
                                "px-4 py-2 rounded-lg transition-all duration-200",
                                "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600",
                                "text-white font-semibold shadow-md hover:shadow-lg",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                "flex items-center gap-2"
                              )}
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Selected Count Badge */}
                          {(formData.styleIds.length + formData.otherStyles.length) > 0 && (
                            <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-300/50 whitespace-nowrap">
                              <span className="text-sm font-semibold text-white font-bricolage">
                                {formData.styleIds.length + formData.otherStyles.length}/{MAX_STYLES} selected
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Style Cards Grid */}
                        {loadingStyles ? (
                          <div className="text-center py-12">
                            <Spin size="large" />
                            <p className="text-sm text-gray-200 mt-4 font-bricolage font-medium">Loading styles...</p>
                          </div>
                        ) : styles.length === 0 ? (
                          <div className="text-center py-12">
                            <Empty
                              description={
                                <span className="font-bricolage text-gray-200">
                                  No styles found matching &ldquo;{styleSearchQuery}&rdquo;
                                </span>
                              }
                            />
                          </div>
                        ) : (
                          <div
                            ref={scrollContainerRef}
                            className="grid grid-cols-4 gap-4 h-[420px] overflow-y-auto hide-scrollbar p-1"
                          >
                            {styles.map((style) => (
                              <Card
                                key={style.id}
                                hoverable
                                onClick={() => toggleStyle(style.id)}
                                className={cn(
                                  "style-card cursor-pointer transition-all duration-300",
                                  formData.styleIds.includes(style.id) && "ring-4 ring-blue-400"
                                )}
                                style={{
                                  background: formData.styleIds.includes(style.id)
                                    ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.4) 0%, rgba(59, 130, 246, 0.35) 50%, rgba(147, 197, 253, 0.4) 100%)'
                                    : 'rgba(255, 255, 255, 0.7)',
                                  backdropFilter: 'blur(8px)',
                                  borderRadius: '16px',
                                  border: formData.styleIds.includes(style.id)
                                    ? '3px solid #3b82f6'
                                    : '2px solid rgba(255, 255, 255, 0.7)',
                                  boxShadow: formData.styleIds.includes(style.id)
                                    ? '0 12px 32px rgba(59, 130, 246, 0.4), inset 0 2px 8px rgba(255, 255, 255, 0.4)'
                                    : '0 2px 8px rgba(0, 0, 0, 0.05)',
                                  transform: formData.styleIds.includes(style.id) ? 'scale(1.03)' : 'scale(1)',
                                  height: '130px',
                                  width: '100%',
                                }}
                                styles={{ body: { padding: '1.25rem', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' } }}
                              >
                                {formData.styleIds.includes(style.id) && (
                                  <div className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-xl animate-in zoom-in duration-300 ring-2 ring-white">
                                    <Check className="w-5 h-5 text-white" strokeWidth={3.5} />
                                  </div>
                                )}
                                <div className="space-y-2 text-left pr-8 flex-1 flex flex-col">
                                  <h3 className={cn(
                                    "font-bold text-sm font-bricolage leading-tight",
                                    formData.styleIds.includes(style.id) ? "text-white" : "text-gray-800"
                                  )}>
                                    {style.name}
                                  </h3>
                                  <p className={cn(
                                    "text-xs line-clamp-3 font-bricolage leading-relaxed flex-1",
                                    formData.styleIds.includes(style.id) ? "text-white font-medium" : "text-gray-600"
                                  )}>
                                    {style.description}
                                  </p>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}

                        {/* Other Styles Tags Display */}
                        {formData.otherStyles.length > 0 && (
                          <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
                            {formData.otherStyles.map((style, index) => (
                              <Tag
                                key={index}
                                closable
                                onClose={() => {
                                  setFormData({
                                    ...formData,
                                    otherStyles: formData.otherStyles.filter((_, i) => i !== index)
                                  });
                                }}
                                style={{
                                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                  borderColor: '#60a5fa',
                                  color: '#fff',
                                  padding: '6px 14px',
                                  fontSize: '14px',
                                  borderRadius: '8px',
                                  fontWeight: 500,
                                }}
                                className="font-bricolage"
                              >
                                {style}
                              </Tag>
                            ))}
                          </div>
                        )}
                      </div>
                    </ConfigProvider>
                  </div>
                </div>
              )}

              {/* Step 5: Full Body Image */}
              {currentStep === STEPS.FULL_BODY_IMAGE && (
                <div className="h-full flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="space-y-6 max-w-5xl mx-auto w-full">
                    <div className="text-center space-y-3">
                      <h2 className="font-dela-gothic text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
                        Add Your Full Body Photo
                      </h2>
                      <p className="font-bricolage text-lg text-gray-200">
                        Upload a full body photo for virtual try-on features <span className="text-gray-400">(Optional)</span>
                      </p>
                    </div>

                    {/* 2-Column Layout: Left = Upload, Right = Instructions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Left Column: Upload Image */}
                      <div className="flex flex-col items-center">
                        {/* Hidden file input */}
                        <input
                          ref={fullBodyInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleFullBodyImageSelect}
                          className="hidden"
                        />

                        {fullBodyImagePreview ? (
                          /* Image Preview */
                          <div className="relative rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl w-[280px] h-[380px]">
                            <AntImage.PreviewGroup>
                              <AntImage
                                src={fullBodyImagePreview}
                                alt="Full Body Preview"
                                style={{
                                  width: '280px',
                                  height: '380px',
                                  objectFit: 'cover',
                                  display: 'block',
                                }}
                                preview={{
                                  mask: (
                                    <div className="flex items-center justify-center">
                                      <span className="text-white font-bricolage font-medium">
                                        Preview
                                      </span>
                                    </div>
                                  ),
                                }}
                              />
                            </AntImage.PreviewGroup>

                            {/* Action buttons */}
                            <div className="absolute top-3 right-3 flex gap-2">
                              <button
                                type="button"
                                onClick={() => fullBodyInputRef.current?.click()}
                                className="w-10 h-10 rounded-lg bg-blue-500/90 hover:bg-blue-600 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                                title="Change image"
                              >
                                <Edit2 className="w-5 h-5 text-white" />
                              </button>
                              <button
                                type="button"
                                onClick={handleRemoveFullBodyImage}
                                className="w-10 h-10 rounded-lg bg-red-500/90 hover:bg-red-600 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                                title="Remove image"
                              >
                                <X className="w-5 h-5 text-white" />
                              </button>
                            </div>

                            {/* File info */}
                            {formData.tryOnImageFile && (
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 py-3">
                                <p className="text-sm text-white font-bricolage font-medium truncate">
                                  {formData.tryOnImageFile.name}
                                </p>
                                <p className="text-xs text-gray-300 font-bricolage mt-1">
                                  {(formData.tryOnImageFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Upload Area */
                          <div
                            onClick={() => fullBodyInputRef.current?.click()}
                            className="relative border-2 border-dashed rounded-2xl text-center transition-all duration-300 cursor-pointer border-gray-300 bg-white/10 hover:border-blue-400 hover:bg-white/20 backdrop-blur-sm shadow-lg p-8 w-[280px] h-[380px] flex flex-col items-center justify-center"
                          >
                            <div className="space-y-4">
                              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                                <UserCircle className="w-10 h-10 text-white" />
                              </div>

                              <div>
                                <p className="font-bricolage font-bold text-lg text-white">
                                  Upload Full Body Photo
                                </p>
                                <p className="font-bricolage text-sm text-gray-300 mt-2">
                                  Click to select or drag and drop
                                </p>
                                <p className="font-bricolage text-xs text-gray-400 mt-2">
                                  PNG, JPG, WEBP • Max 10MB
                                </p>
                              </div>

                              <button
                                type="button"
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-bricolage font-semibold shadow-md transition-all duration-200"
                              >
                                <Upload className="w-5 h-5 inline mr-2" />
                                Select Image
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column: Instructions */}
                      <div className="flex flex-col justify-center space-y-6">
                        {/* Tips Card */}
                        <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-white font-bricolage">Tips for best results</h3>
                          </div>
                          <ul className="space-y-3 font-bricolage">
                            <li className="flex items-start gap-3">
                              <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-blue-400 text-sm font-bold">1</span>
                              </span>
                              <span className="text-gray-200 text-sm">Stand in front of a <strong className="text-white">plain background</strong></span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-blue-400 text-sm font-bold">2</span>
                              </span>
                              <span className="text-gray-200 text-sm">Ensure your <strong className="text-white">full body is visible</strong> from head to toe</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-blue-400 text-sm font-bold">3</span>
                              </span>
                              <span className="text-gray-200 text-sm"><strong className="text-white">Good lighting</strong> helps with accurate try-on results</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-blue-400 text-sm font-bold">4</span>
                              </span>
                              <span className="text-gray-200 text-sm">Wear <strong className="text-white">fitted clothing</strong> for best virtual try-on</span>
                            </li>
                          </ul>
                        </div>

                        {/* Info Card */}
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/30 shadow-lg">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md flex-shrink-0">
                              <UserCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-white font-bold font-bricolage mb-1">Why do we need this?</h4>
                              <p className="text-gray-300 text-sm font-bricolage leading-relaxed">
                                This image is used for <strong className="text-white">virtual try-on</strong> features to preview how clothes look on you before making outfit decisions.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* File format info */}
                        <p className="text-xs text-gray-400 font-bricolage text-center md:text-left">
                          Supported formats: PNG, JPG, WEBP • Maximum file size: 10MB
                        </p>
                      </div>
                    </div>
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

                  {currentStep === STEPS.FULL_BODY_IMAGE ? (
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
        </div >
      </div >
    </>
  );
}
