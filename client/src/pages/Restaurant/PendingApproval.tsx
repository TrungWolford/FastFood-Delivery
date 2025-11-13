import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Store, Mail, Phone, MapPin, AlertCircle, LogOut } from 'lucide-react';
import TopNavigation from '../../components/ui/Header/Header';
import Footer from '../../components/ui/Footer/Footer';
import { restaurantService, type RestaurantResponse } from '../../services/restaurantService';
import { restaurantDetailService, type RestaurantDetailResponse } from '../../services/restaurantService';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';

const PendingApproval: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [restaurant, setRestaurant] = useState<RestaurantResponse | null>(null);
  const [restaurantDetail, setRestaurantDetail] = useState<RestaurantDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRestaurantData = async () => {
      if (!user?.userID) {
        navigate('/');
        return;
      }

      try {
        // Get restaurant by owner ID
        const restaurantResult = await restaurantService.getRestaurantsByOwner(user.userID);
        
        if (restaurantResult.success && restaurantResult.data && restaurantResult.data.length > 0) {
          const restaurantData = restaurantResult.data[0];
          setRestaurant(restaurantData);

          // Check if restaurant is approved
          if (restaurantData.status === 1) {
            // Restaurant is approved, redirect to dashboard
            navigate('/admin/dashboard');
            return;
          }

          // Get restaurant detail
          const detailResult = await restaurantDetailService.getRestaurantDetailByRestaurant(
            restaurantData.restaurantId
          );
          
          if (detailResult.success && detailResult.data) {
            setRestaurantDetail(detailResult.data);
          }
        } else {
          // No restaurant found, redirect to home
          navigate('/');
        }
      } catch (error) {
        console.error('Error loading restaurant data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurantData();
  }, [user, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  if (loading) {
    return (
      <>
        <TopNavigation />
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!restaurant) {
    return null;
  }

  return (
    <>
      <TopNavigation />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Pending Status Banner */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl shadow-2xl p-8 mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-full p-4">
                <Clock className="w-16 h-16 text-amber-500 animate-pulse" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Đang Chờ Xét Duyệt</h1>
            <p className="text-amber-50 text-lg">
              Nhà hàng của bạn đang được quản trị viên xem xét và phê duyệt
            </p>
          </div>

          {/* Restaurant Information Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-100 to-amber-100 p-6 border-b border-orange-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Store className="w-7 h-7 text-orange-600" />
                Thông Tin Nhà Hàng
              </h2>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Restaurant Avatar */}
              {restaurant.avatarImage && (
                <div className="flex justify-center">
                  <img
                    src={restaurant.avatarImage}
                    alt={restaurant.restaurantName}
                    className="w-32 h-32 rounded-full object-cover border-4 border-orange-200 shadow-lg"
                  />
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600 block mb-1">
                      Tên nhà hàng
                    </label>
                    <p className="text-lg font-bold text-gray-900">{restaurant.restaurantName}</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                    <div>
                      <label className="text-sm font-semibold text-gray-600 block mb-1">
                        Địa chỉ
                      </label>
                      <p className="text-gray-700">
                        {restaurant.address}, {restaurant.district}, {restaurant.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                    <div>
                      <label className="text-sm font-semibold text-gray-600 block mb-1">
                        Số điện thoại
                      </label>
                      <p className="text-gray-700">{restaurant.phone}</p>
                    </div>
                  </div>
                </div>

                {restaurantDetail && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-600 block mb-1">
                        Giờ mở cửa
                      </label>
                      <p className="text-gray-700">{restaurantDetail.openingHours}</p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-600 block mb-1">
                        Loại hình
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {restaurantDetail.restaurantTypes.map((type, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-600 block mb-1">
                        Ẩm thực
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {restaurantDetail.cuisines.map((cuisine, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium"
                          >
                            {cuisine}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {restaurantDetail?.description && (
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-2">
                    Mô tả
                  </label>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {restaurantDetail.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Information Box */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2 text-lg">Thông tin quan trọng</h3>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Quá trình xét duyệt thường mất từ <strong>1-3 ngày làm việc</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Bạn sẽ nhận được email thông báo khi tài khoản được phê duyệt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Nếu có vấn đề, quản trị viên sẽ liên hệ qua email hoặc số điện thoại bạn đã đăng ký</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Để biết thêm chi tiết, vui lòng liên hệ: <strong>support@vuatraicay.com</strong></span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
              <Mail className="w-5 h-5 text-orange-500" />
              Thông tin liên hệ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <div>
                <p className="text-sm text-gray-600 mb-1">Email hỗ trợ</p>
                <p className="font-semibold">support@vuatraicay.com</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Hotline</p>
                <p className="font-semibold">1900-xxxx</p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="text-center">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl"
            >
              <LogOut className="w-5 h-5" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PendingApproval;
