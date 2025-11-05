import { create } from "zustand";
import { authAPI, ApiError, apiClient, userAPI } from "@/lib/api";
import { extractUserFromToken, isAdminUser } from "@/lib/utils/jwt";
import { queryClient } from "@/lib/query-client";
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthStore,
} from "@/lib/types";

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isFirstTime: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  successMessage: null,
  requiresVerification: false,
  pendingVerificationEmail: null,

  // Initialize auth from localStorage
  initializeAuth: () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      const accessToken = localStorage.getItem('accessToken');
      const isFirstTimeStr = localStorage.getItem('isFirstTime');
      const pendingEmail = sessionStorage.getItem('pendingVerificationEmail');

      if (userStr && accessToken) {
        try {
          const user = JSON.parse(userStr);
          const isFirstTime = isFirstTimeStr === 'true';
          set({ user, isAuthenticated: true, isFirstTime, isInitialized: true });
        } catch {
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('isFirstTime');
          set({ isInitialized: true });
        }
      } else {
        set({ isInitialized: true });
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

      // CHECK IF USER IS ADMIN - REJECT ADMIN LOGIN FROM USER PORTAL
      if (isAdminUser(accessToken)) {
        // Admin user trying to login from user portal - reject
        set({
          isLoading: false,
          error: "Admin accounts must use the admin login portal at /admin/login",
          successMessage: null,
        });
        return { success: false, isFirstTime: false };
      }

      const userInfo = extractUserFromToken(accessToken);

      if (!userInfo) {
        throw new Error("Failed to extract user info from token");
      }

      // Create user object
      const user: User = {
        id: userInfo.id,
        displayName: userInfo.displayName,
        email: userInfo.email,
        role: userInfo.role,
        avatar: undefined, // No avatar in JWT
        createdAt: undefined,
        updatedAt: undefined,
      };

      // Fetch user profile to check isFirstTime
      let isFirstTime = false;
      try {
        const profileResponse = await userAPI.getUserProfile();
        isFirstTime = profileResponse.data.isFirstTime;
      } catch (profileError) {
        console.error("Failed to fetch user profile:", profileError);
        // Continue with login success even if profile fetch fails
      }

      // Save user and isFirstTime to localStorage and cookies
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("isFirstTime", String(isFirstTime));
        // Set cookie for middleware access (expires in 1 day)
        document.cookie = `isFirstTime=${isFirstTime}; path=/; max-age=86400; samesite=strict`;
        sessionStorage.removeItem("pendingVerificationEmail");
      }

      set({
        user,
        isAuthenticated: true,
        isFirstTime,
        isLoading: false,
        error: null,
        successMessage: response.message,
        requiresVerification: false,
        pendingVerificationEmail: null,
      });

      return { success: true, isFirstTime };
    } catch (error: unknown) {
      const errorMessage = error instanceof ApiError
        ? error.message
        : "An error occurred during login";

      set({
        isLoading: false,
        error: errorMessage,
        successMessage: null,
      });

      return { success: false, isFirstTime: false };
    }
  },

  // Admin login - allows admin users
  adminLogin: async (email: string, password: string) => {
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

      // Check if user is actually an admin
      if (userInfo.role !== "ADMIN" && userInfo.role !== "SuperAdmin") {
        // Not an admin - reject
        apiClient.clearTokens();
        set({
          isLoading: false,
          error: "Only ADMIN accounts can access this portal",
          successMessage: null,
        });
        return false;
      }

      // Create user object
      const user: User = {
        id: userInfo.id,
        displayName: userInfo.displayName,
        email: userInfo.email,
        role: userInfo.role,
        avatar: undefined,
        createdAt: undefined,
        updatedAt: undefined,
      };

      // Save user to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(user));
      }

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        successMessage: "Admin login successful",
      });

      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof ApiError
        ? error.message
        : "Admin login failed. Please try again.";

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
          isFirstTime: false,
        };
      }

      // Case 2: Existing user - login successfully (200)
      const accessToken = response.data.accessToken;
      
      // CHECK IF USER IS ADMIN - REJECT ADMIN LOGIN FROM USER PORTAL
      if (isAdminUser(accessToken)) {
        // Admin user trying to login from user portal - reject
        apiClient.clearTokens();
        set({
          isLoading: false,
          error: "Admin accounts must use the admin login portal at /admin/login",
          successMessage: null,
        });
        
        return {
          success: false,
          requiresVerification: false,
          message: "Admin accounts must use the admin login portal at /admin/login",
          isFirstTime: false,
        };
      }

      const userInfo = extractUserFromToken(accessToken);

      if (!userInfo) {
        throw new Error("Failed to extract user info from token");
      }

      const user: User = {
        id: userInfo.id,
        displayName: userInfo.displayName,
        email: userInfo.email,
        role: userInfo.role,
        avatar: undefined,
        createdAt: undefined,
        updatedAt: undefined,
      };

      // Fetch user profile to check isFirstTime
      let isFirstTime = false;
      try {
        const profileResponse = await userAPI.getUserProfile();
        isFirstTime = profileResponse.data.isFirstTime;
      } catch (profileError) {
        console.error("Failed to fetch user profile:", profileError);
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("isFirstTime", String(isFirstTime));
        // Set cookie for middleware access (expires in 1 day)
        document.cookie = `isFirstTime=${isFirstTime}; path=/; max-age=86400; samesite=strict`;
        sessionStorage.removeItem("pendingVerificationEmail");
      }

      set({
        user,
        isAuthenticated: true,
        isFirstTime,
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
        isFirstTime,
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
        isFirstTime: false,
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
            role: "User", // Default role for new registrations
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
        localStorage.removeItem('isFirstTime');
        // Clear cookies
        document.cookie = 'isFirstTime=; path=/; max-age=0';
        sessionStorage.removeItem('pendingVerificationEmail');
        sessionStorage.removeItem('googleCredential');
      }
      
      // Clear React Query cache
      queryClient.clear();
      
      // Clear wardrobe store - using dynamic import to avoid circular dependency
      if (typeof window !== 'undefined') {
        import('@/store/wardrobe-store').then(({ useWardrobeStore }) => {
          useWardrobeStore.getState().resetStore();
        });
      }
      
      set({
        user: null,
        isAuthenticated: false,
        isFirstTime: false,
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
  setIsFirstTime: (isFirstTime: boolean) => {
    set({ isFirstTime });
    if (typeof window !== 'undefined') {
      localStorage.setItem('isFirstTime', String(isFirstTime));
      // Update cookie for middleware access
      document.cookie = `isFirstTime=${isFirstTime}; path=/; max-age=86400; samesite=strict`;
    }
  },
}));
