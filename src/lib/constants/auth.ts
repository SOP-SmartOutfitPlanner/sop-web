export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: "Đăng nhập thành công!",
  LOGIN_ERROR: "Email hoặc mật khẩu không đúng",
  REGISTER_SUCCESS: "Đăng ký thành công!",
  REGISTER_ERROR: "Đăng ký thất bại",
  GENERAL_ERROR: "Có lỗi xảy ra, vui lòng thử lại",
} as const;

export const AUTH_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
} as const;
