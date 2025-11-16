// src/pages/Restaurant/RestaurantDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Star, 
  Clock, 
  Phone, 
  ChevronLeft,
  ShoppingCart,
  Plus,
  Minus,
  X
} from 'lucide-react';
import TopNavigation from '../../components/ui/Header/Header';
import Footer from '../../components/ui/Footer/Footer';
import { restaurantService, restaurantDetailService } from '../../services/restaurantService';
import { menuItemService } from '../../services/menuItemService';
import { cartService } from '../../services/cartService';
import type { RestaurantResponse, RestaurantDetailResponse } from '../../services/restaurantService';
import type { MenuItemResponse } from '../../services/menuItemService';
import { useAppSelector } from '../../hooks/redux';
import { toast } from 'sonner';

const RestaurantDetail: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [restaurant, setRestaurant] = useState<RestaurantResponse | null>(null);
  const [restaurantDetail, setRestaurantDetail] = useState<RestaurantDetailResponse | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cart modal state
  const [selectedItem, setSelectedItem] = useState<MenuItemResponse | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);

  // Load restaurant data
  useEffect(() => {
    const loadData = async () => {
      if (!restaurantId) {
        setError('Restaurant ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Load restaurant basic info
        const restaurantResponse = await restaurantService.getRestaurantById(restaurantId);
        if (restaurantResponse.success && restaurantResponse.data) {
          setRestaurant(restaurantResponse.data);
        }

        // Load restaurant details (extended info) - optional
        try {
          const detailResponse = await restaurantDetailService.getRestaurantDetailByRestaurant(restaurantId);
          if (detailResponse.success && detailResponse.data) {
            setRestaurantDetail(detailResponse.data);
          }
        } catch {
          // Restaurant detail is optional, ignore error
        }

        // Load menu items
        const menuItems = await menuItemService.getMenuItemsByRestaurant(restaurantId);
        if (menuItems && menuItems.length > 0) {
          setMenuItems(menuItems);
        }

      } catch (err: unknown) {
        const error = err as { message?: string };
        setError(error.message || 'Failed to load restaurant');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [restaurantId]);

  const handleAddToCart = (menuItem: MenuItemResponse) => {
    setSelectedItem(menuItem);
    setQuantity(1);
    setNote('');
  };

  const handleConfirmAddToCart = async () => {
    if (!selectedItem || !restaurantId) return;

    if (!isAuthenticated || !user?.accountId) {
      toast.error('Vui lòng đăng nhập để thêm món vào giỏ hàng');
      navigate('/');
      return;
    }

    try {
      setAddingToCart(true);

      const response = await cartService.addItemToRestaurantCart(
        user.accountId,
        restaurantId,
        {
          itemId: selectedItem.itemId,
          quantity,
          note: note.trim() || undefined
        }
      );

      if (response.success) {
        toast.success(`Đã thêm ${selectedItem.name} vào giỏ hàng!`);
        setSelectedItem(null);
        setQuantity(1);
        setNote('');
        // Trigger cart update event
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        throw new Error(response.message || 'Failed to add to cart');
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Không thể thêm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          <span className="ml-4 text-gray-600">Đang tải...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy nhà hàng</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Quay về trang chủ
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />

      {/* Restaurant Header */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-amber-600 mb-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Quay lại</span>
          </button>

          <div className="flex items-start space-x-6">
            {/* Restaurant Avatar */}
            <div className="flex-shrink-0">
              {restaurant.avatarImage ? (
                <img
                  src={restaurant.avatarImage}
                  alt={restaurant.restaurantName}
                  className="w-32 h-32 rounded-xl object-cover shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <span className="text-4xl font-bold text-white">
                    {restaurant.restaurantName.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Restaurant Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {restaurant.restaurantName}
              </h1>

              {/* Rating */}
              <div className="flex items-center mb-3">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 mr-1" />
                <span className="text-lg font-semibold text-gray-800 mr-2">
                  {restaurant.rating.toFixed(1)}
                </span>
                <span className="text-gray-500">(0 đánh giá)</span>
              </div>

              {/* Address */}
              <div className="flex items-start text-gray-600 mb-2">
                <MapPin className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{restaurant.address}, {restaurant.district}, {restaurant.city}</span>
              </div>

              {/* Phone */}
              <div className="flex items-center text-gray-600 mb-2">
                <Phone className="w-5 h-5 mr-2" />
                <span>{restaurant.phone}</span>
              </div>

              {/* Opening Hours */}
              {restaurantDetail?.openingHours && (
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>{restaurantDetail.openingHours}</span>
                </div>
              )}

              {/* Restaurant Types & Cuisines */}
              {restaurantDetail && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {restaurantDetail.restaurantTypes?.map((type, idx) => (
                    <span key={idx} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                      {type}
                    </span>
                  ))}
                  {restaurantDetail.cuisines?.slice(0, 3).map((cuisine, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {cuisine}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {restaurantDetail?.description && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{restaurantDetail.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Thực đơn</h2>

        {menuItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Nhà hàng chưa có món ăn nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {menuItems.map((item) => (
              <div
                key={item.itemId}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Item Image */}
                <div className="relative h-48 overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-4xl">🍽️</span>
                    </div>
                  )}
                  
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-semibold">Hết hàng</span>
                    </div>
                  )}
                </div>

                {/* Item Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                    {item.name}
                  </h3>
                  
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-amber-600">
                      {item.price.toLocaleString('vi-VN')}đ
                    </span>
                    
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.isAvailable}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Thêm</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add to Cart Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Thêm vào giỏ hàng</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Item Info */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                {selectedItem.name}
              </h4>
              <p className="text-xl font-bold text-amber-600">
                {selectedItem.price.toLocaleString('vi-VN')}đ
              </p>
            </div>

            {/* Quantity */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Note */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Không cay, ít đường..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedItem(null)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmAddToCart}
                disabled={addingToCart}
                className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {addingToCart ? 'Đang thêm...' : `Thêm - ${(selectedItem.price * quantity).toLocaleString('vi-VN')}đ`}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default RestaurantDetail;
