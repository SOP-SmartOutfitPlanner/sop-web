/**
 * Authentication Types
 * All auth-related interfaces and types
 */

// ============================================================================
// User
// ============================================================================

export interface User {
  id: string;
  displayName: string;
  email: string;
  role: string; // "User" | "Admin" | "SuperAdmin"
  avatar?: string;
  location?: string;
  tryOnImageUrl?: string; // Full body image URL for virtual try-on
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Auth Requests
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  displayName: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface GoogleLoginRequest {
  credential: string; // Google ID token
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpResetRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

// ============================================================================
// Auth Responses
// ============================================================================

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export type LoginResponse = TokenPair;

export interface RegisterResponse {
  email: string;
  message: string;
}

export interface ResendOtpResponse {
  expiryMinutes: number;
  remainingAttempts: number;
}

export interface VerifyOtpResetResponse {
  resetToken: string;
  expiryMinutes: number;
}

// ============================================================================
// Form Values (for React Hook Form)
// ============================================================================

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// ============================================================================
// Auth Store State
// ============================================================================

export interface AuthState {
  // User data
  user: User | null;
  isAuthenticated: boolean;
  isFirstTime: boolean;

  // Loading states
  isLoading: boolean;
  isInitialized: boolean;

  // Messages
  error: string | null;
  successMessage: string | null;

  // Email verification
  requiresVerification: boolean;
  pendingVerificationEmail: string | null;
}

export interface AuthStore extends AuthState {
  // Actions
  login: (email: string, password: string) => Promise<{
    success: boolean;
    isFirstTime: boolean;
    isAdmin: boolean;
  }>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (credential: string) => Promise<{
    success: boolean;
    requiresVerification: boolean;
    message: string;
    isFirstTime: boolean;
  }>;
  register: (credentials: RegisterRequest) => Promise<{
    success: boolean;
    requiresVerification: boolean;
    message: string;
  }>;
  logout: () => void;
  initializeAuth: () => Promise<void>;

  // Helpers
  clearError: () => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setIsFirstTime: (isFirstTime: boolean) => void;
  updateUser: (updates: Partial<User>) => void;
}

// ============================================================================
// JWT Token Payload
// ============================================================================

export interface JwtPayload {
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
  "UserId": string;
  "FirstTime": string;
  "jti": string;
  "exp": number;
  "iss": string;
  "aud": string;
}

export interface ExtractedUserInfo {
  id: string;
  email: string;
  displayName: string;
  role: string;
  isFirstTime: boolean;
}

// ============================================================================
// Misc
// ============================================================================

export type AuthFormType = "login" | "register";

