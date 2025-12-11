export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: "Login successful!",
  LOGIN_ERROR: "Invalid email or password",
  REGISTER_SUCCESS: "Register successful!",
  REGISTER_ERROR: "Register failed",
  GENERAL_ERROR: "An error occurred, please try again",
  ADMIN_LOGIN_ONLY: "Admin accounts must use the admin login portal",
  ADMIN_ROLE_REQUIRED: "Only admin accounts can access this portal",
} as const;

// Role constants
export const USER_ROLES = {
  ADMIN: "ADMIN",
  STYLIST: "STYLIST",
  USER: "USER",
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const AUTH_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/home",
} as const;
