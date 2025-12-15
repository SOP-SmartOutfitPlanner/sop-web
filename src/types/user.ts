import { WardrobeItem } from ".";

export enum Gender {
  Male = 0,
  Female = 1,
}

export interface OnboardingRequest {
  preferedColor: string[];
  avoidedColor: string[];
  gender: number;
  location: string;
  jobId?: number;
  otherJob?: string;
  dob: string;
  bio: string;
  styleIds: number[];
  otherStyles?: string[];
  tryOnImageUrl?: string; // Full body image URL for virtual try-on
}

export interface UpdateProfileRequest {
  displayName?: string;
  dob?: string;
  gender?: number;
  preferedColor?: string[];
  avoidedColor?: string[];
  location?: string;
  bio?: string;
  jobId?: number;
  otherJob?: string;
  styleIds?: number[];
  otherStyles?: string[];
  avtUrl?: string;
  tryOnImageUrl?: string; // Full body image URL for virtual try-on
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
  tryOnImageUrl: string | null; // Full body image URL for virtual try-on
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
  createdBy?: string;
  createdDate?: string;
  updatedDate?: string | null;
}

export interface StyleOption {
  id: number;
  name: string;
  description: string;
  createdBy?: string | null;
  createdDate?: string | null;
  updatedDate?: string | null;
}

export interface PurposeOption {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface UserProfileResponse {
  id: number;
  email: string;
  displayName: string;
  avtUrl: string | null;
  tryOnImageUrl: string | null; // Full body image URL for virtual try-on
  dob: string;
  gender: number;
  preferedColor: string[];
  avoidedColor: string[];
  location: string;
  bio: string;
  isVerifiedEmail: boolean;
  isStylist: boolean;
  isPremium: boolean;
  isLoginWithGoogle: boolean;
  isFirstTime: boolean;
  role: number;
  jobId: number;
  jobName: string;
  jobDescription: string;
  otherJob?: string;
  otherStyles?: string[];
  userStyles: {
    id: number;
    styleId: number;
    styleName: string;
    styleDescription: string;
  }[];
}
