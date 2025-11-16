// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, MapPin, User, Phone, Mail, CreditCard, Loader2 } from 'lucide-react';
import TopNavigation from '../../components/ui/Header/Header';
import Footer from '../../components/ui/Footer/Footer';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Combobox } from '../../components/ui/combobox';
import { useAppSelector } from '../../hooks/redux';
import { cartService } from '../../services/cartService';
import { orderService } from '../../services/orderService';
import { vnpayService } from '../../services/vnpayService';
import OpenStreetMapAutocomplete, { type SelectedAddress } from '../../components/OpenStreetMapAutocomplete';
import { toast } from 'sonner';
import { canMakePurchase, getUserRoleDisplay } from '../../utils/roleCheck';

// Shipping method options
const SHIPPING_METHODS = [
  { id: 'super_fast', name: 'Siêu tốc', fee: 50000, description: 'Giao hàng trong 2 giờ' },
  { id: 'express_4h', name: '4H Express', fee: 30000, description: 'Giao hàng trong 4 giờ' },
  { id: 'standard', name: 'Tiêu chuẩn', fee: 20000, description: 'Giao hàng trong 1-2 ngày' },
];

interface CartItemDetail {
  cartItemId: string;
  itemId: string;
  itemName: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  note?: string;
}

interface CartDetail {
  cartId: string;
  userId: string;
  restaurantId: string;
  items: CartItemDetail[];
  itemCount: number;
  totalAmount: number;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const restaurantId = searchParams.get('restaurantId');
  const cartId = searchParams.get('cartId');

  // Form state - Dùng OpenStreetMap autocomplete
  const [formData, setFormData] = useState({
    receiverName: '',
    receiverEmail: '',
    receiverPhone: '',
    deliveryAddress: '', // Địa chỉ đầy đủ từ user input
    orderNote: '',
  });

  // Lưu thông tin địa chỉ đã chọn từ OpenStreetMap (bao gồm coordinates)
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);

  // Cart & Order state
  const [cartDetail, setCartDetail] = useState<CartDetail | null>(null);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(SHIPPING_METHODS[1].id); // Mặc định 4H Express (30000đ)
  const [isProcessing, setIsProcessing] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Load cart detail function
  const loadCartDetail = useCallback(async () => {
    if (!user?.accountId || !cartId) return;

    setIsLoadingCart(true);
    try {
      // Lấy chi tiết giỏ hàng từ getAllCartsDetailByUser
      const response = await cartService.getAllCartsDetailByUser(user.accountId);
      
      if (response.success && response.data) {
        const carts = Array.isArray(response.data) ? response.data : [];
        const cart = carts.find((c: CartDetail) => c.cartId === cartId);
        
        if (cart && cart.items && cart.items.length > 0) {
          setCartDetail(cart);
        } else {
          toast.error('Giỏ hàng trống hoặc không tồn tại');
          navigate('/carts');
        }
      } else {
        toast.error('Không thể tải thông tin giỏ hàng');
        navigate('/carts');
      }
    } catch {
      toast.error('Đã xảy ra lỗi khi tải giỏ hàng');
      navigate('/carts');
    } finally {
      setIsLoadingCart(false);
    }
  }, [user?.accountId, cartId, navigate]);

  // Check authentication
  useEffect(() => {
    // Prevent redirect when user refreshes the page (F5)
    // Wait for AuthInitializer to load user from localStorage
    if (!authChecked) {
      const timer = setTimeout(() => setAuthChecked(true), 200);
      return () => clearTimeout(timer);
    }

    if (!isAuthenticated || !user) {
      toast.error('Vui lòng đăng nhập để thanh toán');
      navigate('/');
      return;
    }

    // Kiểm tra quyền mua hàng - chỉ Customer mới được phép thanh toán
    if (!canMakePurchase(user)) {
      const roleDisplay = getUserRoleDisplay(user);
      toast.error(
        `Tài khoản ${roleDisplay} không thể thanh toán đơn hàng. Chỉ khách hàng mới được phép mua hàng.`,
        { duration: 3000 }
      );
      navigate('/');
      return;
    }

    if (!restaurantId || !cartId) {
      toast.error('Thông tin giỏ hàng không hợp lệ');
      navigate('/carts');
      return;
    }

    loadCartDetail();
  }, [authChecked, isAuthenticated, user, restaurantId, cartId, navigate, loadCartDetail]);

  const getShippingFee = () => {
    const method = SHIPPING_METHODS.find(m => m.id === selectedShippingMethod);
    return method?.fee || 0;
  };

  const getTotalAmount = () => {
    if (!cartDetail) return 0;
    return cartDetail.totalAmount + getShippingFee();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const validateForm = (): boolean => {
    if (!formData.receiverName.trim()) {
      toast.error('Vui lòng nhập tên người nhận');
      return false;
    }
    if (!formData.receiverPhone.trim()) {
      toast.error('Vui lòng nhập số điện thoại');
      return false;
    }
    // Email không bắt buộc nhưng nếu có thì validate
    if (formData.receiverEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.receiverEmail)) {
      toast.error('Email không hợp lệ');
      return false;
    }
    if (!formData.deliveryAddress.trim()) {
      toast.error('Vui lòng nhập địa chỉ chi tiết');
      return false;
    }
    
    // Kiểm tra xem người dùng có chọn địa chỉ từ OpenStreetMap autocomplete không
    if (!selectedAddress) {
      toast.error('Vui lòng chọn địa chỉ từ danh sách gợi ý OpenStreetMap để đảm bảo tọa độ chính xác');
      return false;
    }
    
    return true;
  };

  const handleCheckout = async () => {
    if (!user?.accountId || !cartDetail || !restaurantId) return;

    if (!validateForm()) return;
    if (!selectedAddress) return; // Double check

    setIsProcessing(true);
    
    try {
      // Lấy thông tin từ selectedAddress (đã có coordinates từ OpenStreetMap)
      const { streetAddress, ward, city, latitude, longitude } = selectedAddress;

      // Tạo order request - sử dụng thông tin đã parse từ OpenStreetMap
      const orderRequest = {
        customerId: user.accountId,
        restaurantId: restaurantId,
        receiverName: formData.receiverName,
        receiverEmail: formData.receiverEmail || undefined,
        receiverPhone: formData.receiverPhone,
        deliveryAddress: streetAddress, // Số nhà + tên đường
        ward: ward,
        city: city,
        orderNote: formData.orderNote || undefined,
        shippingFee: getShippingFee(),
        orderItems: cartDetail.items.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
          note: item.note,
        })),
        // Thêm coordinates để backend không cần geocode lại
        customerLatitude: latitude,
        customerLongitude: longitude,
      };

      toast.success(`Địa chỉ đã được xác thực: ${city} (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`);

      // Tạo order
      const orderResponse = await orderService.createOrder(orderRequest);

      if (orderResponse.success && orderResponse.data) {
        const orderId = orderResponse.data.orderId;

        // Xóa giỏ hàng sau khi tạo order thành công
        await cartService.clearCart(user.accountId);
        window.dispatchEvent(new CustomEvent('cartUpdated'));

        // Tạo payment và redirect to VNPay
        const paymentResponse = await vnpayService.createPayment({
          orderId: orderId,
          amount: getTotalAmount(),
          method: 'VNPay',
        });

        if (paymentResponse.success && paymentResponse.data?.paymentUrl) {
          // Redirect to VNPay payment page
          window.location.href = paymentResponse.data.paymentUrl;
        } else {
          toast.error(paymentResponse.message || 'Không thể tạo link thanh toán');
          // Vẫn cho phép xem đơn hàng
          navigate(`/customer/orders`);
        }
      } else {
        toast.error(orderResponse.message || 'Không thể tạo đơn hàng');
      }
    } catch {
      toast.error('Đã xảy ra lỗi khi đặt hàng');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoadingCart) {
    return (
      <div>
        <TopNavigation />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Đang tải thông tin giỏ hàng...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!cartDetail || !cartDetail.items || cartDetail.items.length === 0) {
    return (
      <div>
        <TopNavigation />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-500 mb-6">Không có sản phẩm nào trong giỏ hàng</p>
            <Button onClick={() => navigate('/carts')} className="bg-blue-600 hover:bg-blue-700">
              Quay lại giỏ hàng
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <TopNavigation />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh toán</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form thông tin */}
            <div className="space-y-6">
              {/* Thông tin người nhận */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-6 h-6 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Thông tin người nhận</h2>
                </div>

                <div className="space-y-4">
                  {/* Tên người nhận */}
                  <div>
                    <Label htmlFor="receiverName">Họ và tên <span className="text-red-500">*</span></Label>
                    <Input
                      id="receiverName"
                      value={formData.receiverName}
                      onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      className="mt-1"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="receiverEmail">Email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="receiverEmail"
                        type="email"
                        value={formData.receiverEmail}
                        onChange={(e) => setFormData({ ...formData, receiverEmail: e.target.value })}
                        placeholder="example@email.com"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <Label htmlFor="receiverPhone">Số điện thoại <span className="text-red-500">*</span></Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="receiverPhone"
                        value={formData.receiverPhone}
                        onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
                        placeholder="0123456789"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Địa chỉ giao hàng */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-6 h-6 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Địa chỉ giao hàng</h2>
                </div>

                <div className="space-y-4">
                  {/* OpenStreetMap Autocomplete - Thay thế Vietnam Provinces */}
                  <div>
                    <OpenStreetMapAutocomplete
                      value={formData.deliveryAddress}
                      onChange={(value, address) => {
                        setFormData({ ...formData, deliveryAddress: value });
                        setSelectedAddress(address || null);
                      }}
                      placeholder="Nhập địa chỉ đầy đủ (VD: 123 Nguyễn Huệ, Quận 1, TP.HCM)"
                      required
                      countryCode="vn"
                    />
                  </div>

                  {/* Ghi chú */}
                  <div>
                    <Label htmlFor="orderNote">Ghi chú đơn hàng</Label>
                    <textarea
                      id="orderNote"
                      value={formData.orderNote}
                      onChange={(e) => setFormData({ ...formData, orderNote: e.target.value })}
                      placeholder="Ghi chú thêm cho đơn hàng (không bắt buộc)"
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Phương thức vận chuyển */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Phương thức vận chuyển</h3>
                <Combobox
                  options={SHIPPING_METHODS.map(m => ({ 
                    value: m.id, 
                    label: `${m.name} - ${formatPrice(m.fee)}`
                  }))}
                  value={selectedShippingMethod}
                  onValueChange={setSelectedShippingMethod}
                  placeholder="Chọn phương thức vận chuyển"
                  searchPlaceholder="Tìm phương thức..."
                  emptyText="Không tìm thấy phương thức vận chuyển"
                />
                <p className="text-sm text-gray-500 mt-2">
                  {SHIPPING_METHODS.find(m => m.id === selectedShippingMethod)?.description}
                </p>
              </div>
            </div>

            {/* Right Column - Đơn hàng */}
            <div className="space-y-6">
              {/* Sản phẩm */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Đơn hàng</h2>
                  <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                    {cartDetail.itemCount} sản phẩm
                  </span>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {cartDetail.items.map((item) => (
                    <div key={item.cartItemId} className="flex gap-4 pb-4 border-b">
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.itemName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ShoppingCart className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 line-clamp-2">{item.itemName}</h3>
                        <p className="text-sm text-gray-500 mt-1">Số lượng: {item.quantity}</p>
                        {item.note && (
                          <p className="text-sm text-gray-500 italic mt-1">Ghi chú: {item.note}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tổng tiền */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Chi tiết thanh toán</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-medium">{formatPrice(cartDetail.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="font-medium">{formatPrice(getShippingFee())}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Tổng cộng:</span>
                      <span className="text-red-600">{formatPrice(getTotalAmount())}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang xử lý thanh toán...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Thanh toán qua VNPay
                    </div>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Bằng việc tiến hành thanh toán, bạn đồng ý với{' '}
                  <a href="#" className="text-blue-600 hover:underline">Điều khoản dịch vụ</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;

