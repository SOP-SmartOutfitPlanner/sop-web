import { create } from "zustand";
import { authAPI, ApiError, apiClient } from "@/lib/api";
import { extractUserFromToken } from "@/lib/utils/jwt";
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthStore,
} from "@/lib/types";

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  successMessage: null,
  requiresVerification: false,
  pendingVerificationEmail: null,

  // Initialize auth from localStorage
  initializeAuth: () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      const accessToken = localStorage.getItem('accessToken');
      const pendingEmail = sessionStorage.getItem('pendingVerificationEmail');
      
      if (userStr && accessToken) {
        try {
          const user = JSON.parse(userStr);
          set({ user, isAuthenticated: true });
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      
      if (pendingEmail) {
        set({ 
          requiresVerification: true,
          pendingVerificationEmail: pendingEmail 
        });
      }
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null, successMessage: null });
    
    try {
      const loginData: LoginRequest = { email, password };
      const response = await authAPI.login(loginData);
      
      // Login successful - tokens are saved automatically by authAPI
      // Extract user info from JWT token
      const accessToken = (response.data as any).accessToken;
      const userInfo = extractUserFromToken(accessToken);
      
      if (!userInfo) {
        throw new Error("Failed to extract user info from token");
      }
      
      // Create user object
      const user: User = {
        id: userInfo.id,
        displayName: userInfo.displayName,
        email: userInfo.email,
        avatar: undefined, // No avatar in JWT
        createdAt: undefined,
        updatedAt: undefined,
      };
      
      // Save user to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(user));
        sessionStorage.removeItem("pendingVerificationEmail");
      }
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        successMessage: response.message,
        requiresVerification: false,
        pendingVerificationEmail: null,
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : "Đăng nhập thất bại. Vui lòng thử lại.";
      
      set({
        isLoading: false,
        error: errorMessage,
        successMessage: null,
      });
      
      return false;
    }
  },

  register: async (displayName: string, email: string, password: string, confirmPassword: string) => {
    set({ isLoading: true, error: null, successMessage: null });
    
    try {
      const registerData: RegisterRequest = {
        displayName,
        email,
        password,
        confirmPassword,
      };
      
      const response = await authAPI.register(registerData);
      
      // Case 1: Registration successful with status 201 - requires email verification
      if (response.statusCode === 201) {
        set({
          isLoading: false,
          error: null,
          successMessage: response.message,
          requiresVerification: true,
          pendingVerificationEmail: email,
        });
        
        return {
          success: true,
          requiresVerification: true,
          message: response.message,
        };
      }
      
      // Case 2: Registration successful with tokens - no verification needed
      const userData = response.data as any;
      if (userData.user && userData.accessToken) {
        set({
          user: {
            id: userData.user.id,
            displayName: userData.user.displayName,
            email: userData.user.email,
            avatar: userData.user.avatar,
            createdAt: userData.user.createdAt,
            updatedAt: userData.user.updatedAt,
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
          successMessage: response.message,
          requiresVerification: false,
        });
        
        return {
          success: true,
          requiresVerification: false,
          message: response.message,
        };
      }
      
      // Fallback
      set({ isLoading: false });
      return {
        success: false,
        requiresVerification: false,
        message: "Registration completed but authentication failed.",
      };
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : "Đăng ký thất bại. Vui lòng thử lại.";
      
      set({
        isLoading: false,
        error: errorMessage,
        successMessage: null,
      });
      
      return {
        success: false,
        requiresVerification: false,
        message: errorMessage,
      };
    }
  },

  logout: async () => {
    set({ isLoading: true });
    
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear session storage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('pendingVerificationEmail');
      }
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        successMessage: null,
        requiresVerification: false,
        pendingVerificationEmail: null,
      });
    }
  },

  clearError: () => set({ error: null }),
  clearMessages: () => set({ error: null, successMessage: null }),
}));
