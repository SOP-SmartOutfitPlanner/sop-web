export interface User {
  id: string;
  name: string;
  email: string;
}

export type AuthFormType = "login" | "register";

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues extends LoginFormValues {
  name: string;
}
