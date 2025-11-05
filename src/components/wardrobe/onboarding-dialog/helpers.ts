import dayjs from "dayjs";
import type { OnboardingData, Province, District, Ward } from "./types";

export const validatePersonalInfo = (formData: OnboardingData): string | null => {
  if (!formData.dob) {
    return "Please select your date of birth";
  }
  if (dayjs(formData.dob).isAfter(dayjs().startOf('day')) || dayjs(formData.dob).isSame(dayjs().startOf('day'))) {
    return "Date of birth must be in the past";
  }
  if (!formData.province || !formData.district) {
    return "Please select at least Province and District";
  }
  if (!formData.jobId && !formData.otherJob.trim()) {
    return "Please select your occupation or specify other occupation";
  }
  if (!formData.bio || formData.bio.trim() === "") {
    return "Please tell us about yourself";
  }
  return null;
};

export const validateColors = (formData: OnboardingData): string | null => {
  if (formData.preferedColor.length === 0) {
    return "Please add at least one preferred color";
  }
  if (formData.avoidedColor.length === 0) {
    return "Please add at least one avoided color";
  }
  return null;
};

export const validateStyles = (formData: OnboardingData): string | null => {
  if (formData.styleIds.length === 0 && formData.otherStyles.length === 0) {
    return "Please select at least one style or add other styles";
  }
  return null;
};

export const buildLocationString = (province?: Province, district?: District, ward?: Ward): string => {
  if (!province || !district) return '';

  if (ward) {
    return `${province.name}, ${district.name}, ${ward.name}`;
  }
  return `${province.name}, ${district.name}`;
};
