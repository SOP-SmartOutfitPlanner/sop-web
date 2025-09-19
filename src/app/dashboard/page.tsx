"use client";

import { useAuthStore } from "@/store/auth-store";

export default function DashboardPage() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-white/30">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
            Dashboard
          </h1>

          <div className="mb-8">
            <p className="text-gray-600 mb-2">
              Chào mừng bạn đến với SOP Wardrobe!
            </p>
            {user && (
              <p className="text-lg font-medium text-gray-800">
                Xin chào, {user.name}! 👋
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Tủ đồ của tôi
              </h3>
              <p className="text-blue-600 text-sm">
                Quản lý và tổ chức quần áo của bạn
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Outfit AI
              </h3>
              <p className="text-green-600 text-sm">
                Gợi ý trang phục thông minh
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">
                Phong cách
              </h3>
              <p className="text-purple-600 text-sm">
                Khám phá phong cách cá nhân
              </p>
            </div>
          </div>

          <div className="p-6 bg-green-50 rounded-2xl border border-green-200">
            <h2 className="text-xl font-semibold mb-2 text-green-800">
              🎉 Đăng nhập thành công!
            </h2>
            <p className="text-green-700 mb-4">
              Bạn đã đăng nhập thành công vào hệ thống quản lý tủ đồ.
            </p>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
