import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { orderService, type OrderResponseNew } from '../../services/orderService';
import { cartService } from '../../services/cartService';
import { Button } from '../../components/ui/Button/Button';
import TopNavigation from '../../components/ui/Header/Header';
import Footer from '../../components/ui/Footer/Footer';

const OrderSuccessPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useSelector((state: RootState) => state.auth);
    
    // Get orderId from query params (VNPay callback) or location state
    const orderId = searchParams.get('orderId') || (location.state as { orderId?: string })?.orderId;
    
    // Check if this is a VNPay return (has vnp_ResponseCode)
    const vnpResponseCode = searchParams.get('vnp_ResponseCode');
    const isVNPayReturn = vnpResponseCode !== null;
    
    console.log('🔍 OrderSuccessPage - VNPay Return:', isVNPayReturn);
    console.log('🔍 OrderSuccessPage - Response Code:', vnpResponseCode);
    console.log('🔍 OrderSuccessPage - OrderId:', orderId);
    
    const [order, setOrder] = useState<OrderResponseNew | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [cartCleared, setCartCleared] = useState(false);

    // Clear cart when component mounts (only once)
    useEffect(() => {
        const clearUserCart = async () => {
            if (!user?.accountId || cartCleared) return;

            try {
                await cartService.clearCart(user.accountId);
                setCartCleared(true);
            } catch {
                // Don't block the success page if cart clearing fails
            }
        };

        clearUserCart();
    }, [user?.accountId, cartCleared]);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const response = await orderService.getOrderById(orderId);
                
                if (response && response.data) {
                    setOrder(response.data as unknown as OrderResponseNew);
                }
            } catch {
                // Error fetching order
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    const getOrderStatusText = (status: string): string => {
        switch (status) {
            case 'CANCELLED': return 'Đã hủy';
            case 'PENDING': return 'Chờ thanh toán';
            case 'CONFIRMED': return 'Đã xác nhận';
            case 'DELIVERING': return 'Đang giao hàng';
            case 'COMPLETED': return 'Đã giao hàng';
            default: return 'Không xác định';
        }
    };

    const getOrderStatusColor = (status: string): string => {
        switch (status) {
            case 'CANCELLED': return 'text-red-600 bg-red-50 border-red-200';
            case 'PENDING': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'CONFIRMED': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'DELIVERING': return 'text-purple-600 bg-purple-50 border-purple-200';
            case 'COMPLETED': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <TopNavigation />
                <main className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <TopNavigation />

            <main className="flex-1 py-12">
                <div className="max-w-3xl mx-auto px-4">
                    {/* Success Icon and Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4 animate-bounce">
                            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Đặt Hàng Thành Công!</h1>
                        <p className="text-lg text-gray-600">Cảm ơn bạn đã tin tưởng và mua sắm tại FruitShop</p>
                    </div>

                    {/* Order Information Card */}
                    <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Thông Tin Đơn Hàng
                        </h2>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="text-gray-600 font-medium">Mã đơn hàng:</span>
                                <span className="font-mono font-semibold text-gray-900">{orderId || 'N/A'}</span>
                            </div>

                            {order && (
                                <>
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <span className="text-gray-600 font-medium">Tổng tiền:</span>
                                        <span className="text-2xl font-bold text-green-600">
                                            {order.finalAmount?.toLocaleString('vi-VN')} ₫
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <span className="text-gray-600 font-medium">Trạng thái thanh toán:</span>
                                        <span className="px-4 py-2 rounded-full font-semibold border text-green-600 bg-green-50 border-green-200">
                                            Đã thanh toán qua VNPay
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <span className="text-gray-600 font-medium">Trạng thái đơn hàng:</span>
                                        <span className={`px-4 py-2 rounded-full font-semibold border ${getOrderStatusColor(order.status)}`}>
                                            {getOrderStatusText(order.status)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center py-3">
                                        <span className="text-gray-600 font-medium">Phương thức thanh toán:</span>
                                        <span className="font-semibold text-gray-900">
                                            💳 VNPay
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Success Message */}
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-blue-500 rounded-lg p-6 mb-6">
                        <div className="flex items-start gap-4">
                            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="font-semibold text-gray-900 mb-2">Đơn hàng của bạn đang được xử lý</p>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    Chúng tôi sẽ xác nhận và giao hàng trong thời gian sớm nhất. 
                                    Bạn có thể theo dõi trạng thái đơn hàng trong mục "Lịch sử đơn hàng".
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button 
                            onClick={() => navigate('/customer/orders')}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg shadow-lg transform transition hover:scale-105"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Xem Lịch Sử Đơn Hàng
                            </span>
                        </Button>
                        <Button 
                            onClick={() => navigate('/')} 
                            variant="outline"
                            className="flex-1 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-4 rounded-lg"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Tiếp Tục Mua Sắm
                            </span>
                        </Button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default OrderSuccessPage;
