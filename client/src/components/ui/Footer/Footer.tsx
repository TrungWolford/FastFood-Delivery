import React from 'react'
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube, CreditCard, Clock, Navigation } from 'lucide-react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-800 text-white">
      {/* Services Section */}
      <div className="bg-gradient-to-r from-orange-400 to-amber-400 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-3 rounded-full shadow-lg">
                <div className="text-2xl">🚁</div>
              </div>
              <div>
                <h4 className="font-semibold text-white">Giao hàng siêu tốc</h4>
                <p className="text-sm text-orange-50">15-30 phút bằng drone</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-white p-3 rounded-full shadow-lg">
                <Navigation className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Theo dõi thời gian thực</h4>
                <p className="text-sm text-orange-50">GPS chính xác từng mét</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-white p-3 rounded-full shadow-lg">
                <MapPin className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Phủ sóng rộng</h4>
                <p className="text-sm text-orange-50">Toàn bộ khu vực nội thành</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-white p-3 rounded-full shadow-lg">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Hỗ trợ 24/7</h4>
                <p className="text-sm text-orange-50">Luôn sẵn sàng phục vụ</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-12 bg-orange-500">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-3xl">🍔</span>
                <span className="text-xl font-bold text-white">FastFoodDelivery</span>
              </div>
              <p className="text-orange-50 text-sm leading-relaxed">
                Nền tảng giao đồ ăn bằng drone hiện đại nhất Việt Nam. 
                Mang hương vị tuyệt hảo đến tận tay bạn trong chớp mắt.
              </p>
              <div className="flex space-x-3">
                <a href="#" className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-all">
                  <Facebook className="h-4 w-4 text-white" />
                </a>
                <a href="#" className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-all">
                  <Twitter className="h-4 w-4 text-white" />
                </a>
                <a href="#" className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-all">
                  <Instagram className="h-4 w-4 text-white" />
                </a>
                <a href="#" className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-all">
                  <Youtube className="h-4 w-4 text-white" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-white">Liên kết nhanh</h3>
              <ul className="space-y-2 text-orange-50">
                <li><a href="#" className="hover:text-white transition-colors">Nhà hàng</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cách hoạt động</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Trở thành đối tác</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tải ứng dụng</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tin tức</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Liên hệ</a></li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-white">Danh mục món ăn</h3>
              <ul className="space-y-2 text-orange-50">
                <li><a href="#" className="hover:text-white transition-colors">🍜 Món Á</a></li>
                <li><a href="#" className="hover:text-white transition-colors">🍕 Món Tây</a></li>
                <li><a href="#" className="hover:text-white transition-colors">🍔 Fast Food</a></li>
                <li><a href="#" className="hover:text-white transition-colors">🍰 Tráng miệng</a></li>
                <li><a href="#" className="hover:text-white transition-colors">🧋 Đồ uống</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-white">Thông tin liên hệ</h3>
              <div className="space-y-3 text-orange-50">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-white flex-shrink-0" />
                  <span className="text-sm">227 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-white flex-shrink-0" />
                  <span className="text-sm">1900.1234</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-white flex-shrink-0" />
                  <span className="text-sm">support@fastfooddelivery.vn</span>
                </div>
              </div>
              
              {/* Payment Methods */}
              <div className="mt-6">
                <h4 className="font-semibold mb-3 text-white">Phương thức thanh toán</h4>
                <div className="flex space-x-2">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded hover:bg-white/30 transition-all">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded text-white text-xs font-bold flex items-center justify-center hover:bg-white/30 transition-all px-3">
                    VNPAY
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-orange-600 border-t border-orange-700 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-white">
            <p><span>&copy; 2025 FastFoodDelivery</span> - Tất cả quyền được bảo lưu.</p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <a href="#" className="hover:text-amber-200 transition-colors">Chính sách bảo mật</a>
              <a href="#" className="hover:text-amber-200 transition-colors">Điều khoản sử dụng</a>
              <a href="#" className="hover:text-amber-200 transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer