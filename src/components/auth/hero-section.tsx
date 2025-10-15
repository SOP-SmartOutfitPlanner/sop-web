import { Logo } from "@/components/ui/logo";
import { Sparkles, Shirt, Calendar, Heart } from "lucide-react";

export function HeroSection() {
  return (
    <div className="hidden lg:flex lg:w-2/5 xl:w-1/2 relative overflow-hidden h-full">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50"></div>
      
      {/* Decorative circles */}
      <div className="absolute top-20 -right-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 -left-20 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl"></div>
      
      {/* Content */}
      <div className="relative w-full h-full flex items-center justify-center p-8 xl:p-12">
        <div className="text-center max-w-md space-y-8">
          {/* Logo Section */}
          <div
            className="animate-in fade-in zoom-in duration-1000"
            suppressHydrationWarning
          >
            <div className="relative inline-block">
              {/* Glow effect */}
              <div className="absolute inset-0 blur-2xl opacity-40 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 rounded-full animate-pulse"></div>

              {/* Logo */}
              <div className="relative z-10">
                <Logo
                  variant="icon"
                  width={160}
                  height={160}
                  showGlow={false}
                  className="mx-auto"
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            <h1 className="font-poppins text-4xl xl:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Smart Outfit Planner
              </span>
            </h1>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-cyan-500 to-transparent rounded-full"></div>
          </div>

          {/* Description */}
          <p className="text-lg text-gray-600 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            Khám phá phong cách cá nhân với AI thông minh. Tạo ra những outfit
            hoàn hảo cho mọi dịp.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-medium text-gray-700">AI Gợi ý</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Shirt className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-medium text-gray-700">Quản lý tủ đồ</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-medium text-gray-700">Lên lịch</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-medium text-gray-700">Yêu thích</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
