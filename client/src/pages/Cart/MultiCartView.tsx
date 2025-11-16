// src/pages/Cart/MultiCartView.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus,
  ChevronRight,
  Store,
  MapPin
} from 'lucide-react';
import TopNavigation from '../../components/ui/Header/Header';
import Footer from '../../components/ui/Footer/Footer';
import { cartService } from '../../services/cartService';
import { restaurantService } from '../../services/restaurantService';
import type { RestaurantResponse } from '../../services/restaurantService';
import { useAppSelector } from '../../hooks/redux';

interface CartItemData {
  cartItemId: string;
  itemId: string;
  itemName: string;
  price: number;
  quantity: number;
  note?: string;
  imageUrl?: string;
}

interface RestaurantCart {
  cartId: string;
  restaurantId: string;
  restaurant?: RestaurantResponse;
  items: CartItemData[];
  totalAmount: number;
  itemCount: number; // Tổng số lượng (quantity) - Deprecated, use totalQuantity
  uniqueItems: number; // Số món khác nhau (items.length)
  totalQuantity: number; // Tổng số lượng (sum of quantities)
}

const MultiCartView: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [carts, setCarts] = useState<RestaurantCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const loadCartsData = async () => {
      // Wait for auth state to be restored from localStorage
      // This prevents redirect when user refreshes the page (F5)
      if (!authChecked) {
        const timer = setTimeout(() => setAuthChecked(true), 200);
        return () => clearTimeout(timer);
      }

      if (!isAuthenticated || !user?.accountId) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const response = await cartService.getAllCartsDetailByUser(user.accountId);
        
        if (response.success && response.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const cartsData = Array.isArray(response.data) ? response.data : [response.data] as any[];
          
          // Filter out carts without items or with empty items array
          const validCarts = cartsData.filter((cart) => cart.items && Array.isArray(cart.items) && cart.items.length > 0);
          
          // Load restaurant info for each cart
          const cartsWithRestaurant = await Promise.all(
            validCarts.map(async (cart) => {
              const items = cart.items || [];
              const uniqueItems = items.length;
              const totalQuantity = items.reduce((sum: number, item: CartItemData) => sum + item.quantity, 0);
              
              try {
                const restaurantResponse = await restaurantService.getRestaurantById(cart.restaurantId);
                return {
                  ...cart,
                  items,
                  uniqueItems,
                  totalQuantity,
                  itemCount: totalQuantity, // Backward compatibility
                  restaurant: restaurantResponse.success ? restaurantResponse.data : undefined
                };
              } catch {
                return {
                  ...cart,
                  items,
                  uniqueItems,
                  totalQuantity,
                  itemCount: totalQuantity // Backward compatibility
                };
              }
            })
          );

          setCarts(cartsWithRestaurant);
        }
      } catch (err: unknown) {
        const error = err as { message?: string };
        setError(error.message || 'Không thể tải giỏ hàng');
      } finally {
        setLoading(false);
      }
    };

    loadCartsData();
  }, [navigate, isAuthenticated, user, authChecked]);

  const loadCarts = async () => {
    if (!user?.accountId) return;

    try {
      setLoading(true);
      const response = await cartService.getAllCartsDetailByUser(user.accountId);
      
      if (response.success && response.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cartsData = Array.isArray(response.data) ? response.data : [response.data] as any[];
        
        // Filter out carts without items or with empty items array
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const validCarts = cartsData.filter((cart: any) => cart.items && Array.isArray(cart.items) && cart.items.length > 0);
        
        // Load restaurant info for each cart
        const cartsWithRestaurant = await Promise.all(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          validCarts.map(async (cart: any) => {
            const items = cart.items || [];
            const uniqueItems = items.length;
            const totalQuantity = items.reduce((sum: number, item: CartItemData) => sum + item.quantity, 0);
            
            try {
              const restaurantResponse = await restaurantService.getRestaurantById(cart.restaurantId);
              return {
                ...cart,
                items,
                uniqueItems,
                totalQuantity,
                itemCount: totalQuantity, // Backward compatibility
                restaurant: restaurantResponse.success ? restaurantResponse.data : undefined
              };
            } catch {
              return {
                ...cart,
                items,
                uniqueItems,
                totalQuantity,
                itemCount: totalQuantity // Backward compatibility
              };
            }
          })
        );

        setCarts(cartsWithRestaurant);
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (cartId: string, cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;

    // Optimistic update - update UI immediately
    setCarts(prevCarts => 
      prevCarts.map(cart => {
        if (cart.cartId === cartId) {
          const updatedItems = cart.items.map(item => 
            item.cartItemId === cartItemId 
              ? { ...item, quantity: newQuantity }
              : item
          );
          
          // Recalculate total and count
          const totalAmount = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          const uniqueItems = updatedItems.length;
          const totalQuantity = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
          
          return {
            ...cart,
            items: updatedItems,
            totalAmount,
            uniqueItems,
            totalQuantity,
            itemCount: totalQuantity // Backward compatibility
          };
        }
        return cart;
      })
    );

    try {
      const response = await cartService.updateCartItem({
        cartId,
        cartItemId,
        quantity: newQuantity
      });

      if (!response.success) {
        // Revert on failure
        loadCarts();
        alert(response.message || 'Không thể cập nhật số lượng');
      } else {
        // Update cart count in header
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      // Revert on error
      loadCarts();
      alert(error.message || 'Không thể cập nhật số lượng');
    }
  };

  const handleRemoveItem = async (cartId: string, cartItemId: string) => {
    if (!confirm('Bạn có chắc muốn xóa món này?')) return;

    // Optimistic update - remove from UI immediately
    setCarts(prevCarts => 
      prevCarts.map(cart => {
        if (cart.cartId === cartId) {
          const updatedItems = cart.items.filter(item => item.cartItemId !== cartItemId);
          
          // Recalculate total and count
          const totalAmount = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          const uniqueItems = updatedItems.length;
          const totalQuantity = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
          
          return {
            ...cart,
            items: updatedItems,
            totalAmount,
            uniqueItems,
            totalQuantity,
            itemCount: totalQuantity // Backward compatibility
          };
        }
        return cart;
      }).filter(cart => cart.items && cart.items.length > 0) // Remove empty carts
    );

    try {
      const response = await cartService.removeFromCart(cartId, cartItemId);
      if (!response.success) {
        // Revert on failure
        loadCarts();
        alert(response.message || 'Không thể xóa món');
      } else {
        // Update cart count in header
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      // Revert on error
      loadCarts();
      alert(error.message || 'Không thể xóa món');
    }
  };

  const handleCheckout = (restaurantId: string, cartId: string) => {
    navigate(`/checkout?restaurantId=${restaurantId}&cartId=${cartId}`);
  };

  const handleViewRestaurant = (restaurantId: string) => {
    navigate(`/restaurant/${restaurantId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-red-600">
            <p className="text-xl font-semibold">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const totalCarts = carts.length;
  const totalUniqueItems = carts.reduce((sum, cart) => sum + cart.uniqueItems, 0);
  const totalQuantity = carts.reduce((sum, cart) => sum + cart.totalQuantity, 0);
  const grandTotal = carts.reduce((sum, cart) => sum + cart.totalAmount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-amber-600" />
            Giỏ hàng của tôi
          </h1>
          <p className="text-gray-600 mt-2">
            {totalCarts} nhà hàng • {totalUniqueItems} món ({totalQuantity} sản phẩm)
          </p>
        </div>

        {carts.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <ShoppingCart className="w-24 h-24 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Giỏ hàng trống
            </h2>
            <p className="text-gray-600 mb-6">
              Hãy khám phá các nhà hàng và thêm món ăn yêu thích vào giỏ!
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Khám phá nhà hàng
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart by Restaurant */}
            {carts.map((cart) => (
              <div key={cart.cartId} className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Restaurant Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white">
                      <Store className="w-6 h-6" />
                      <div>
                        <h3 className="text-lg font-bold">
                          {cart.restaurant?.restaurantName || 'Nhà hàng'}
                        </h3>
                        {cart.restaurant?.address && (
                          <p className="text-sm opacity-90 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {cart.restaurant.address}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewRestaurant(cart.restaurantId)}
                      className="px-4 py-2 bg-white text-amber-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <span>Xem nhà hàng</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Cart Items */}
                <div className="p-4 space-y-3">
                  {cart.items && cart.items.length > 0 ? (
                    cart.items.map((item) => (
                    <div 
                      key={item.cartItemId}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {/* Item Image */}
                      <div className="w-20 h-20 flex-shrink-0">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.itemName}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🍽️</span>
                          </div>
                        )}
                      </div>

                      {/* Item Info */}
                      <div className="flex-grow">
                        <h4 className="font-semibold text-gray-800">{item.itemName}</h4>
                        {item.note && (
                          <p className="text-sm text-gray-600 italic">Ghi chú: {item.note}</p>
                        )}
                        <p className="text-amber-600 font-bold mt-1">
                          {item.price.toLocaleString('vi-VN')}đ
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(cart.cartId, item.cartItemId, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(cart.cartId, item.cartItemId, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right min-w-[100px]">
                        <p className="font-bold text-gray-800">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(cart.cartId, item.cartItemId)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Giỏ hàng trống
                    </div>
                  )}
                </div>

                {/* Restaurant Cart Summary */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-600">
                      Tổng cộng ({cart.uniqueItems} món - {cart.totalQuantity} sản phẩm)
                    </span>
                    <span className="text-xl font-bold text-amber-600">
                      {cart.totalAmount.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <button
                    onClick={() => handleCheckout(cart.restaurantId, cart.cartId)}
                    className="w-full py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold"
                  >
                    Thanh toán giỏ hàng này
                  </button>
                </div>
              </div>
            ))}

            {/* Grand Total */}
            {carts.length > 1 && (
              <div className="bg-white rounded-xl shadow-md p-6 sticky bottom-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">Tổng tất cả giỏ hàng</p>
                    <p className="text-sm text-gray-500">
                      {totalCarts} nhà hàng • {totalUniqueItems} món ({totalQuantity} sản phẩm)
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">
                    {grandTotal.toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MultiCartView;
