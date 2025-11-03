"use client";

import { useState, useEffect } from "react";
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
  AlertCircle,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { OnboardingRequest, Job, StyleOption } from "@/types/user";
import { userAPI } from "@/lib/api/user-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Jobs state
  const [jobOptions, setJobOptions] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [jobSearchQuery, setJobSearchQuery] = useState("");
  const [newJobName, setNewJobName] = useState("");
  const [newJobDescription, setNewJobDescription] = useState("");
  const [showAddJob, setShowAddJob] = useState(false);

  // Styles state
  const [styleOptions, setStyleOptions] = useState<StyleOption[]>([]);
  const [isLoadingStyles, setIsLoadingStyles] = useState(true);
  const [styleSearchQuery, setStyleSearchQuery] = useState("");
  const [newStyleName, setNewStyleName] = useState("");
  const [newStyleDescription, setNewStyleDescription] = useState("");
  const [showAddStyle, setShowAddStyle] = useState(false);

  // Color state
  const [preferredColors, setPreferredColors] = useState<string[]>(["#3b82f6"]);
  const [avoidedColors, setAvoidedColors] = useState<string[]>(["#ef4444"]);
  const [newPreferredColor, setNewPreferredColor] = useState("#3b82f6");
  const [newAvoidedColor, setNewAvoidedColor] = useState("#ef4444");

  const [formData, setFormData] = useState<OnboardingRequest>({
    preferedColor: ["#3b82f6"],
    avoidedColor: ["#ef4444"],
    gender: 0,
    location: "",
    jobId: 0,
    dob: "",
    bio: "",
    styleIds: [],
  });

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoadingJobs(true);
        const response = await userAPI.getJobs({ "take-all": true });

        if (response.statusCode === 200) {
          const responseData = response.data as Job[] | { data: Job[] };
          const jobs = (responseData && typeof responseData === 'object' && 'data' in responseData)
            ? responseData.data
            : responseData;

          if (Array.isArray(jobs)) {
            setJobOptions(jobs);
          } else {
            setJobOptions([]);
          }
        } else {
          setJobOptions([]);
        }
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
        toast.error("Failed to load job options");
        setJobOptions([]);
      } finally {
        setIsLoadingJobs(false);
      }
    };

    fetchJobs();
  }, []);

  // Fetch styles from API
  useEffect(() => {
    const fetchStyles = async () => {
      try {
        setIsLoadingStyles(true);
        const response = await userAPI.getStyles({ "take-all": true });

        // Handle paginated response structure: response.data.data
        if (response.statusCode === 200) {
          // Check if response has pagination structure
          const responseData = response.data as StyleOption[] | { data: StyleOption[] };
          const styles = (responseData && typeof responseData === 'object' && 'data' in responseData)
            ? responseData.data
            : responseData;

          if (Array.isArray(styles)) {
            setStyleOptions(styles);
          } else {
            setStyleOptions([]);
          }
        } else {
          setStyleOptions([]);
        }
      } catch (error) {
        console.error("Failed to fetch styles:", error);
        toast.error("Failed to load style options");
        setStyleOptions([]);
      } finally {
        setIsLoadingStyles(false);
      }
    };

    fetchStyles();
  }, []);

  const filteredJobOptions = jobOptions.filter((job) =>
    job.name.toLowerCase().includes(jobSearchQuery.toLowerCase())
  );

  const filteredStyleOptions = styleOptions.filter((style) =>
    style.name.toLowerCase().includes(styleSearchQuery.toLowerCase()) ||
    style.description?.toLowerCase().includes(styleSearchQuery.toLowerCase())
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

  const updateFormData = (field: keyof OnboardingRequest, value: string | number | string[]) => {
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

  const addPreferredColor = () => {
    if (newPreferredColor && !preferredColors.includes(newPreferredColor)) {
      const updated = [...preferredColors, newPreferredColor];
      setPreferredColors(updated);
      updateFormData("preferedColor", updated);
    }
  };

  const removePreferredColor = (color: string) => {
    const updated = preferredColors.filter(c => c !== color);
    setPreferredColors(updated);
    updateFormData("preferedColor", updated);
  };

  const addAvoidedColor = () => {
    if (newAvoidedColor && !avoidedColors.includes(newAvoidedColor)) {
      const updated = [...avoidedColors, newAvoidedColor];
      setAvoidedColors(updated);
      updateFormData("avoidedColor", updated);
    }
  };

  const removeAvoidedColor = (color: string) => {
    const updated = avoidedColors.filter(c => c !== color);
    setAvoidedColors(updated);
    updateFormData("avoidedColor", updated);
  };

  const validateAge = (dob: string): boolean => {
    if (!dob) return false;
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  };

  const handleSubmit = async () => {
    // Validate age
    if (!validateAge(formData.dob)) {
      toast.error("You must be at least 18 years old to use this service");
      return;
    }

    try {
      setIsSubmitting(true);

      // Create new job if user entered one
      if (newJobName.trim() && !jobOptions.find(j => j.name.toLowerCase() === newJobName.toLowerCase())) {
        try {
          const jobResponse = await userAPI.createJob({
            name: newJobName,
            description: newJobDescription || `${newJobName} position`
          });
          if (jobResponse.statusCode === 200 || jobResponse.statusCode === 201) {
            formData.jobId = jobResponse.data.id;
            toast.success(`Job "${newJobName}" created successfully`);
          }
        } catch (error) {
          console.error("Failed to create job:", error);
          toast.error("Failed to create job");
          setIsSubmitting(false);
          return;
        }
      }

      // Create new styles if user entered any
      const newStyles = styleOptions.filter(s =>
        formData.styleIds.includes(s.id) && s.id < 0 // Temporary IDs are negative
      );

      for (const style of newStyles) {
        try {
          const styleResponse = await userAPI.createStyle({
            name: style.name,
            description: style.description
          });
          if (styleResponse.statusCode === 200 || styleResponse.statusCode === 201) {
            // Replace temporary ID with real ID
            const index = formData.styleIds.indexOf(style.id);
            formData.styleIds[index] = styleResponse.data.id;
          }
        } catch (error) {
          console.error(`Failed to create style "${style.name}":`, error);
        }
      }

      // Submit onboarding
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

  const handleAddCustomStyle = () => {
    if (newStyleName.trim()) {
      // Add with temporary negative ID
      const tempId = -(styleOptions.length + 1);
      const newStyle: StyleOption = {
        id: tempId,
        name: newStyleName,
        description: newStyleDescription || `Custom ${newStyleName} style`
      };
      setStyleOptions([...styleOptions, newStyle]);
      toggleStyle(tempId);
      setNewStyleName("");
      setNewStyleDescription("");
      setShowAddStyle(false);
      toast.success(`Style "${newStyleName}" will be created`);
    }
  };

  const steps = [
    {
      title: "What brings you here?",
      component: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-dela-gothic text-gray-900 mb-3">
              How will you use SOP?
            </h2>
            <p className="text-gray-600 font-bricolage">
              Choose the option that best describes your needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {purposeOptions.map((purpose) => {
              const Icon = purpose.icon;
              return (
                <button
                  key={purpose.id}
                  onClick={() => setSelectedPurpose(purpose.id)}
                  className={`p-6 rounded-2xl border-2 transition-all text-left hover:scale-105 ${
                    selectedPurpose === purpose.id
                      ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-200"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                  }`}
                >
                  <div className="space-y-3">
                    <Icon className={`w-10 h-10 ${
                      selectedPurpose === purpose.id ? "text-blue-600" : "text-gray-600"
                    }`} />
                    <h3 className="text-lg font-bricolage font-semibold text-gray-900">
                      {purpose.title}
                    </h3>
                    <p className="text-sm font-bricolage text-gray-600">
                      {purpose.description}
                    </p>
                  </div>
                </button>
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
          <div className="text-center mb-8">
            <h2 className="text-3xl font-dela-gothic text-gray-900 mb-3">
              Personal Information
            </h2>
            <p className="text-gray-600 font-bricolage">
              Help us personalize your experience
            </p>
          </div>
          <div className="space-y-4 max-w-md mx-auto">
            {/* Gender */}
            <div>
              <Label htmlFor="gender" className="font-bricolage mb-2">Gender</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 0, label: "Male" },
                  { value: 1, label: "Female" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateFormData("gender", option.value)}
                    className={`p-3 rounded-xl border-2 font-bricolage font-semibold transition-all ${
                      formData.gender === option.value
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:border-blue-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Job */}
            <div>
              <Label htmlFor="job" className="font-bricolage mb-2">Job</Label>
              {isLoadingJobs ? (
                <div className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 bg-gray-50 text-gray-500 font-bricolage">
                  Loading jobs...
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Search jobs..."
                    value={jobSearchQuery}
                    onChange={(e) => setJobSearchQuery(e.target.value)}
                    className="font-bricolage"
                  />
                  <select
                    id="job"
                    value={formData.jobId}
                    onChange={(e) => {
                      updateFormData("jobId", Number(e.target.value));
                      const selected = jobOptions.find(j => j.id === Number(e.target.value));
                      if (selected) {
                        setJobSearchQuery(selected.name);
                        setNewJobName("");
                        setNewJobDescription("");
                        setShowAddJob(false);
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 bg-white text-gray-700 font-bricolage focus:outline-none focus:border-blue-500 transition-all cursor-pointer max-h-40"
                  >
                    <option value={0} disabled>Select your job</option>
                    {filteredJobOptions.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.name}
                      </option>
                    ))}
                  </select>

                  {!showAddJob ? (
                    <Button
                      onClick={() => setShowAddJob(true)}
                      variant="outline"
                      className="w-full font-bricolage"
                      type="button"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Custom Job
                    </Button>
                  ) : (
                    <div className="p-4 border-2 border-blue-300 rounded-xl bg-blue-50 space-y-3">
                      <Input
                        type="text"
                        placeholder="Job title"
                        value={newJobName}
                        onChange={(e) => setNewJobName(e.target.value)}
                        className="font-bricolage"
                      />
                      <Input
                        type="text"
                        placeholder="Job description (optional)"
                        value={newJobDescription}
                        onChange={(e) => setNewJobDescription(e.target.value)}
                        className="font-bricolage"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            if (newJobName.trim()) {
                              updateFormData("jobId", 0);
                              toast.success(`Job "${newJobName}" will be created`);
                            }
                          }}
                          size="sm"
                          className="font-bricolage flex-1"
                          type="button"
                        >
                          Confirm
                        </Button>
                        <Button
                          onClick={() => {
                            setShowAddJob(false);
                            setNewJobName("");
                            setNewJobDescription("");
                          }}
                          variant="outline"
                          size="sm"
                          className="font-bricolage"
                          type="button"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {newJobName && !jobOptions.find(j => j.name.toLowerCase() === newJobName.toLowerCase()) && (
                    <p className="text-sm text-blue-600 font-bricolage">
                      New job &quot;{newJobName}&quot; will be created
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <Label htmlFor="dob" className="font-bricolage mb-2">
                Date of Birth <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">(Must be 18+)</span>
              </Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) => updateFormData("dob", e.target.value)}
                className="font-bricolage"
                max={new Date().toISOString().split('T')[0]}
              />
              {formData.dob && !validateAge(formData.dob) && (
                <p className="text-sm text-red-600 font-bricolage mt-1">
                  You must be at least 18 years old
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location" className="font-bricolage mb-2">
                Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                type="text"
                placeholder="e.g., New York, USA"
                value={formData.location}
                onChange={(e) => updateFormData("location", e.target.value)}
                className="font-bricolage"
              />
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio" className="font-bricolage mb-2">Bio (Optional)</Label>
              <Textarea
                id="bio"
                placeholder="Tell us a bit about yourself..."
                value={formData.bio}
                onChange={(e) => updateFormData("bio", e.target.value)}
                rows={3}
                className="font-bricolage resize-none"
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
          <div className="text-center mb-8">
            <h2 className="text-3xl font-dela-gothic text-gray-900 mb-3">
              What colors do you love?
            </h2>
            <p className="text-gray-600 font-bricolage">
              Add multiple colors you prefer and want to avoid
            </p>
          </div>
          <div className="space-y-8 max-w-2xl mx-auto">
            {/* Preferred Colors */}
            <div>
              <Label className="font-bricolage mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-blue-600" />
                Preferred Colors
              </Label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 p-3 border-2 border-gray-200 rounded-xl min-h-[60px]">
                  {preferredColors.map((color, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-gray-300 bg-white"
                    >
                      <div
                        className="w-6 h-6 rounded-md border border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm font-bricolage">{color}</span>
                      <button
                        onClick={() => removePreferredColor(color)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={newPreferredColor}
                    onChange={(e) => setNewPreferredColor(e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                  />
                  <Input
                    type="text"
                    placeholder="Enter hex code"
                    value={newPreferredColor}
                    onChange={(e) => setNewPreferredColor(e.target.value)}
                    className="font-bricolage flex-1"
                  />
                  <Button
                    onClick={addPreferredColor}
                    variant="outline"
                    size="icon"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Avoided Colors */}
            <div>
              <Label className="font-bricolage mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Colors to Avoid
              </Label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 p-3 border-2 border-gray-200 rounded-xl min-h-[60px]">
                  {avoidedColors.map((color, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-gray-300 bg-white"
                    >
                      <div
                        className="w-6 h-6 rounded-md border border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm font-bricolage">{color}</span>
                      <button
                        onClick={() => removeAvoidedColor(color)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={newAvoidedColor}
                    onChange={(e) => setNewAvoidedColor(e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                  />
                  <Input
                    type="text"
                    placeholder="Enter hex code"
                    value={newAvoidedColor}
                    onChange={(e) => setNewAvoidedColor(e.target.value)}
                    className="font-bricolage flex-1"
                  />
                  <Button
                    onClick={addAvoidedColor}
                    variant="outline"
                    size="icon"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
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
          <div className="text-center mb-6">
            <h2 className="text-3xl font-dela-gothic text-gray-900 mb-3">
              Choose Your Styles
            </h2>
            <p className="text-gray-600 font-bricolage">
              Select existing styles or create your own
            </p>
          </div>

          {/* Search and Add */}
          <div className="max-w-md mx-auto space-y-3">
            <Input
              type="text"
              placeholder="Search styles..."
              value={styleSearchQuery}
              onChange={(e) => setStyleSearchQuery(e.target.value)}
              className="font-bricolage"
            />
            {!showAddStyle ? (
              <Button
                onClick={() => setShowAddStyle(true)}
                variant="outline"
                className="w-full font-bricolage"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Style
              </Button>
            ) : (
              <div className="p-4 border-2 border-blue-300 rounded-xl bg-blue-50 space-y-3">
                <Input
                  type="text"
                  placeholder="Style name"
                  value={newStyleName}
                  onChange={(e) => setNewStyleName(e.target.value)}
                  className="font-bricolage"
                />
                <Input
                  type="text"
                  placeholder="Description (optional)"
                  value={newStyleDescription}
                  onChange={(e) => setNewStyleDescription(e.target.value)}
                  className="font-bricolage"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddCustomStyle}
                    size="sm"
                    className="font-bricolage flex-1"
                  >
                    Add
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAddStyle(false);
                      setNewStyleName("");
                      setNewStyleDescription("");
                    }}
                    variant="outline"
                    size="sm"
                    className="font-bricolage"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {isLoadingStyles ? (
            <div className="text-center py-8">
              <p className="font-bricolage text-gray-500">Loading styles...</p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto max-h-[400px] overflow-y-auto pr-2 space-y-2">
              {filteredStyleOptions.length > 0 ? (
                filteredStyleOptions.map((style) => {
                  const isSelected = formData.styleIds.includes(style.id);
                  return (
                    <button
                      key={style.id}
                      onClick={() => toggleStyle(style.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 bg-white hover:border-blue-300"
                      }`}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? "bg-blue-100" : "bg-gray-100"
                      }`}>
                        <Palette className={`w-6 h-6 ${
                          isSelected ? "text-blue-600" : "text-gray-600"
                        }`} />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-bricolage text-base font-semibold text-gray-900">
                          {style.name}
                        </h3>
                        <p className="font-bricolage text-sm text-gray-600 mt-1">
                          {style.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="font-bricolage text-gray-500">No styles found</p>
                </div>
              )}
            </div>
          )}
          <p className="font-bricolage text-sm text-gray-500 text-center mt-4">
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

  const canProceed = () => {
    if (currentStep === 0) return !!selectedPurpose;
    if (currentStep === 1) {
      return (formData.jobId > 0 || newJobName.trim()) &&
             formData.dob &&
             validateAge(formData.dob) &&
             formData.location;
    }
    return true;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full max-w-4xl">
        {/* Alert Message */}
        <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold font-bricolage text-blue-900 mb-1">
                Complete Your Profile to Continue
              </h3>
              <p className="text-xs font-bricolage text-blue-800">
                Please complete this onboarding form to start using SOP and access all features.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-200/50 border border-gray-100">
          <div className="w-full p-8 md:p-12 flex flex-col min-h-[600px]">
            {/* Progress Indicator */}
            <div className="flex justify-center gap-2 mb-8">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? "w-12 bg-blue-600"
                      : index < currentStep
                      ? "w-8 bg-blue-400"
                      : "w-8 bg-gray-200"
                  }`}
                />
              ))}
            </div>

            {/* Step Content */}
            <div className="flex-1 flex flex-col justify-center">
              {steps[currentStep].component}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              {currentStep > 0 ? (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="font-bricolage font-semibold"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              ) : (
                <div></div>
              )}

              <Button
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                className="font-bricolage font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting...
                  </div>
                ) : currentStep === steps.length - 1 ? (
                  "Complete Setup"
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
