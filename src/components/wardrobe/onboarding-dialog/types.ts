export interface OnboardingData {
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
  tryOnImageUrl: string; // Full body image URL for virtual try-on
  tryOnImageFile: File | null; // Temporary file before upload
}

export interface Province {
  id: string;
  name: string;
  type: string;
}

export interface District {
  id: string;
  name: string;
  provinceId: string;
  type: string;
}

export interface Ward {
  id: string;
  name: string;
  districtId: string;
  type: string;
}

export interface Job {
  id: number;
  name: string;
  description: string;
  createdBy?: string;
}

export interface StyleOption {
  id: number;
  name: string;
  description: string;
  createdBy?: string;
}
