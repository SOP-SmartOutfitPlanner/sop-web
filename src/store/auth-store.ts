import { create } from "zustand";
import { authAPI, ApiError } from "@/lib/api";
import { extractUserFromToken } from "@/lib/utils/jwt";
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthStore,
} from "@/lib/types";

export const useAuthStore = create<AuthStore>((set) => ({
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
        } catch {
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
      const accessToken = (response.data as { accessToken: string }).accessToken;
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
    } catch (error: unknown) {
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

  loginWithGoogle: async (credential: string) => {
    set({ isLoading: true, error: null, successMessage: null });

    try {
      const response = await authAPI.loginWithGoogle(credential);

        // Case 1: New user - requires email verification (201)
        if (response.statusCode === 201) {
          const email = (response.data as { email?: string }).email;

        if (typeof window !== "undefined" && email) {
          sessionStorage.setItem("pendingVerificationEmail", email);
        }

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

      // Case 2: Existing user - login successfully (200)
      const accessToken = response.data.accessToken;
      const userInfo = extractUserFromToken(accessToken);

      if (!userInfo) {
        throw new Error("Failed to extract user info from token");
      }

      const user: User = {
        id: userInfo.id,
        displayName: userInfo.displayName,
        email: userInfo.email,
        avatar: undefined,
        createdAt: undefined,
        updatedAt: undefined,
      };

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

      return {
        success: true,
        requiresVerification: false,
        message: response.message,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : "Đăng nhập với Google thất bại. Vui lòng thử lại.";

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

  register: async (credentials: RegisterRequest) => {
    set({ isLoading: true, error: null, successMessage: null });
    
    try {
      const response = await authAPI.register(credentials);
      
      // Case 1: Registration successful with status 201 - requires email verification
      if (response.statusCode === 201) {
        set({
          isLoading: false,
          error: null,
          successMessage: response.message,
          requiresVerification: true,
          pendingVerificationEmail: credentials.email,
        });
        
        return {
          success: true,
          requiresVerification: true,
          message: response.message,
        };
      }
      
      // Case 2: Registration successful with tokens - no verification needed
      const userData = response.data as {
        user?: { 
          id: string; 
          displayName: string; 
          email: string; 
          avatar?: string;
          createdAt?: string;
          updatedAt?: string;
        };
        accessToken?: string;
        refreshToken?: string;
      };
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
    } catch (error: unknown) {
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
      // Call logout API (will send Authorization header automatically)
      await authAPI.logout();
    } catch {
      // Continue with local logout even if API fails
    } finally {
      // Clear all storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('pendingVerificationEmail');
        sessionStorage.removeItem('googleCredential');
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
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
