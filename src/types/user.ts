import { WardrobeItem } from ".";

export enum Gender {
  Male = 0,
  Female = 1,
}

export interface OnboardingRequest {
  preferedColor: string;
  avoidedColor: string;
  gender: number;
  location: string;
  jobId: number;
  dob: string; 
  bio: string;
  styleIds: number[];
}

export interface UserResponse {
  email: string;
  passwordHash: string | null;
  role: number;
  displayName: string;
  isVerifiedEmail: boolean;
  isStylist: boolean;
  isPremium: boolean;
  isLoginWithGoogle: boolean;
  isFirstTime: boolean;
  avtUrl: string;
  dob: string;
  gender: number;
  preferedColor: string;
  avoidedColor: string;
  location: string;
  bio: string;
  jobId: number | null;
  items: WardrobeItem[];
  job: Job;
  userStyles: StyleOption[];
  id: number;
  createdDate: string;
  updatedDate: string;
  isDeleted: boolean;
}



export interface Job {
  id: number;
  name: string;
  description: string;
}

export interface StyleOption {
  id: number;
  name: string;
  description: string;
}

export interface PurposeOption {
  id: string;
  title: string;
  description: string;
  icon: string;
}
