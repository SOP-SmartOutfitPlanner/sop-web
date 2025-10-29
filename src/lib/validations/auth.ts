import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const registerSchema = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Confirm password does not match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
});

export const verifyOtpResetSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  otp: z.string().length(6, { message: "OTP must be 6 characters" }),
});

export const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  resetToken: z.string().min(1, { message: "Invalid reset token" }),
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Confirm password does not match",
  path: ["confirmPassword"],
});