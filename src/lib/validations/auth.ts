import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

export const registerSchema = z.object({
  displayName: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
  confirmPassword: z.string().min(6, { message: "Mật khẩu xác nhận phải có ít nhất 6 ký tự" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
});

export const verifyOtpResetSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  otp: z.string().length(6, { message: "Mã OTP phải có 6 ký tự" }),
});

export const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  resetToken: z.string().min(1, { message: "Reset token không hợp lệ" }),
  newPassword: z.string().min(6, { message: "Mật khẩu mới phải có ít nhất 6 ký tự" }),
  confirmPassword: z.string().min(6, { message: "Mật khẩu xác nhận phải có ít nhất 6 ký tự" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});