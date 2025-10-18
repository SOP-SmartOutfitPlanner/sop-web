"use client";

import { useRouter } from "next/navigation";
import {
  Sparkles,
  Eye,
  Calendar,
  History,
  Heart,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";

export default function WelcomePage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/login");
  };

  const handleTryFree = () => {
    // Navigate to wardrobe without login (guest mode)
    router.push("/wardrobe");
  };

  const handleViewCollections = () => {
    // Navigate to wardrobe to see items
    router.push("/wardrobe");
  };

  const features = [
    {
      icon: Eye,
      title: "Smart Wardrobe",
      description: "Organize và quản lý tủ đồ thông minh",
    },
    {
      icon: Sparkles,
      title: "AI Suggestions",
      description: "Gợi ý outfit phù hợp với thời tiết và sự kiện",
    },
    {
      icon: Calendar,
      title: "Daily Planner",
      description: "Lên kế hoạch trang phục hàng ngày",
    },
    {
      icon: ImageIcon,
      title: "Style Collections",
      description: "Khám phá bộ sưu tập từ stylist chuyên nghiệp",
    },
    {
      icon: History,
      title: "Outfit History",
      description: "Theo dõi lịch sử và tránh lặp lại",
    },
    {
      icon: Heart,
      title: "Favorites",
      description: "Lưu những outfit yêu thích",
    },
    {
      icon: Users,
      title: "Community",
      description: "Chia sẻ và khám phá phong cách",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/10 flex items-center justify-center p-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          {/* Logo with decorative background */}
          <div className="relative flex items-center justify-center mb-12 py-8">
            {/* Decorative circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-200/20 via-cyan-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-indigo-300/10 to-cyan-300/10 rounded-full blur-2xl" />
            
            {/* Logo */}
            <div 
              className="relative z-10 animate-in fade-in zoom-in duration-1000"
              suppressHydrationWarning
            >
              <Logo 
                variant="full" 
                width={280} 
                height={280}
                showGlow={true}
                className="hover:scale-[1.02] transition-all duration-500"
              />
            </div>
          </div>

          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            Ứng dụng AI giúp bạn lựa chọn trang phục hoàn hảo cho mọi dịp. Thông
            minh, tiện lợi và phù hợp với phong cách của bạn.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-4 h-auto shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Bắt đầu ngay
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleViewCollections}
              className="text-lg px-8 py-4 h-auto border-2 hover:bg-gray-50 hover:border-blue-600 hover:text-blue-600 hover:scale-105 transition-all duration-300"
            >
              <ImageIcon className="w-5 h-5 mr-2" />
              Xem Collections
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={handleTryFree}
              className="text-lg px-8 py-4 h-auto hover:bg-blue-50 hover:text-blue-600 hover:scale-105 transition-all duration-300"
            >
              Dùng thử miễn phí
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-0 shadow-md"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Benefits Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50 shadow-lg">
          <CardContent className="p-10 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Tại sao chọn SOP?
            </h2>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Badge
                variant="secondary"
                className="text-sm py-2 px-4 bg-blue-100 text-blue-800 hover:bg-blue-200"
              >
                AI thông minh
              </Badge>
              <Badge
                variant="secondary"
                className="text-sm py-2 px-4 bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
              >
                Dễ sử dụng
              </Badge>
              <Badge
                variant="secondary"
                className="text-sm py-2 px-4 bg-purple-100 text-purple-800 hover:bg-purple-200"
              >
                Tiết kiệm thời gian
              </Badge>
              <Badge
                variant="secondary"
                className="text-sm py-2 px-4 bg-pink-100 text-pink-800 hover:bg-pink-200"
              >
                Phong cách cá nhân
              </Badge>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto">
              Không còn phải lo lắng về việc &ldquo;mặc gì hôm nay&rdquo;. SOP sẽ giúp bạn
              luôn tự tin với phong cách của mình.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p className="text-sm">
            © 2024 Smart Outfit Planner. Made with ❤️ for fashion lovers.
          </p>
        </div>
      </div>
    </div>
  );
}

