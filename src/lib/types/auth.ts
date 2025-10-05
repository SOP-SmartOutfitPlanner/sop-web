export interface User {
  id: string;
  displayName: string;
  email: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AuthFormType = "login" | "register";

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues extends LoginFormValues {
  displayName: string;
  confirmPassword: string;
}
