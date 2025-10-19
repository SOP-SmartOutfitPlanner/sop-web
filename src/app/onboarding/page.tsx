"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  User,
  Palette,
  Heart,
  Briefcase,
  ShoppingBag,
  Camera,
  Sparkles,
} from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import GlassButton from "@/components/ui/glass-button";
import { toast } from "sonner";
import { Gender, OnboardingRequest } from "@/types/user";
import { userAPI } from "@/lib/api/user-api";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [styleSearchQuery, setStyleSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<OnboardingRequest>({
    preferedColor: "#3b82f6",
    avoidedColor: "#ef4444",
    gender: 0,
    location: "",
    jobId: 0,
    dob: "",
    bio: "",
    styleIds: [],
  });

  // Mock data - replace with API calls
  const jobOptions = [
    { id: 1, name: "Software Developer" },
    { id: 2, name: "Designer" },
    { id: 3, name: "Marketing" },
    { id: 4, name: "Sales" },
    { id: 5, name: "Teacher" },
    { id: 6, name: "Healthcare" },
    { id: 7, name: "Finance" },
    { id: 8, name: "Student" },
    { id: 9, name: "Entrepreneur" },
    { id: 10, name: "Other" },
  ];

  const styleOptions = [
    { id: 1, name: "Casual", description: "Relaxed and comfortable everyday wear" },
    { id: 2, name: "Formal", description: "Professional and elegant attire" },
    { id: 3, name: "Sporty", description: "Athletic and active wear" },
    { id: 4, name: "Bohemian", description: "Free-spirited and artistic" },
    { id: 5, name: "Minimalist", description: "Clean, simple, and modern" },
    { id: 6, name: "Vintage", description: "Classic and retro-inspired" },
    { id: 7, name: "Streetwear", description: "Urban and trendy fashion" },
    { id: 8, name: "Preppy", description: "Classic collegiate style" },
    { id: 9, name: "Elegant", description: "Sophisticated and refined" },
    { id: 10, name: "Edgy", description: "Bold and unconventional" },
    { id: 11, name: "Romantic", description: "Soft and feminine" },
    { id: 12, name: "Athleisure", description: "Sporty meets casual" },
    { id: 13, name: "Grunge", description: "Alternative and rebellious" },
    { id: 14, name: "Chic", description: "Stylish and fashionable" },
    { id: 15, name: "Boho Chic", description: "Bohemian with modern twist" },
    { id: 16, name: "Classic", description: "Timeless and traditional" },
  ];

  const filteredStyleOptions = styleOptions.filter((style) =>
    style.name.toLowerCase().includes(styleSearchQuery.toLowerCase()) ||
    style.description.toLowerCase().includes(styleSearchQuery.toLowerCase())
  );

  const purposeOptions = [
    {
      id: "personal",
      title: "Personal Wardrobe",
      description: "Organize my clothes and get outfit suggestions",
      icon: User,
    },
    {
      id: "professional",
      title: "Professional Styling",
      description: "I'm a stylist helping clients",
      icon: Briefcase,
    },
    {
      id: "shopping",
      title: "Smart Shopping",
      description: "Make better purchase decisions",
      icon: ShoppingBag,
    },
    {
      id: "inspiration",
      title: "Style Inspiration",
      description: "Discover and save outfit ideas",
      icon: Camera,
    },
  ];

  const [selectedPurpose, setSelectedPurpose] = useState<string>("");

  const updateFormData = (field: keyof OnboardingRequest, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleStyle = (styleId: number) => {
    setFormData((prev) => {
      const currentStyles = prev.styleIds;
      const newStyles = currentStyles.includes(styleId)
        ? currentStyles.filter((id) => id !== styleId)
        : [...currentStyles, styleId];
      return { ...prev, styleIds: newStyles };
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const response = await userAPI.submitOnboarding(formData);

      if (response.statusCode === 200) {
        toast.success("Onboarding completed successfully!");
        
        router.push("/wardrobe");
      }
    } catch (error) {
      console.error("Error submitting onboarding:", error);
      
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to complete onboarding. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      title: "What brings you here?",
      component: (
        <div className="space-y-6">
          <h2 className="font-bricolage text-3xl font-bold text-white text-center mb-8">
            How will you use SOP?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {purposeOptions.map((purpose) => {
              const Icon = purpose.icon;
              return (
                <GlassCard
                  key={purpose.id}
                  padding="1.5rem"
                  blur="2px"
                  brightness={1.1}
                  glowColor={
                    selectedPurpose === purpose.id
                      ? "rgba(59, 130, 246, 0.8)"
                      : "rgba(255, 255, 255, 0.4)"
                  }
                  glowIntensity={8}
                  borderColor={
                    selectedPurpose === purpose.id
                      ? "rgba(59, 130, 246, 0.6)"
                      : "rgba(255, 255, 255, 0.3)"
                  }
                  borderWidth="2px"
                  displacementScale={30}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    selectedPurpose === purpose.id ? "bg-blue-500/60" : "bg-white/10"
                  }`}
                  onClick={() => setSelectedPurpose(purpose.id)}
                >
                  <div className="text-center space-y-3">
                    <Icon className="w-12 h-12 text-white mx-auto" />
                    <h3 className="font-bricolage text-lg font-semibold text-white">
                      {purpose.title}
                    </h3>
                    <p className="font-bricolage text-sm text-white/70">
                      {purpose.description}
                    </p>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      title: "Tell us about yourself",
      component: (
        <div className="space-y-6">
          <h2 className="font-bricolage text-3xl font-bold text-white text-center mb-8">
            Personal Information
          </h2>
          <div className="space-y-4 max-w-md mx-auto">
            {/* Gender */}
            <div>
              <label className="font-bricolage text-white text-sm mb-2 block">
                Gender
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 0, label: "Male" },
                  { value: 1, label: "Female" },
                ].map((option) => (
                  <GlassButton
                    key={option.value}
                    variant={formData.gender === option.value ? "primary" : "ghost"}
                    onClick={() => updateFormData("gender", option.value)}
                    borderRadius="12px"
                    blur="2px"
                    brightness={1.1}
                    backgroundColor={
                      formData.gender === option.value
                        ? "rgba(60, 16, 255, 1)"
                        : "rgba(255, 255, 255, 0.1)"
                    }
                    className="font-bricolage font-semibold"
                  >
                    {option.label}
                  </GlassButton>
                ))}
              </div>
            </div>

            {/* Job */}
            <div>
              <label className="font-bricolage text-white text-sm mb-2 block">
                Job
              </label>
              <select
                value={formData.jobId}
                onChange={(e) => updateFormData("jobId", Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white font-bricolage focus:outline-none focus:border-white/40 transition-all cursor-pointer appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 1rem center",
                }}
              >
                <option value={0} disabled>Select your job</option>
                {jobOptions.map((job) => (
                  <option key={job.id} value={job.id} className="bg-gray-800">
                    {job.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="font-bricolage text-white text-sm mb-2 block">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => updateFormData("dob", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white font-bricolage focus:outline-none focus:border-white/40 transition-all"
              />
            </div>

            {/* Location */}
            <div>
              <label className="font-bricolage text-white text-sm mb-2 block">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g., New York, USA"
                value={formData.location}
                onChange={(e) => updateFormData("location", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white placeholder-white/40 font-bricolage focus:outline-none focus:border-white/40 transition-all"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="font-bricolage text-white text-sm mb-2 block">
                Bio
              </label>
              <textarea
                placeholder="Tell us a bit about yourself..."
                value={formData.bio}
                onChange={(e) => updateFormData("bio", e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white placeholder-white/40 font-bricolage focus:outline-none focus:border-white/40 transition-all resize-none"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Color Preferences",
      component: (
        <div className="space-y-6">
          <h2 className="font-bricolage text-3xl font-bold text-white text-center mb-8">
            What colors do you love?
          </h2>
          <div className="space-y-8 max-w-md mx-auto">
            {/* Preferred Color */}
            <div>
              <label className="font-bricolage text-white text-sm mb-3 block flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Preferred Color
              </label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="color"
                    value={formData.preferedColor}
                    onChange={(e) => updateFormData("preferedColor", e.target.value)}
                    className="w-20 h-20 rounded-xl cursor-pointer border-2 border-white/30 bg-transparent"
                    style={{
                      WebkitAppearance: "none",
                      appearance: "none",
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{
                      backgroundColor: formData.preferedColor,
                      boxShadow: `0 0 20px ${formData.preferedColor}40`,
                    }}
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Pick a color or enter hex"
                    value={formData.preferedColor}
                    onChange={(e) => updateFormData("preferedColor", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white placeholder-white/40 font-bricolage focus:outline-none focus:border-white/40 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Avoided Color */}
            <div>
              <label className="font-bricolage text-white text-sm mb-3 block flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Color to Avoid (Optional)
              </label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="color"
                    value={formData.avoidedColor}
                    onChange={(e) => updateFormData("avoidedColor", e.target.value)}
                    className="w-20 h-20 rounded-xl cursor-pointer border-2 border-white/30 bg-transparent"
                    style={{
                      WebkitAppearance: "none",
                      appearance: "none",
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{
                      backgroundColor: formData.avoidedColor,
                      boxShadow: `0 0 20px ${formData.avoidedColor}40`,
                    }}
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Pick a color or enter hex"
                    value={formData.avoidedColor}
                    onChange={(e) => updateFormData("avoidedColor", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white placeholder-white/40 font-bricolage focus:outline-none focus:border-white/40 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Style Preferences",
      component: (
        <div className="space-y-6">
          <h2 className="font-bricolage text-3xl font-bold text-white text-center mb-4">
            Choose Your Styles
          </h2>
          <p className="font-bricolage text-white/70 text-center mb-4">
            Select all that match your style (you can choose multiple)
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-6">
            <input
              type="text"
              placeholder="Search styles..."
              value={styleSearchQuery}
              onChange={(e) => setStyleSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white placeholder-white/40 font-bricolage focus:outline-none focus:border-white/40 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto max-h-[300px] overflow-y-auto pr-2">
            {filteredStyleOptions.length > 0 ? (
              filteredStyleOptions.map((style) => {
                const isSelected = formData.styleIds.includes(style.id);
                return (
                  <GlassCard
                    key={style.id}
                    padding="1rem"
                    blur="2px"
                    brightness={1.1}
                    glowColor={
                      isSelected
                        ? "rgba(59, 130, 246, 0.8)"
                        : "rgba(255, 255, 255, 0.4)"
                    }
                    glowIntensity={6}
                    borderColor={
                      isSelected
                        ? "rgba(59, 130, 246, 0.6)"
                        : "rgba(255, 255, 255, 0.3)"
                    }
                    borderWidth="2px"
                    displacementScale={20}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      isSelected ? "bg-blue-500/60" : "bg-white/10"
                    }`}
                    onClick={() => toggleStyle(style.id)}
                  >
                    <div className="text-center space-y-2">
                      <Palette className="w-8 h-8 text-white mx-auto" />
                      <h3 className="font-bricolage text-sm font-semibold text-white">
                        {style.name}
                      </h3>
                      <p className="font-bricolage text-xs text-white/60">
                        {style.description}
                      </p>
                    </div>
                  </GlassCard>
                );
              })
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="font-bricolage text-white/50">No styles found</p>
              </div>
            )}
          </div>
          <p className="font-bricolage text-sm text-white/50 text-center mt-4">
            {formData.styleIds.length} style(s) selected
          </p>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    router.push("/wardrobe");
  };

  const canProceed = () => {
    if (currentStep === 0) return !!selectedPurpose;
    return true; // Other steps are optional
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#5490ff]">
      <div className="w-full max-w-4xl">
        <GlassCard
          blur="4px"
          brightness={1.15}
          glowColor="rgba(255, 255, 255, 0.6)"
          glowIntensity={10}
          borderColor="rgba(255, 255, 255, 0.3)"
          borderWidth="2px"
          displacementScale={50}
          padding="0"
          className="bg-white/10"
        >
          <div className="w-full p-12 flex flex-col min-h-[600px]">
            {/* Progress Indicator - Top of Card */}
            <div className="flex justify-center gap-2 mb-8">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? "w-12 bg-blue-500"
                      : index < currentStep
                      ? "w-8 bg-blue-400"
                      : "w-8 bg-white/20"
                  }`}
                />
              ))}
            </div>

            {/* Step Content - Flexible Space */}
            <div className="flex-1 flex flex-col justify-center">
              {steps[currentStep].component}
            </div>

            {/* Navigation Buttons - Bottom of Card */}
            <div className="flex justify-end gap-5 items-center mt-8">
              <GlassButton
                variant="ghost"
                onClick={currentStep === 0 ? handleSkip : handleBack}
                disabled={isSubmitting}
                borderRadius="100px"
                blur="2px"
                brightness={1.1}
                glowColor="rgba(255, 255, 255, 0.3)"
                glowIntensity={6}
                borderColor="rgba(255, 255, 255, 0.2)"
                borderWidth="2px"
                className="font-bricolage font-semibold"
              >
                {currentStep === 0 ? (
                  "Skip"
                ) : (
                  <>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </>
                )}
              </GlassButton>

              <GlassButton
                variant="primary"
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                borderRadius="100px"
                blur="2px"
                brightness={1.2}
                glowColor="rgba(0, 183, 255, 0.5)"
                glowIntensity={8}
                borderColor="rgba(255, 255, 255, 0.3)"
                borderWidth="2px"
                backgroundColor={
                  canProceed() && !isSubmitting 
                    ? "rgba(60, 16, 255, 1)" 
                    : "rgba(100, 100, 100, 0.5)"
                }
                displacementScale={10}
                className="font-bricolage font-semibold"
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : currentStep === steps.length - 1 ? (
                  "Complete Setup"
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}