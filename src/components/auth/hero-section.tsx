export function HeroSection() {
  return (
    <div className="hidden lg:flex lg:w-2/5 xl:w-1/2 relative overflow-hidden">
      <div className="w-full h-full bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-8">
        <div className="text-center max-w-lg">
          {/* App Icon Container */}
          <div className="w-80 h-80 mx-auto mb-8 bg-gradient-to-br from-blue-100/80 to-blue-200/60 rounded-3xl flex items-center justify-center relative overflow-hidden backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/30"></div>
            <div className="text-center z-10">
              {/* SoP Logo */}
              <div className="w-24 h-24 bg-gradient-to-br from-blue-700 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <div className="text-3xl font-bold text-white">SoP</div>
              </div>
              {/* Dress Icon */}
              <div className="text-6xl mb-4">👗</div>
              <p className="text-sm text-gray-500 font-medium">
                Fashion AI Assistant
              </p>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
            Style trong tầm tay
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 leading-relaxed">
            Khám phá phong cách cá nhân với AI thông minh. Tạo ra những outfit
            hoàn hảo cho mọi dịp.
          </p>
        </div>
      </div>
    </div>
  );
}
