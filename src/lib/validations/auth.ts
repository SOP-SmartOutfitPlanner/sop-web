import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
});
