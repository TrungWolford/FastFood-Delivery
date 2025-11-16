import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { orderService, type OrderResponseNew } from '../../services/orderService';
import { vnpayService } from '../../services/vnpayService';
import { toast } from '../../hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/Button/Button';
import TopNavigation from '../../components/ui/Header/Header';
import Footer from '../../components/ui/Footer/Footer';
import {
  Package,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Clock,
  XCircle,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

// Separator component
const Separator = ({ className = '' }: { className?: string }) => (
  <hr className={`border-gray-200 my-4 ${className}`} />
);

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [order, setOrder] = useState<OrderResponseNew | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  // Check if payment failed from URL params
  const paymentFailed = searchParams.get('payment') === 'failed';

  // Calculate time remaining until payment expiration
  useEffect(() => {
    if (!order?.paymentExpiresAt || order.status !== 'PENDING') {
      setTimeRemaining('');
      setIsExpired(false);
      return;
    }

    const updateTimer = () => {
      try {
        const expiresAt = new Date(order.paymentExpiresAt!).getTime();
        
        // Check if date is valid
        if (isNaN(expiresAt)) {
          setTimeRemaining('');
          setIsExpired(false);
          return;
        }

        const now = new Date().getTime();
        const diff = expiresAt - now;

        if (diff <= 0) {
          setTimeRemaining('Đã hết hạn');
          setIsExpired(true);
          return;
        }

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        setIsExpired(false);
      } catch {
        setTimeRemaining('');
        setIsExpired(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [order]);

  const loadOrderDetail = async () => {
    if (!orderId) return;

    try {
      setIsLoading(true);
      const response = await orderService.getOrderById(orderId);

      if (response.success && response.data) {
        setOrder(response.data as unknown as OrderResponseNew);

        // Show toast if payment failed
        if (paymentFailed) {
          toast({ 
            title: 'Thanh toán thất bại', 
            description: 'Vui lòng thử lại hoặc hủy đơn hàng.',
            variant: 'destructive' 
          });
        }
      } else {
        toast({ 
          title: response.message || 'Không thể tải thông tin đơn hàng',
          variant: 'destructive'
        });
        navigate('/customer/orders');
      }
    } catch {
      toast({ title: 'Đã xảy ra lỗi khi tải đơn hàng', variant: 'destructive' });
      navigate('/customer/orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authChecked) {
      const timer = setTimeout(() => setAuthChecked(true), 200);
      return () => clearTimeout(timer);
    }

    if (!isAuthenticated || !user) {
      toast({ title: 'Vui lòng đăng nhập', variant: 'destructive' });
      navigate('/');
      return;
    }

    loadOrderDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, isAuthenticated, user, orderId, navigate]);

  const handleCancelOrder = async () => {
    if (!orderId || !order) return;

    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;

    try {
      setIsProcessing(true);
      const response = await orderService.cancelOrder(orderId);

      if (response.success) {
        toast({ title: 'Đã hủy đơn hàng thành công', variant: 'success' });
        loadOrderDetail(); // Reload to update status
      } else {
        toast({ title: response.message || 'Không thể hủy đơn hàng', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Đã xảy ra lỗi khi hủy đơn hàng', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!orderId || !order) return;

    try {
      setIsProcessing(true);

      // Create new payment for this order
      const paymentResponse = await vnpayService.createPayment({
        orderId: orderId,
        amount: order.finalAmount,
        method: 'VNPay',
      });

      if (paymentResponse.success && paymentResponse.data?.paymentUrl) {
        // Redirect to VNPay
        window.location.href = paymentResponse.data.paymentUrl;
      } else {
        toast({ title: paymentResponse.message || 'Không thể tạo link thanh toán', variant: 'destructive' });
        
        // Reload order to update status if payment expired
        if (paymentResponse.message?.includes('expired') || paymentResponse.message?.includes('hết hạn')) {
          loadOrderDetail();
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tạo thanh toán';
      toast({ title: errorMessage, variant: 'destructive' });
      
      // Reload order in case of expiration error
      if (errorMessage.includes('expired') || errorMessage.includes('hết hạn')) {
        loadOrderDetail();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'DELIVERING':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ thanh toán';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'DELIVERING':
        return 'Đang giao hàng';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopNavigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopNavigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy đơn hàng</h2>
            <Button onClick={() => navigate('/customer/orders')}>Quay lại danh sách đơn hàng</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TopNavigation />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/customer/orders')} className="mb-4">
            ← Quay lại
          </Button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">Chi tiết đơn hàng</h1>
            <span className={`px-4 py-2 rounded-lg border-2 font-semibold ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>
          <p className="text-gray-600 mt-2">Mã đơn hàng: #{order.orderId}</p>
        </div>

        {/* Payment Failed Alert */}
        {paymentFailed && order.status === 'PENDING' && (
          <Card className="mb-6 border-red-300 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 mb-2">Thanh toán thất bại</h3>
                  <p className="text-red-700 mb-2">
                    Giao dịch thanh toán của bạn đã bị hủy hoặc không thành công. 
                    Vui lòng thử lại thanh toán hoặc hủy đơn hàng nếu không muốn tiếp tục.
                  </p>
                  {timeRemaining && order.paymentExpiresAt && (
                    <p className={`text-sm font-semibold mb-4 ${
                      isExpired 
                        ? 'text-red-700' 
                        : 'text-red-600'
                    }`}>
                      {isExpired 
                        ? '⏰ Thời gian thanh toán đã hết hạn. Vui lòng hủy đơn hàng này và tạo đơn mới.'
                        : `⏰ Thời gian còn lại: ${timeRemaining} phút`
                      }
                    </p>
                  )}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleRetryPayment}
                      disabled={isProcessing || isExpired}
                      className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {isExpired ? 'Không thể thanh toán lại' : 'Thanh toán lại'}
                    </Button>
                    <Button
                      onClick={handleCancelOrder}
                      disabled={isProcessing}
                      variant="destructive"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Hủy đơn hàng
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons for PENDING Orders (without payment failed alert) */}
        {order.status === 'PENDING' && !paymentFailed && (
          <Card className="mb-6 border-yellow-300 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800 mb-2">Đơn hàng đang chờ thanh toán</h3>
                  <p className="text-yellow-700 mb-2">
                    Vui lòng hoàn tất thanh toán để đơn hàng được xác nhận. 
                    Bạn có thể hủy đơn nếu không muốn tiếp tục.
                  </p>
                  {timeRemaining && order.paymentExpiresAt && (
                    <p className={`text-sm font-semibold mb-4 ${
                      isExpired 
                        ? 'text-red-600' 
                        : 'text-yellow-800'
                    }`}>
                      {isExpired 
                        ? '⏰ Thời gian thanh toán đã hết hạn. Vui lòng hủy đơn hàng này và tạo đơn mới.'
                        : `⏰ Thời gian còn lại: ${timeRemaining} phút`
                      }
                    </p>
                  )}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleRetryPayment}
                      disabled={isProcessing || isExpired}
                      className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      {isExpired ? 'Không thể thanh toán' : 'Thanh toán ngay'}
                    </Button>
                    <Button
                      onClick={handleCancelOrder}
                      disabled={isProcessing}
                      variant="outline"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Hủy đơn hàng
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Information */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Receiver Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Thông tin người nhận
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Tên người nhận</p>
                <p className="font-semibold">{order.receiverName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  Số điện thoại
                </p>
                <p className="font-semibold">{order.receiverPhone}</p>
              </div>
              {order.receiverEmail && (
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </p>
                  <p className="font-semibold">{order.receiverEmail}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Địa chỉ giao hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{order.deliveryAddress}</p>
              <p className="text-gray-600 mt-1">
                {order.ward}
              </p>
              <p className="text-gray-600">{order.city}</p>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Sản phẩm đã đặt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.orderItems.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold">{item.itemName || 'Sản phẩm'}</p>
                      <p className="text-sm text-gray-600">
                        Số lượng: {item.quantity} × {formatCurrency(item.price)}
                      </p>
                      {item.note && (
                        <p className="text-sm text-gray-500 italic mt-1">Ghi chú: {item.note}</p>
                      )}
                    </div>
                    <p className="font-semibold text-lg">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                  {index < order.orderItems.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Note */}
        {order.orderNote && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Ghi chú đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{order.orderNote}</p>
            </CardContent>
          </Card>
        )}

        {/* Payment Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Thông tin thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Tạm tính:</span>
              <span className="font-semibold">{formatCurrency(order.totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phí vận chuyển:</span>
              <span className="font-semibold">{formatCurrency(order.shippingFee)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg">
              <span className="font-bold">Tổng cộng:</span>
              <span className="font-bold text-blue-600">{formatCurrency(order.finalAmount)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Ngày tạo đơn:</p>
                <p className="font-semibold">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-600">Cập nhật lần cuối:</p>
                <p className="font-semibold">{formatDate(order.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
