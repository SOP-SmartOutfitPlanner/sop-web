"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import {
  Input as AntInput,
  Select as AntSelect,
  DatePicker,
  ConfigProvider,
  ColorPicker,
  Card,
  Spin,
  Empty,
  Tag,
} from "antd";
import dayjs from "dayjs";
import {
  Check,
  Briefcase,
  MapPin,
  Calendar,
  User,
  X,
  Search,
  Palette,
  Heart,
  Camera,
  Save,
  RotateCcw,
  Mail,
  FileText,
  Plus,
  Lock,
  KeyRound,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { FaCrown, FaShieldAlt } from "react-icons/fa";
import GlassButton from "@/components/ui/glass-button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { userAPI } from "@/lib/api/user-api";
import { minioAPI } from "@/lib/api/minio-api";
import type { UserProfileResponse, Job, StyleOption } from "@/types/user";

const { TextArea } = AntInput;

const MAX_COLORS = 8;
const MAX_STYLES = 5;
const LOCATION_API_BASE = "https://open.oapi.vn/location";

const COLOR_PRESETS = [
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
] as const;

const GENDER_OPTIONS = [
  { value: 0, label: "Male" },
  { value: 1, label: "Female" },
  { value: 2, label: "Other" },
];

// Navigation tabs
type ProfileTab = "basic" | "style" | "password";

// Location types
interface Province {
  id: string;
  name: string;
}

interface District {
  id: string;
  name: string;
}

interface Ward {
  id: string;
  name: string;
}

export function ProfileEditForm() {
  const { user, updateUser } = useAuthStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<ProfileTab>("basic");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [userData, setUserData] = useState<UserProfileResponse | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    bio: "",
    location: "",
    province: "",
    district: "",
    ward: "",
    dob: "",
    gender: 0,
    jobId: null as number | null,
    otherJob: "",
    preferedColor: [] as string[],
    avoidedColor: [] as string[],
    styleIds: [] as number[],
    otherStyles: [] as string[],
  });

  // Options from API
  const [jobs, setJobs] = useState<Job[]>([]);
  const [styles, setStyles] = useState<StyleOption[]>([]);
  const [loadingStyles, setLoadingStyles] = useState(false);
  const [styleSearchQuery, setStyleSearchQuery] = useState("");
  const [otherStyleInput, setOtherStyleInput] = useState("");

  // Location data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);

  // Password change state
  const [passwordMethod, setPasswordMethod] = useState<"current" | "otp">("current");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    otp: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpMaskedEmail, setOtpMaskedEmail] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Load provinces and parse existing location string
  const loadProvincesAndParseLocation = async (locationString?: string) => {
    setLoadingProvinces(true);
    try {
      const response = await fetch(`${LOCATION_API_BASE}/provinces?page=0&size=100`);
      const data = await response.json();
      const loadedProvinces: Province[] = data.data || [];
      setProvinces(loadedProvinces);

      // Parse location if exists
      // Format can be: "Province, District, Ward" OR "Ward, District, Province"
      // We try to detect which format by checking if first or last part matches a province
      if (locationString) {
        const parts = locationString.split(", ").map(p => p.trim());

        if (parts.length >= 1) {
          // Try to find province - check first part first (Province, District, Ward format)
          let provinceName = parts[0];
          let matchedProvince = loadedProvinces.find(p =>
            p.name.toLowerCase() === provinceName.toLowerCase()
          );

          // If not found, try last part (Ward, District, Province format)
          let formatIsProvinceFirst = true;
          if (!matchedProvince && parts.length > 1) {
            provinceName = parts[parts.length - 1];
            matchedProvince = loadedProvinces.find(p =>
              p.name.toLowerCase() === provinceName.toLowerCase()
            );
            formatIsProvinceFirst = false;
          }

          if (matchedProvince) {
            // Load districts for this province
            const districtsResponse = await fetch(`${LOCATION_API_BASE}/districts/${matchedProvince.id}?page=0&size=100`);
            const districtsData = await districtsResponse.json();
            const loadedDistricts: District[] = districtsData.data || [];
            setDistricts(loadedDistricts);

            let matchedDistrict: District | undefined;
            let matchedWard: Ward | undefined;

            if (parts.length >= 2) {
              // Get district name based on format
              const districtName = formatIsProvinceFirst
                ? parts[1] // Province, District, Ward
                : parts[parts.length - 2]; // Ward, District, Province

              matchedDistrict = loadedDistricts.find(d =>
                d.name.toLowerCase() === districtName.toLowerCase()
              );

              if (matchedDistrict && parts.length >= 3) {
                // Load wards for this district
                const wardsResponse = await fetch(`${LOCATION_API_BASE}/wards/${matchedDistrict.id}?page=0&size=100`);
                const wardsData = await wardsResponse.json();
                const loadedWards: Ward[] = wardsData.data || [];
                setWards(loadedWards);

                // Get ward name based on format
                const wardName = formatIsProvinceFirst
                  ? parts[2] // Province, District, Ward
                  : parts[0]; // Ward, District, Province

                matchedWard = loadedWards.find(w =>
                  w.name.toLowerCase() === wardName.toLowerCase()
                );
              }
            }

            // Update form data with parsed location IDs
            setFormData(prev => ({
              ...prev,
              province: matchedProvince.id,
              district: matchedDistrict?.id || "",
              ward: matchedWard?.id || "",
            }));
          }
        }
      }
    } catch (error) {
      console.error("Failed to load provinces:", error);
    } finally {
      setLoadingProvinces(false);
    }
  };

  // Load districts
  const loadDistricts = async (provinceId: string) => {
    setLoadingDistricts(true);
    try {
      const response = await fetch(`${LOCATION_API_BASE}/districts/${provinceId}?page=0&size=100`);
      const data = await response.json();
      setDistricts(data.data || []);
    } catch (error) {
      console.error("Failed to load districts:", error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Load wards
  const loadWards = async (districtId: string) => {
    setLoadingWards(true);
    try {
      const response = await fetch(`${LOCATION_API_BASE}/wards/${districtId}?page=0&size=100`);
      const data = await response.json();
      setWards(data.data || []);
    } catch (error) {
      console.error("Failed to load wards:", error);
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
        ? `${selectedProvince.name}, ${selectedDistrict.name}`
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

    // Build location string in format: "Province, District, Ward"
    let locationStr = '';
    if (selectedProvince && selectedDistrict && selectedWard) {
      locationStr = `${selectedProvince.name}, ${selectedDistrict.name}, ${selectedWard.name}`;
    } else if (selectedProvince && selectedDistrict) {
      locationStr = `${selectedProvince.name}, ${selectedDistrict.name}`;
    } else if (selectedProvince) {
      locationStr = selectedProvince.name;
    }

    setFormData({
      ...formData,
      ward: wardId,
      location: locationStr
    });
  };

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [profileResponse, jobsResponse, stylesResponse] = await Promise.all([
          userAPI.getUserProfile(),
          userAPI.getJobs({ "take-all": true }),
          userAPI.getStyles({ "take-all": true }),
        ]);

        const profile = profileResponse.data;
        setUserData(profile);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allJobs = (jobsResponse as any).data?.data || (jobsResponse as any).data || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allStyles = (stylesResponse as any).data?.data || (stylesResponse as any).data || [];

        const systemJobs = allJobs.filter((job: Job) => job.createdBy === "SYSTEM");
        const systemStyles = allStyles.filter((style: StyleOption) => style.createdBy === "SYSTEM");

        setJobs(systemJobs);
        setStyles(systemStyles);

        // Set form data
        // Check if jobId exists in system jobs list
        const isSystemJob = profile.jobId && systemJobs.some((j: Job) => j.id === profile.jobId);
        // If otherJob is set OR jobId is not a system job, treat as custom job
        const hasCustomJob = !!profile.otherJob || (profile.jobId && !isSystemJob);
        // For custom job display, use otherJob if set, otherwise use jobName from profile
        const customJobName = profile.otherJob || (hasCustomJob && profile.jobName ? profile.jobName : "");

        setFormData({
          displayName: profile.displayName || "",
          email: profile.email || "",
          bio: profile.bio || "",
          location: profile.location || "",
          province: "",
          district: "",
          ward: "",
          dob: profile.dob || "",
          gender: profile.gender ?? 0,
          jobId: hasCustomJob ? null : (profile.jobId || null),
          otherJob: customJobName,
          preferedColor: profile.preferedColor || [],
          avoidedColor: profile.avoidedColor || [],
          styleIds: profile.userStyles?.map((s) => s.styleId) || [],
          otherStyles: profile.otherStyles || [],
        });

        // Load provinces and parse existing location
        await loadProvincesAndParseLocation(profile.location);
      } catch (error) {
        console.error("Failed to load profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  // Search styles
  useEffect(() => {
    if (!styleSearchQuery.trim()) return;

    const searchStyles = async () => {
      setLoadingStyles(true);
      try {
        const response = await userAPI.getStyles({ "take-all": true, search: styleSearchQuery });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allStyles = (response as any).data?.data || (response as any).data || [];
        const systemStyles = allStyles.filter((style: StyleOption) => style.createdBy === "SYSTEM");
        setStyles(systemStyles);
      } catch (error) {
        console.error("Failed to search styles:", error);
      } finally {
        setLoadingStyles(false);
      }
    };

    const debounce = setTimeout(searchStyles, 300);
    return () => clearTimeout(debounce);
  }, [styleSearchQuery]);

  const toggleStyle = useCallback((styleId: number) => {
    setFormData((prev) => {
      const isSelected = prev.styleIds.includes(styleId);
      if (isSelected) {
        return { ...prev, styleIds: prev.styleIds.filter((id) => id !== styleId) };
      }
      const totalSelected = prev.styleIds.length + prev.otherStyles.length;
      if (totalSelected >= MAX_STYLES) {
        toast.error(`Maximum ${MAX_STYLES} styles allowed`);
        return prev;
      }
      return { ...prev, styleIds: [...prev.styleIds, styleId] };
    });
  }, []);

  const addOtherStyle = () => {
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
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG, and GIF files are allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setAvatarFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    if (!userData) return;
    setFormData({
      displayName: userData.displayName || "",
      email: userData.email || "",
      bio: userData.bio || "",
      location: userData.location || "",
      province: "",
      district: "",
      ward: "",
      dob: userData.dob || "",
      gender: userData.gender ?? 0,
      jobId: userData.jobId || null,
      otherJob: userData.otherJob || "",
      preferedColor: userData.preferedColor || [],
      avoidedColor: userData.avoidedColor || [],
      styleIds: userData.userStyles?.map((s) => s.styleId) || [],
      otherStyles: userData.otherStyles || [],
    });
    setAvatarPreview(null);
    setAvatarFile(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
    toast.info("Form reset to original values");
  };

  // OTP countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  // Password change handlers
  const handleRequestOtp = async () => {
    if (userData?.isLoginWithGoogle) {
      toast.error("Password change is not available for Google login accounts");
      return;
    }

    try {
      setIsChangingPassword(true);
      const response = await userAPI.initiatePasswordChangeOtp();
      setOtpSent(true);
      // Handle both string and object response formats
      const maskedEmail = typeof response.data === 'string'
        ? response.data
        : (response.data as { email?: string })?.email || '';
      setOtpMaskedEmail(maskedEmail);
      setOtpCountdown(300); // 5 minutes
      toast.success(response.message || "OTP sent to your email");
    } catch (error) {
      const message = (error as { message?: string })?.message || "Failed to send OTP";
      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleChangePasswordWithCurrent = async () => {
    if (userData?.isLoginWithGoogle) {
      toast.error("Password change is not available for Google login accounts");
      return;
    }

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    try {
      setIsChangingPassword(true);
      const response = await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });
      toast.success(response.message || "Password changed successfully");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "", otp: "" });
    } catch (error) {
      const message = (error as { message?: string })?.message || "Failed to change password";
      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleChangePasswordWithOtp = async () => {
    if (!passwordData.otp || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    try {
      setIsChangingPassword(true);
      const response = await userAPI.changePasswordWithOtp({
        otp: passwordData.otp,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });
      toast.success(response.message || "Password changed successfully");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "", otp: "" });
      setOtpSent(false);
      setOtpCountdown(0);
      setPasswordMethod("current");
    } catch (error) {
      const message = (error as { message?: string })?.message || "Failed to change password";
      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    if (!user?.id) return;

    try {
      setIsSaving(true);

      // Step 1: Upload avatar to MinIO if there's a new file
      let uploadedAvatarUrl: string | undefined;
      if (avatarFile) {
        try {
          console.log("📤 Uploading avatar to MinIO...");
          uploadedAvatarUrl = await minioAPI.uploadImage(avatarFile);
          console.log("✅ Avatar uploaded successfully, downloadUrl:", uploadedAvatarUrl);
        } catch (error) {
          console.error("Failed to upload avatar:", error);
          toast.error("Failed to upload avatar");
          setIsSaving(false);
          return;
        }
      }

      // Step 2: Prepare update data with the uploaded avatar URL
      const updateData = {
        displayName: formData.displayName !== userData?.displayName ? formData.displayName : undefined,
        dob: formData.dob || undefined,
        gender: formData.gender,
        location: formData.location || undefined,
        bio: formData.bio || undefined,
        jobId: formData.jobId || undefined,
        otherJob: formData.otherJob || undefined,
        preferedColor: formData.preferedColor,
        avoidedColor: formData.avoidedColor,
        styleIds: formData.styleIds,
        otherStyles: formData.otherStyles,
        // Only include avtUrl if we uploaded a new avatar
        ...(uploadedAvatarUrl && { avtUrl: uploadedAvatarUrl }),
      };

      console.log("📤 Sending profile update with data:", JSON.stringify(updateData, null, 2));

      // Step 3: Update profile via API
      const response = await userAPI.updateProfile(updateData);
      console.log("✅ Profile updated, response:", JSON.stringify(response.data, null, 2));

      // Step 4: Determine the final avatar URL to use
      // Priority: uploaded URL > response URL > existing URL
      const finalAvatarUrl = uploadedAvatarUrl || response.data?.avtUrl || userData?.avtUrl || null;
      console.log("🖼️ Final avatar URL:", finalAvatarUrl);

      // Step 5: Update local state with the new data
      setUserData((prev) => ({
        ...prev!,
        ...response.data,
        avtUrl: finalAvatarUrl,
      }));

      // Clear avatar upload state
      setAvatarPreview(null);
      setAvatarFile(null);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }

      // Step 6: Update auth store (this also updates localStorage)
      updateUser({
        displayName: response.data?.displayName || user?.displayName,
        avatar: finalAvatarUrl || user?.avatar,
        location: response.data?.location || user?.location,
      });
      console.log("💾 Updated auth store with avatar:", finalAvatarUrl);

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <User className="w-8 h-8 text-cyan-400" />
          </div>
        </div>
        <p className="text-gray-200 text-lg font-medium font-bricolage">Loading your profile...</p>
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        components: {
          Select: {
            optionActiveBg: "rgba(229, 231, 235, 0.6)",
            optionSelectedBg: "rgba(229, 231, 235, 0.8)",
          },
          Card: {
            colorBgContainer: "rgba(255, 255, 255, 0.5)",
            colorBorderSecondary: "rgba(255, 255, 255, 0.6)",
          },
          Spin: {
            colorPrimary: "#3b82f6",
          },
          Tag: {
            colorBorder: "rgba(255, 255, 255, 0.6)",
          },
          Input: {
            colorBgContainer: "rgba(255, 255, 255, 0.9)",
            colorBorder: "rgba(255, 255, 255, 0.6)",
            colorPrimaryHover: "#3b82f6",
            colorPrimary: "#3b82f6",
          },
        },
      }}
    >
      <div className="flex gap-6">
        {/* Left Column: Profile Card */}
        <div className="w-80 flex-shrink-0 animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl space-y-6 sticky top-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center text-center">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <div className="relative group mb-4">
                {userData?.isPremium ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 rounded-full blur-2xl opacity-60 animate-pulse" />
                    <div
                      className="absolute -inset-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 rounded-full opacity-50 animate-spin"
                      style={{ animationDuration: '4s' }}
                    />
                    <div className="relative bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 rounded-full p-[3px]">
                      <div className="w-28 h-28 rounded-full overflow-hidden">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                        ) : userData?.avtUrl ? (
                          <img src={userData.avtUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                            <span className="text-4xl font-bold text-white">
                              {formData.displayName?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Crown badge at top right */}
                    <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-500 flex items-center justify-center shadow-lg z-20 border-2 border-yellow-200">
                      <FaCrown className="w-4 h-4 text-white drop-shadow-sm" />
                    </div>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isSaving}
                      className="absolute bottom-0 right-0 w-9 h-9 rounded-full border-2 flex items-center justify-center hover:scale-110 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed z-20 bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-500 border-yellow-200"
                    >
                      <Camera className="w-4 h-4 text-white" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center overflow-hidden shadow-xl ring-4 ring-white/30">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                      ) : userData?.avtUrl ? (
                        <img src={userData.avtUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl font-bold text-white">
                          {formData.displayName?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isSaving}
                      className="absolute bottom-0 right-0 w-9 h-9 rounded-full border-2 flex items-center justify-center hover:scale-110 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed z-20 bg-gradient-to-r from-blue-500 to-cyan-500 border-white/50"
                    >
                      <Camera className="w-4 h-4 text-white" />
                    </button>
                  </>
                )}
              </div>

              <h2 className="text-xl font-bold text-white font-bricolage">
                {formData.displayName || "User"}
              </h2>

              <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-300">
                <Mail className="w-4 h-4" />
                <span className="truncate max-w-[180px]">{formData.email}</span>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                {userData?.isPremium && (
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 border border-yellow-400/30 rounded-full text-xs font-semibold">
                    <FaCrown className="w-3 h-3" />
                    Premium
                  </div>
                )}
                {userData?.isVerifiedEmail && (
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-green-500/20 text-green-300 border border-green-400/30 rounded-full text-xs font-semibold">
                    <FaShieldAlt className="w-3 h-3" />
                    Email Verified
                  </div>
                )}
                {userData?.isStylist && (
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-full text-xs font-semibold">
                    <Palette className="w-3 h-3" />
                    Stylist
                  </div>
                )}
              </div>
            </div>

            {formData.location && (
              <>
                <div className="border-t border-white/10" />
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{formData.location}</span>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="border-t border-white/10 pt-4 space-y-2">
              <button
                onClick={() => setActiveTab("basic")}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left",
                  activeTab === "basic"
                    ? "bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border border-blue-400/50 text-white"
                    : "bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
                )}
              >
                <User className="w-5 h-5" />
                <span className="font-semibold">Basic Information</span>
              </button>
              <button
                onClick={() => setActiveTab("style")}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left",
                  activeTab === "style"
                    ? "bg-gradient-to-r from-purple-500/30 to-indigo-500/30 border border-purple-400/50 text-white"
                    : "bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
                )}
              >
                <Palette className="w-5 h-5" />
                <span className="font-semibold">Style & Preference</span>
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left",
                  activeTab === "password"
                    ? "bg-gradient-to-r from-amber-500/30 to-orange-500/30 border border-amber-400/50 text-white"
                    : "bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
                )}
              >
                <Lock className="w-5 h-5" />
                <span className="font-semibold">Change Password</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Content based on active tab */}
        <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          {/* Basic Information Tab */}
          {activeTab === "basic" && (
            <>
              <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white font-bricolage">Basic Information</h2>
                    <p className="text-sm text-gray-300">Edit your profile details</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 font-bricolage">
                  {/* Display Name */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold flex items-center gap-2 text-gray-200">
                      <User className="w-4 h-4" />
                      Display Name
                    </Label>
                    <AntInput
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      placeholder="Your display name"
                      size="large"
                      maxLength={100}
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold flex items-center gap-2 text-gray-200">
                      <User className="w-4 h-4" />
                      Gender
                    </Label>
                    <AntSelect
                      value={formData.gender}
                      onChange={(value) => setFormData({ ...formData, gender: value })}
                      placeholder="Select gender"
                      className="w-full [&_.ant-select-selector]:!bg-white/90 [&_.ant-select-selector]:!border-white/50"
                      size="large"
                      options={GENDER_OPTIONS}
                      styles={{ popup: { root: { backgroundColor: "rgba(255, 255, 255, 0.95)" } } }}
                    />
                  </div>

                  {/* Date of Birth */}
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-sm font-semibold flex items-center gap-2 text-gray-200">
                      <Calendar className="w-4 h-4" />
                      Date of Birth
                    </Label>
                    <DatePicker
                      value={formData.dob ? dayjs(formData.dob) : null}
                      onChange={(date) => setFormData({ ...formData, dob: date ? date.format("YYYY-MM-DD") : "" })}
                      placeholder="Select date"
                      className="w-full"
                      size="large"
                      format="YYYY-MM-DD"
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                      disabledDate={(current) => current && current >= dayjs().startOf("day")}
                    />
                  </div>

                  {/* Occupation */}
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-sm font-semibold flex items-center gap-2 text-gray-200">
                      <Briefcase className="w-4 h-4" />
                      Occupation <span className="text-xs text-gray-400">(Select or type your own)</span>
                    </Label>
                    <AntSelect
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
                      }}
                      onSearch={(value) => {
                        // When user types something not in the list, prepare it as other
                        const matchingJob = jobs.find(job =>
                          job.name.toLowerCase() === value.toLowerCase()
                        );
                        if (!matchingJob && value.trim()) {
                          setFormData(prev => ({ ...prev, otherJob: value }));
                        }
                      }}
                      placeholder="Select or type your occupation"
                      className="w-full [&_.ant-select-selector]:!bg-white/90 [&_.ant-select-selector]:!border-white/50"
                      size="large"
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                      }
                      allowClear
                      options={[
                        ...jobs.map((job) => ({ value: job.id, label: job.name })),
                        // Always show "Other" option if otherJob has a value (for display purposes)
                        ...(formData.otherJob
                          ? [{ value: `other:${formData.otherJob}`, label: formData.otherJob }]
                          : [])
                      ]}
                      styles={{ popup: { root: { backgroundColor: "rgba(255, 255, 255, 0.95)" } } }}
                      notFoundContent={
                        <div className="p-2 text-gray-500 text-sm">
                          Type to add a custom occupation
                        </div>
                      }
                    />
                  </div>

                  {/* Location - Province/District/Ward */}
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-sm font-semibold flex items-center gap-2 text-gray-200">
                      <MapPin className="w-4 h-4" />
                      Location <span className="text-xs text-gray-400">(Ward is optional)</span>
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
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
                        className="w-full [&_.ant-select-selector]:!bg-white/90 [&_.ant-select-selector]:!border-white/50"
                        options={provinces.map((province) => ({
                          value: province.id,
                          label: province.name,
                        }))}
                        styles={{ popup: { root: { backgroundColor: "rgba(255, 255, 255, 0.95)" } } }}
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
                        className="w-full [&_.ant-select-selector]:!bg-white/90 [&_.ant-select-selector]:!border-white/50"
                        options={districts.map((district) => ({
                          value: district.id,
                          label: district.name,
                        }))}
                        styles={{ popup: { root: { backgroundColor: "rgba(255, 255, 255, 0.95)" } } }}
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
                        className="w-full [&_.ant-select-selector]:!bg-white/90 [&_.ant-select-selector]:!border-white/50"
                        options={wards.map((ward) => ({
                          value: ward.id,
                          label: ward.name,
                        }))}
                        styles={{ popup: { root: { backgroundColor: "rgba(255, 255, 255, 0.95)" } } }}
                      />
                    </div>
                  </div>

                  {/* Bio - Full Width */}
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-sm font-semibold flex items-center gap-2 text-gray-200">
                      <FileText className="w-4 h-4" />
                      About You
                    </Label>
                    <TextArea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      maxLength={500}
                      showCount
                      size="large"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        resize: "none",
                      }}
                      classNames={{
                        count: "!text-white",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <GlassButton
                  onClick={handleReset}
                  disabled={isSaving}
                  variant="custom"
                  backgroundColor="rgba(255, 255, 255, 0.3)"
                  borderColor="rgba(255, 255, 255, 0.5)"
                  textColor="#374151"
                  size="lg"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </GlassButton>

                <GlassButton
                  onClick={handleSubmit}
                  disabled={isSaving}
                  variant="custom"
                  backgroundColor="rgba(59, 130, 246, 0.6)"
                  borderColor="rgba(59, 130, 246, 0.8)"
                  textColor="white"
                  size="lg"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </GlassButton>
              </div>
            </>
          )}

          {/* Style & Preference Tab */}
          {activeTab === "style" && (
            <>
              {/* Color Preferences */}
              <div className="flex gap-4">
                {/* Preferred Colors Card */}
                <div className="flex-1 p-5 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl space-y-4 font-bricolage">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <Label className="text-base font-bold text-white">Preferred Colors</Label>
                      <p className="text-sm text-gray-300">Colors you love ({formData.preferedColor.length}/{MAX_COLORS})</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-200">Select colors:</p>
                    <div className="grid grid-cols-8 gap-2">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            if (formData.preferedColor.includes(preset.color)) {
                              setFormData({
                                ...formData,
                                preferedColor: formData.preferedColor.filter((c) => c !== preset.color),
                              });
                            } else {
                              if (formData.preferedColor.length >= MAX_COLORS) {
                                toast.error(`Maximum ${MAX_COLORS} preferred colors allowed`);
                                return;
                              }
                              setFormData({
                                ...formData,
                                preferedColor: [...formData.preferedColor, preset.color],
                                avoidedColor: formData.avoidedColor.filter((c) => c !== preset.color),
                              });
                            }
                          }}
                          className={cn(
                            "w-9 h-9 rounded-lg border-2 transition-all duration-200 hover:scale-110 shadow-sm",
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

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-200">Or add custom color:</p>
                    <div className="flex items-center gap-2">
                      <ColorPicker
                        disabledAlpha
                        format="hex"
                        onChangeComplete={(color) => {
                          if (formData.preferedColor.length >= MAX_COLORS) {
                            toast.error(`Maximum ${MAX_COLORS} preferred colors allowed`);
                            return;
                          }
                          const colorHex = color.toHexString();
                          if (!formData.preferedColor.includes(colorHex)) {
                            setFormData({
                              ...formData,
                              preferedColor: [...formData.preferedColor, colorHex],
                              avoidedColor: formData.avoidedColor.filter((c) => c !== colorHex),
                            });
                          }
                        }}
                        size="large"
                      />
                      {formData.preferedColor.length >= MAX_COLORS && (
                        <p className="text-xs text-red-600 font-medium">Maximum limit reached</p>
                      )}
                    </div>
                  </div>

                  {formData.preferedColor.some((c) => !COLOR_PRESETS.some((p) => p.color === c)) && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-200">Custom colors:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.preferedColor
                          .filter((c) => !COLOR_PRESETS.some((p) => p.color === c))
                          .map((colorHex) => (
                            <button
                              key={colorHex}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  preferedColor: formData.preferedColor.filter((c) => c !== colorHex),
                                });
                              }}
                              className="group relative w-9 h-9 rounded-lg border-2 border-green-500 ring-2 ring-green-300 shadow-sm hover:scale-110 transition-all duration-200"
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

                {/* Avoided Colors Card */}
                <div className="flex-1 p-5 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl space-y-4 font-bricolage">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-rose-500 rounded-xl flex items-center justify-center shadow-md">
                      <X className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <Label className="text-base font-bold text-white">Avoided Colors</Label>
                      <p className="text-sm text-gray-300">Colors you avoid ({formData.avoidedColor.length}/{MAX_COLORS})</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-200">Select colors:</p>
                    <div className="grid grid-cols-8 gap-2">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            if (formData.avoidedColor.includes(preset.color)) {
                              setFormData({
                                ...formData,
                                avoidedColor: formData.avoidedColor.filter((c) => c !== preset.color),
                              });
                            } else {
                              if (formData.avoidedColor.length >= MAX_COLORS) {
                                toast.error(`Maximum ${MAX_COLORS} avoided colors allowed`);
                                return;
                              }
                              setFormData({
                                ...formData,
                                avoidedColor: [...formData.avoidedColor, preset.color],
                                preferedColor: formData.preferedColor.filter((c) => c !== preset.color),
                              });
                            }
                          }}
                          className={cn(
                            "w-9 h-9 rounded-lg border-2 transition-all duration-200 hover:scale-110 shadow-sm",
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

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-200">Or add custom color:</p>
                    <div className="flex items-center gap-2">
                      <ColorPicker
                        disabledAlpha
                        format="hex"
                        onChangeComplete={(color) => {
                          if (formData.avoidedColor.length >= MAX_COLORS) {
                            toast.error(`Maximum ${MAX_COLORS} avoided colors allowed`);
                            return;
                          }
                          const colorHex = color.toHexString();
                          if (!formData.avoidedColor.includes(colorHex)) {
                            setFormData({
                              ...formData,
                              avoidedColor: [...formData.avoidedColor, colorHex],
                              preferedColor: formData.preferedColor.filter((c) => c !== colorHex),
                            });
                          }
                        }}
                        size="large"
                      />
                      {formData.avoidedColor.length >= MAX_COLORS && (
                        <p className="text-xs text-red-600 font-medium">Maximum limit reached</p>
                      )}
                    </div>
                  </div>

                  {formData.avoidedColor.some((c) => !COLOR_PRESETS.some((p) => p.color === c)) && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-200">Custom colors:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.avoidedColor
                          .filter((c) => !COLOR_PRESETS.some((p) => p.color === c))
                          .map((colorHex) => (
                            <button
                              key={colorHex}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  avoidedColor: formData.avoidedColor.filter((c) => c !== colorHex),
                                });
                              }}
                              className="group relative w-9 h-9 rounded-lg border-2 border-red-500 ring-2 ring-red-300 shadow-sm hover:scale-110 transition-all duration-200"
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

              {/* Style Preferences Card */}
              <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                      <Palette className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white font-bricolage">Style Preferences</h2>
                      <p className="text-sm text-gray-300">Select your aesthetic</p>
                    </div>
                  </div>
                  {(formData.styleIds.length + formData.otherStyles.length) > 0 && (
                    <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border border-blue-400/50">
                      <span className="text-sm font-semibold text-white">
                        {formData.styleIds.length + formData.otherStyles.length}/{MAX_STYLES}
                      </span>
                    </div>
                  )}
                </div>

                {/* Search and Other Style Input */}
                <div className="flex gap-3">
                  <AntInput
                    size="large"
                    placeholder="Search styles..."
                    prefix={<Search className="w-4 h-4 text-gray-400" />}
                    value={styleSearchQuery}
                    onChange={(e) => setStyleSearchQuery(e.target.value)}
                    allowClear
                    className="flex-1"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      borderRadius: "12px",
                    }}
                  />
                  <div className="flex-1 flex gap-2">
                    <AntInput
                      size="large"
                      placeholder="Add other style..."
                      prefix={<Palette className="w-4 h-4 text-gray-400" />}
                      value={otherStyleInput}
                      onChange={(e) => setOtherStyleInput(e.target.value)}
                      onPressEnter={addOtherStyle}
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        borderRadius: "12px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={addOtherStyle}
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
                </div>

                {/* Other Styles Tags */}
                {formData.otherStyles.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-white/10 border border-white/20">
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

                {/* Style Cards Grid */}
                {loadingStyles ? (
                  <div className="text-center py-8">
                    <Spin size="large" />
                  </div>
                ) : styles.length === 0 ? (
                  <Empty description="No styles found" />
                ) : (
                  <div
                    ref={scrollContainerRef}
                    data-lenis-prevent
                    className="max-h-[300px] overflow-y-scroll hide-scrollbar p-1"
                  >
                    <div className="grid grid-cols-2 gap-3 p-0.5">
                      {styles.map((style) => (
                        <Card
                          key={style.id}
                          hoverable
                          onClick={() => toggleStyle(style.id)}
                          className={cn(
                            "cursor-pointer transition-all duration-300",
                            formData.styleIds.includes(style.id) && "ring-3 ring-blue-400"
                          )}
                          style={{
                            background: formData.styleIds.includes(style.id)
                              ? "linear-gradient(135deg, rgba(96, 165, 250, 0.4) 0%, rgba(59, 130, 246, 0.35) 100%)"
                              : "rgba(255, 255, 255, 0.7)",
                            borderRadius: "12px",
                            border: formData.styleIds.includes(style.id)
                              ? "2px solid #3b82f6"
                              : "1px solid rgba(255, 255, 255, 0.7)",
                          }}
                          styles={{
                            body: { padding: "0.75rem", position: "relative" },
                          }}
                        >
                          {formData.styleIds.includes(style.id) && (
                            <div className="absolute top-1.5 right-1.5 w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </div>
                          )}
                          <h3
                            className={cn(
                              "font-semibold text-sm pr-6",
                              formData.styleIds.includes(style.id) ? "text-white" : "text-gray-800"
                            )}
                          >
                            {style.name}
                          </h3>
                          <p
                            className={cn(
                              "text-xs line-clamp-2 mt-1",
                              formData.styleIds.includes(style.id) ? "text-white/90" : "text-gray-500"
                            )}
                          >
                            {style.description}
                          </p>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <GlassButton
                  onClick={handleReset}
                  disabled={isSaving}
                  variant="custom"
                  backgroundColor="rgba(255, 255, 255, 0.3)"
                  borderColor="rgba(255, 255, 255, 0.5)"
                  textColor="#374151"
                  size="lg"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </GlassButton>

                <GlassButton
                  onClick={handleSubmit}
                  disabled={isSaving}
                  variant="custom"
                  backgroundColor="rgba(59, 130, 246, 0.6)"
                  borderColor="rgba(59, 130, 246, 0.8)"
                  textColor="white"
                  size="lg"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </GlassButton>
              </div>
            </>
          )}

          {/* Change Password Tab */}
          {activeTab === "password" && (
            <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-bricolage">Change Password</h2>
                  <p className="text-sm text-gray-300">Update your account password</p>
                </div>
              </div>

              {/* Google Login Warning */}
              {userData?.isLoginWithGoogle && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/20 border border-amber-500/40">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <p className="text-sm text-amber-200">
                    Password change is not available for accounts signed in with Google.
                  </p>
                </div>
              )}

              {!userData?.isLoginWithGoogle && (
                <>
                  {/* Method 1: With Current Password (Default) */}
                  {passwordMethod === "current" && (
                    <div className="space-y-4 font-bricolage">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold flex items-center gap-2 text-gray-200">
                          <Lock className="w-4 h-4" />
                          Current Password
                        </Label>
                        <AntInput.Password
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          placeholder="Enter current password"
                          size="large"
                          style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold flex items-center gap-2 text-gray-200">
                          <KeyRound className="w-4 h-4" />
                          New Password
                        </Label>
                        <AntInput.Password
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="Enter new password (min 6 characters)"
                          size="large"
                          style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold flex items-center gap-2 text-gray-200">
                          <KeyRound className="w-4 h-4" />
                          Confirm New Password
                        </Label>
                        <AntInput.Password
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          placeholder="Confirm new password"
                          size="large"
                          style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordMethod("otp");
                            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "", otp: "" });
                          }}
                          className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                        >
                          Forgot your password? Try another way
                        </button>
                        <GlassButton
                          onClick={handleChangePasswordWithCurrent}
                          disabled={isChangingPassword}
                          variant="custom"
                          backgroundColor="rgba(245, 158, 11, 0.6)"
                          borderColor="rgba(245, 158, 11, 0.8)"
                          textColor="white"
                          size="lg"
                        >
                          {isChangingPassword ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Lock className="w-5 h-5" />
                              Update Password
                            </>
                          )}
                        </GlassButton>
                      </div>
                    </div>
                  )}

                  {/* Method 2: With OTP */}
                  {passwordMethod === "otp" && (
                    <div className="space-y-4 font-bricolage">
                      {!otpSent ? (
                        <>
                          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                            <p className="text-sm text-blue-200">
                              We&apos;ll send a verification code to your email address. The code will expire in 5 minutes.
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => {
                                setPasswordMethod("current");
                                setOtpSent(false);
                                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "", otp: "" });
                              }}
                              className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                            >
                              Back to password method
                            </button>
                            <GlassButton
                              onClick={handleRequestOtp}
                              disabled={isChangingPassword}
                              variant="custom"
                              backgroundColor="rgba(59, 130, 246, 0.6)"
                              borderColor="rgba(59, 130, 246, 0.8)"
                              textColor="white"
                              size="lg"
                            >
                              {isChangingPassword ? (
                                <>
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Mail className="w-5 h-5" />
                                  Send OTP to Email
                                </>
                              )}
                            </GlassButton>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-green-200">
                                OTP sent to <span className="font-semibold">{otpMaskedEmail}</span>
                              </p>
                              {otpCountdown > 0 && (
                                <span className="text-sm font-mono text-green-300 bg-green-500/20 px-2 py-1 rounded">
                                  {formatCountdown(otpCountdown)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-sm font-semibold flex items-center gap-2 text-gray-200">
                              <ShieldCheck className="w-4 h-4" />
                              OTP Code
                            </Label>
                            <AntInput
                              value={passwordData.otp}
                              onChange={(e) => setPasswordData({ ...passwordData, otp: e.target.value })}
                              placeholder="Enter 6-digit OTP"
                              size="large"
                              maxLength={6}
                              style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-sm font-semibold flex items-center gap-2 text-gray-200">
                              <KeyRound className="w-4 h-4" />
                              New Password
                            </Label>
                            <AntInput.Password
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                              placeholder="Enter new password (min 6 characters)"
                              size="large"
                              style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-sm font-semibold flex items-center gap-2 text-gray-200">
                              <KeyRound className="w-4 h-4" />
                              Confirm New Password
                            </Label>
                            <AntInput.Password
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                              placeholder="Confirm new password"
                              size="large"
                              style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                            />
                          </div>

                          <div className="flex items-center justify-between pt-4">
                            <button
                              type="button"
                              onClick={handleRequestOtp}
                              disabled={isChangingPassword || otpCountdown > 0}
                              className="text-sm text-blue-400 hover:text-blue-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                              {otpCountdown > 0 ? `Resend OTP in ${formatCountdown(otpCountdown)}` : "Resend OTP"}
                            </button>
                            <GlassButton
                              onClick={handleChangePasswordWithOtp}
                              disabled={isChangingPassword}
                              variant="custom"
                              backgroundColor="rgba(245, 158, 11, 0.6)"
                              borderColor="rgba(245, 158, 11, 0.8)"
                              textColor="white"
                              size="lg"
                            >
                              {isChangingPassword ? (
                                <>
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                  Updating...
                                </>
                              ) : (
                                <>
                                  <Lock className="w-5 h-5" />
                                  Update Password
                                </>
                              )}
                            </GlassButton>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </ConfigProvider>
  );
}
