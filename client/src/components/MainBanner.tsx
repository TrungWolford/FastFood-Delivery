import React from 'react';

const MainBanner: React.FC = () => {
  return (
    <div className="w-full">
      {/* Hero Banner Section */}
      <div className="relative w-full h-[550px] overflow-hidden rounded-2xl shadow-2xl">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500">
          {/* Decorative Elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-yellow-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* Content Container */}
        <div className="relative container mx-auto px-8 h-full flex items-center justify-center">
          <div className="text-center text-white space-y-8 max-w-5xl z-10">
            {/* Main Heading */}
            <div className="space-y-2">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-none tracking-tight">
                <span className="block text-white drop-shadow-2xl" 
                      style={{ textShadow: '4px 4px 8px rgba(0,0,0,0.6), 0 0 30px rgba(255,255,255,0.2)' }}>
                  FLYING
                </span>
                <span className="block text-white drop-shadow-2xl" 
                      style={{ textShadow: '4px 4px 8px rgba(0,0,0,0.6), 0 0 30px rgba(255,255,255,0.2)' }}>
                  FLAVORS, FAST
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white font-semibold tracking-wide" 
               style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              Your favorite meals delivered at light speed.
            </p>

            {/* Drone Badge & Burger */}
            <div className="flex items-center justify-center gap-6 md:gap-12 pt-4">
              {/* Drone Delivery Badge */}
              <div className="relative group">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-2xl flex items-center justify-center bg-gradient-to-br from-orange-500/40 to-amber-600/40 backdrop-blur-md transform group-hover:scale-110 transition-transform duration-300">
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl mb-1 animate-bounce">🚁</div>
                    <p className="text-xs font-black uppercase tracking-widest">Drone</p>
                    <p className="text-xs font-black uppercase tracking-widest">Delivery</p>
                  </div>
                </div>
              </div>

              {/* Burger Icon */}
              <div className="text-6xl md:text-7xl drop-shadow-2xl hover:scale-110 transition-transform duration-300 cursor-pointer">
                🍔
              </div>

              {/* Pizza Icon - Decorative */}
              <div className="hidden lg:block text-6xl md:text-7xl drop-shadow-2xl hover:scale-110 transition-transform duration-300 cursor-pointer">
                🍕
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Wave Bottom */}
        <div className="absolute bottom-0 left-0 right-0 opacity-30">
          <svg viewBox="0 0 1440 120" className="w-full h-24" preserveAspectRatio="none">
            <path d="M0,64 C360,120 720,0 1440,64 L1440,120 L0,120 Z" fill="white" fillOpacity="0.2"/>
          </svg>
        </div>
      </div>

      {/* Features Section Below Banner */}
      <div className="container mx-auto px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-orange-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-white rounded-xl hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl mb-3">🚁</div>
              <p className="font-bold text-gray-800 text-base">Giao bằng Drone</p>
              <p className="text-sm text-gray-600 mt-2">Công nghệ bay hiện đại</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-white rounded-xl hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl mb-3">⚡</div>
              <p className="font-bold text-gray-800 text-base">Siêu nhanh</p>
              <p className="text-sm text-gray-600 mt-2">Chỉ 15-30 phút</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-red-50 to-white rounded-xl hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl mb-3">🍔</div>
              <p className="font-bold text-gray-800 text-base">Đa dạng món</p>
              <p className="text-sm text-gray-600 mt-2">Hàng nghìn lựa chọn</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-white rounded-xl hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl mb-3">🛡️</div>
              <p className="font-bold text-gray-800 text-base">An toàn</p>
              <p className="text-sm text-gray-600 mt-2">Đảm bảo vệ sinh</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainBanner;
