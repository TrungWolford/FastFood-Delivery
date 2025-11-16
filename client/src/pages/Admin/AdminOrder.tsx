// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import LeftTaskbar from '../../components/LeftTaskbar';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../components/ui/dropdowns/dropdown-menu';
import { Search, Package, ChevronLeft, ChevronRight, Eye, Truck, User } from 'lucide-react';
import { orderService, type OrderResponse } from '../../services/orderService';
import { droneService } from '../../services/droneService';
import type { Drone } from '../../types/fastfood';

const AdminOrder: React.FC = () => {
    // Get user info from Redux store
    const user = useSelector((state: RootState) => state.auth.user);
    const restaurantId = user?.restaurantId;

    // Debug: Log user info
    useEffect(() => {
        console.log('👤 Current User:', user);
        console.log('🏪 Restaurant ID from user:', restaurantId);
        
        if (!restaurantId && user) {
            console.warn('⚠️ User exists but restaurantId is missing. User may not be a restaurant owner.');
        }
    }, [user, restaurantId]);

    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Drone dialog state
    const [isDroneDialogOpen, setIsDroneDialogOpen] = useState(false);
    const [availableDrones, setAvailableDrones] = useState<Drone[]>([]);
    const [selectedDroneId, setSelectedDroneId] = useState<string>('');
    const [isAssigningDrone, setIsAssigningDrone] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    // Load orders from backend
    const loadOrders = async (page: number = 0) => {
        try {
            setLoading(true);

            // Kiểm tra restaurantId
            if (!restaurantId) {
                console.error('❌ RestaurantId not found. User may not be a restaurant owner.');
                console.error('❌ User object:', user);
                
                toast.error(
                    'Không tìm thấy thông tin nhà hàng. Bạn có thể chưa đăng ký nhà hàng.',
                    { duration: 5000 }
                );
                setOrders([]);
                setLoading(false);
                return;
            }

            console.log('🏪 Loading orders for restaurant:', restaurantId);

            // Load orders by restaurant ID
            const response = await orderService.getOrdersByRestaurantId(restaurantId, page, itemsPerPage);

            console.log('🔍 Backend Response:', response);

            if (response.success && response.data) {
                setOrders(response.data);
                setTotalItems(response.totalElements || response.data.length);
                setTotalPages(response.totalPages || Math.ceil(response.data.length / itemsPerPage));
                toast.success(`Đã tải ${response.data.length} đơn hàng`);
            } else {
                toast.error(response.message || 'Không thể tải danh sách đơn hàng');
                setOrders([]);
            }
        } catch (error) {
            console.error('❌ Error loading orders:', error);
            toast.error('Có lỗi xảy ra khi tải đơn hàng');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Load orders when restaurantId is available
        if (restaurantId) {
            console.log('🔄 Loading orders for restaurant:', restaurantId);
            loadOrders(currentPage - 1);
        } else {
            console.warn('⚠️ No restaurantId available, skipping loadOrders');
            setLoading(false);
        }
    }, [currentPage, statusFilter, searchTerm, restaurantId]);

    // Format price
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    // Format date
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Get order status badge
    const getOrderStatusBadge = (status: string) => {
        const statusConfig: Record<string, { text: string; color: string }> = {
            'PENDING': { text: 'Chờ xác nhận', color: 'bg-yellow-700 border-yellow-700' },
            'CONFIRMED': { text: 'Đã xác nhận', color: 'bg-blue-700 border-blue-700' },
            'PREPARING': { text: 'Đang chuẩn bị', color: 'bg-orange-700 border-orange-700' },
            'SHIPPING': { text: 'Đang giao hàng', color: 'bg-purple-700 border-purple-700' },
            'DELIVERED': { text: 'Hoàn thành', color: 'bg-green-700 border-green-700' },
            'CANCELLED': { text: 'Đã hủy', color: 'bg-red-700 border-red-700' },
        };

        const config = statusConfig[status] || {
            text: 'Không xác định',
            color: 'bg-gray-700 border-gray-700',
        };

        return (
            <Badge
                variant="default"
                className={`px-1.5 py-0.5 text-xs font-medium text-white whitespace-nowrap ${config.color}`}
            >
                {config.text}
            </Badge>
        );
    };

    // Handle view detail
    const handleViewDetail = (order: OrderResponse) => {
        setSelectedOrder(order);
        setIsViewDialogOpen(true);
    };

    // Handle confirm order (PENDING -> CONFIRMED)
    const handleConfirmOrder = async (orderId: string) => {
        try {
            const response = await orderService.confirmOrder(orderId);
            if (response.success) {
                toast.success('Đã xác nhận đơn hàng thành công!');
                loadOrders(currentPage - 1);
                if (selectedOrder?.orderId === orderId) {
                    setSelectedOrder(response.data || null);
                }
            } else {
                toast.error(response.message || 'Không thể xác nhận đơn hàng');
            }
        } catch (error) {
            console.error('Error confirming order:', error);
            toast.error('Có lỗi xảy ra khi xác nhận đơn hàng');
        }
    };

    // Handle start preparing (CONFIRMED -> PREPARING)
    const handleStartPreparing = async (orderId: string) => {
        try {
            const response = await orderService.startPreparing(orderId);
            if (response.success) {
                toast.success('Đã bắt đầu chuẩn bị đơn hàng!');
                loadOrders(currentPage - 1);
                if (selectedOrder?.orderId === orderId) {
                    setSelectedOrder(response.data || null);
                }
            } else {
                toast.error(response.message || 'Không thể bắt đầu chuẩn bị đơn hàng');
            }
        } catch (error) {
            console.error('Error starting preparing:', error);
            toast.error('Có lỗi xảy ra khi bắt đầu chuẩn bị đơn hàng');
        }
    };

    // Load available drones for restaurant (status = "AVAILABLE")
    const loadAvailableDrones = async (restaurantId: string) => {
        try {
            console.log('🔍 Loading available drones for restaurant:', restaurantId);
            
            // Try to use the new API endpoint first
            try {
                const response = await droneService.getDronesByRestaurantAndStatus(restaurantId, 'AVAILABLE', 0, 100);
                if (response.content) {
                    console.log('✅ Available drones (from new API):', response.content);
                    setAvailableDrones(response.content);
                    if (response.content.length === 0) {
                        toast.warning('Không có drone nào sẵn sàng. Vui lòng kiểm tra lại.');
                    }
                    return;
                }
            } catch (apiError) {
                console.warn('⚠️ New API failed, falling back to filter method:', apiError);
                // Fallback to old method: get all and filter
                const allDronesResponse = await droneService.getDronesByRestaurant(restaurantId, 0, 100);
                if (allDronesResponse.content) {
                    const availableDrones = allDronesResponse.content.filter(
                        (drone) => drone.status === 'AVAILABLE'
                    );
                    console.log('✅ Available drones (filtered):', availableDrones);
                    setAvailableDrones(availableDrones);
                    if (availableDrones.length === 0) {
                        toast.warning('Không có drone nào sẵn sàng. Vui lòng kiểm tra lại.');
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error loading drones:', error);
            toast.error('Không thể tải danh sách drone. Vui lòng kiểm tra lại.');
            setAvailableDrones([]);
        }
    };

    // Handle start delivery - show drone selection dialog (PREPARING -> SHIPPING)
    const handleStartDelivery = async () => {
        if (!selectedOrder) return;
        
        // Load available drones for this restaurant
        await loadAvailableDrones(selectedOrder.restaurantId);
        setIsDroneDialogOpen(true);
    };

    // Handle assign drone and start delivery
    const handleAssignDroneAndStartDelivery = async () => {
        if (!selectedOrder) return;

        if (!selectedDroneId) {
            toast.error('Vui lòng chọn một drone!');
            return;
        }

        try {
            setIsAssigningDrone(true);

            const response = await orderService.assignDroneAndStartDelivery(
                selectedOrder.orderId,
                selectedDroneId
            );

            if (response.success) {
                // Update drone status to "IN_USE" (Đang giao)
                try {
                    await droneService.updateDroneStatus(selectedDroneId, 'IN_USE');
                    console.log('✅ Drone status updated to IN_USE');
                } catch (droneError) {
                    console.error('⚠️ Failed to update drone status:', droneError);
                    // Don't block the main flow if drone update fails
                }

                toast.success('Đã giao nhiệm vụ cho drone và bắt đầu giao hàng!');
                setIsDroneDialogOpen(false);
                setSelectedDroneId('');
                loadOrders(currentPage - 1);
                if (selectedOrder?.orderId) {
                    setSelectedOrder(response.data || null);
                }
            } else {
                toast.error(response.message || 'Không thể giao nhiệm vụ cho drone');
            }
        } catch (error) {
            console.error('Error assigning drone:', error);
            toast.error('Có lỗi xảy ra khi giao nhiệm vụ cho drone');
        } finally {
            setIsAssigningDrone(false);
        }
    };

    // Handle complete order (SHIPPING -> DELIVERED)
    const handleCompleteOrder = async (orderId: string) => {
        try {
            const order = orders.find(o => o.orderId === orderId);
            const response = await orderService.completeOrder(orderId);
            
            if (response.success) {
                // TODO: Update drone status back to "AVAILABLE" via Shipping entity
                // DroneId is now managed by Shipping/Delivery entity, not Order
                // Need to get droneId from shipping service first
                
                toast.success('Đã hoàn thành đơn hàng!');
                loadOrders(currentPage - 1);
                if (selectedOrder?.orderId === orderId) {
                    setSelectedOrder(response.data || null);
                }
            } else {
                toast.error(response.message || 'Không thể hoàn thành đơn hàng');
            }
        } catch (error) {
            console.error('Error completing order:', error);
            toast.error('Có lỗi xảy ra khi hoàn thành đơn hàng');
        }
    };

    // Handle cancel order
    const handleCancelOrder = async (orderId: string) => {
        if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
            return;
        }

        try {
            const response = await orderService.cancelOrder(orderId);
            if (response.success) {
                toast.success('Đã hủy đơn hàng thành công!');
                loadOrders(currentPage - 1);
                if (selectedOrder?.orderId === orderId) {
                    setSelectedOrder(response.data || null);
                }
            } else {
                toast.error(response.message || 'Không thể hủy đơn hàng');
            }
        } catch (error) {
            console.error('Error canceling order:', error);
            toast.error('Có lỗi xảy ra khi hủy đơn hàng');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <LeftTaskbar />

            <div className="ml-64 p-4">
                {/* Header */}
                <div className="mb-3">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Package className="w-5 h-5 text-amber-500" />
                        Quản lý đơn hàng
                    </h1>
                    <p className="text-gray-600 mt-0.5 text-base">Quản lý tất cả đơn hàng trong hệ thống</p>
                </div>

                {/* Search and Filters */}
                <div className="bg-slate-800 shadow-sm border border-slate-700 p-3 mb-3 rounded-lg">
                    <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
                        <div className="flex gap-2 flex-1">
                            <div className="relative max-w-xs">
                                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Tìm kiếm đơn hàng..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8 py-2 text-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:bg-white transition-all duration-200 rounded-md"
                                />
                            </div>

                            {/* Status Filter */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-44 border border-gray-300 bg-gray-50 text-gray-900 hover:bg-gray-100 rounded-md flex items-center justify-between"
                                    >
                                        <div className="flex items-center">
                                            {statusFilter === 'all'
                                                ? 'Tất cả'
                                                : statusFilter === '0'
                                                ? 'Đã hủy'
                                                : statusFilter === '1'
                                                ? 'Chờ xác nhận'
                                                : statusFilter === '2'
                                                ? 'Đã xác nhận'
                                                : statusFilter === '3'
                                                ? 'Đang giao'
                                                : 'Giao thành công'}
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-white border-gray-200 shadow-lg">
                                    <DropdownMenuItem
                                        onClick={() => setStatusFilter('all')}
                                        className="cursor-pointer hover:bg-gray-100"
                                    >
                                        Tất cả trạng thái
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => setStatusFilter('0')}
                                        className="cursor-pointer hover:bg-gray-100"
                                    >
                                        Đã hủy
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => setStatusFilter('1')}
                                        className="cursor-pointer hover:bg-gray-100"
                                    >
                                        Chờ xác nhận
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => setStatusFilter('2')}
                                        className="cursor-pointer hover:bg-gray-100"
                                    >
                                        Đã xác nhận
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => setStatusFilter('3')}
                                        className="cursor-pointer hover:bg-gray-100"
                                    >
                                        Đang giao
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => setStatusFilter('4')}
                                        className="cursor-pointer hover:bg-gray-100"
                                    >
                                        Giao thành công
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>                {/* Stats */}
                <div className="mb-3 grid grid-cols-1 md:grid-cols-6 gap-3">
                    <div className="bg-white p-3 rounded-lg shadow-sm border">
                        <div className="text-sm text-gray-600">Tổng đơn hàng</div>
                        <div className="text-2xl font-bold text-gray-900">{totalItems}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border">
                        <div className="text-sm text-gray-600">Chờ xác nhận</div>
                        <div className="text-2xl font-bold text-yellow-600">
                            {orders.filter((o) => o.status === 'PENDING').length}
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border">
                        <div className="text-sm text-gray-600">Đã xác nhận</div>
                        <div className="text-2xl font-bold text-blue-600">
                            {orders.filter((o) => o.status === 'CONFIRMED').length}
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border">
                        <div className="text-sm text-gray-600">Đang chuẩn bị</div>
                        <div className="text-2xl font-bold text-orange-600">
                            {orders.filter((o) => o.status === 'PREPARING').length}
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border">
                        <div className="text-sm text-gray-600">Đang giao</div>
                        <div className="text-2xl font-bold text-purple-600">
                            {orders.filter((o) => o.status === 'SHIPPING').length}
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border">
                        <div className="text-sm text-gray-600">Hoàn thành</div>
                        <div className="text-2xl font-bold text-green-600">
                            {orders.filter((o) => o.status === 'DELIVERED').length}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table className="w-full">
                            <TableHeader>
                                <TableRow className="bg-slate-800 hover:bg-slate-800 border-b border-slate-700">
                                    <TableHead className="font-semibold text-white px-4 py-3 text-center text-sm w-32">
                                        Mã đơn hàng
                                    </TableHead>
                                    <TableHead className="font-semibold text-white px-4 py-3 text-left text-sm w-40">
                                        Khách hàng
                                    </TableHead>
                                    <TableHead className="font-semibold text-white px-4 py-3 text-center text-sm w-32">
                                        Tổng tiền
                                    </TableHead>
                                    <TableHead className="font-semibold text-white px-4 py-3 text-center text-sm w-40">
                                        Ngày đặt
                                    </TableHead>
                                    <TableHead className="font-semibold text-white px-4 py-3 text-center text-sm w-32">
                                        Trạng thái
                                    </TableHead>
                                    <TableHead className="font-semibold text-white px-4 py-3 text-center text-sm w-28">
                                        Thao tác
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 10 }).map((_, index) => (
                                        <TableRow key={`skeleton-${index}`}>
                                            <TableCell className="px-4 py-3">
                                                <div className="flex justify-center">
                                                    <Skeleton className="h-6 w-24 rounded" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <Skeleton className="h-4 w-32" />
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <div className="flex justify-center">
                                                    <Skeleton className="h-4 w-28" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <div className="flex justify-center">
                                                    <Skeleton className="h-4 w-32" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <div className="flex justify-center">
                                                    <Skeleton className="h-6 w-24 rounded-full" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <div className="flex justify-center">
                                                    <Skeleton className="h-8 w-20 rounded" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : orders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                                            <Package className="w-16 h-16 mx-auto mb-3 text-gray-400" />
                                            <p className="text-lg font-medium">Không tìm thấy đơn hàng nào</p>
                                            <p className="text-sm text-gray-400 mt-1">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    orders.map((order, index) => (
                                        <TableRow
                                            key={order.orderId}
                                            className={`transition-all duration-200 cursor-pointer ${
                                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                            } hover:bg-blue-50/50`}
                                        >
                                            <TableCell className="px-4 py-3 text-center">
                                                <div className="flex justify-center">
                                                    <div 
                                                        className="px-2 py-1 bg-amber-100 rounded flex items-center gap-1.5 cursor-pointer hover:bg-amber-200 transition-colors"
                                                        title={order.orderId}
                                                    >
                                                        <Package className="w-3.5 h-3.5 text-amber-600" />
                                                        <span className="text-xs font-bold text-amber-600">
                                                            #{order.orderId.length > 8 ? order.orderId.substring(0, 8) + '...' : order.orderId}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <div className="font-medium text-gray-900">
                                                    {order.customerId || 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-center">
                                                <span className="font-semibold text-green-600">
                                                    {formatPrice(order.totalPrice)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-center text-sm text-gray-600">
                                                {formatDate(order.createdAt)}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-center">
                                                {getOrderStatusBadge(order.status)}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewDetail(order)}
                                                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-md transition-all duration-200"
                                                >
                                                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                                                    Chi tiết
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {!loading && totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/50">
                                <div className="text-sm text-gray-600 font-medium">
                                    Hiển thị{' '}
                                    <span className="font-bold text-gray-900">
                                        {(currentPage - 1) * itemsPerPage + 1}
                                    </span>{' '}
                                    -{' '}
                                    <span className="font-bold text-gray-900">
                                        {Math.min(currentPage * itemsPerPage, totalItems)}
                                    </span>{' '}
                                    / <span className="font-bold text-gray-900">{totalItems}</span> đơn hàng
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <div className="flex items-center px-4 bg-white border border-gray-300 rounded-md font-medium text-sm">
                                        Trang <span className="font-bold text-amber-600 mx-1">{currentPage}</span> /{' '}
                                        {totalPages}
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detail Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl flex items-center gap-2">
                            <span>Chi tiết đơn hàng</span>
                            <span 
                                className="text-amber-600 cursor-pointer hover:text-amber-700"
                                title={selectedOrder?.orderId}
                            >
                                #{selectedOrder?.orderId && selectedOrder.orderId.length > 8 
                                    ? selectedOrder.orderId.substring(0, 8) + '...' 
                                    : selectedOrder?.orderId}
                            </span>
                        </DialogTitle>
                        <DialogDescription>Thông tin chi tiết về đơn hàng</DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-6">
                            {/* Order Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-none">
                                    <p className="text-sm text-gray-600 mb-1">Mã đơn hàng</p>
                                    <p className="font-semibold text-amber-600" title={selectedOrder.orderId}>
                                        #{selectedOrder.orderId}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-none">
                                    <p className="text-sm text-gray-600 mb-1">Ngày đặt hàng</p>
                                    <p className="font-semibold">{formatDate(selectedOrder.createdAt)}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-none">
                                    <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
                                    {getOrderStatusBadge(selectedOrder.status)}
                                </div>
                                <div className="bg-gray-50 p-4 rounded-none">
                                    <p className="text-sm text-gray-600 mb-1">Cập nhật lần cuối</p>
                                    <p className="font-semibold">{formatDate(selectedOrder.updatedAt)}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-none">
                                    <p className="text-sm text-gray-600 mb-1">Số lượng món</p>
                                    <p className="font-semibold text-blue-600">
                                        {selectedOrder.orderItems?.length || 0} món
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-none">
                                    <p className="text-sm text-gray-600 mb-1">Tổng tiền</p>
                                    <p className="font-semibold text-green-600 text-lg">
                                        {formatPrice(selectedOrder.totalPrice)}
                                    </p>
                                </div>
                            </div>

                            {/* Customer & Delivery Info */}
                            <div>
                                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                    Thông tin giao hàng
                                </h3>
                                <div className="bg-gray-50 p-4 rounded-none space-y-2">
                                    <p>
                                        <strong>Mã khách hàng:</strong> {selectedOrder.customerId}
                                    </p>
                                    <p>
                                        <strong>Địa chỉ giao hàng:</strong> {selectedOrder.deliveryAddress}
                                    </p>
                                    {/* TODO: Get droneId from Shipping entity */}
                                    {/* <p>
                                        <strong>Drone giao hàng:</strong> <span className="text-purple-600">{selectedOrder.droneId}</span>
                                    </p> */}
                                </div>
                            </div>

                            {/* Order Items */}
                            {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                        <Package className="w-5 h-5 text-amber-600" />
                                        Món đã đặt ({selectedOrder.orderItems.length})
                                    </h3>
                                    <div className="border rounded-none overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold">
                                                        Món ăn
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-sm font-semibold">
                                                        Số lượng
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-sm font-semibold">
                                                        Đơn giá
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-sm font-semibold">
                                                        Thành tiền
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedOrder.orderItems.map((item) => (
                                                    <tr key={item.orderItemId} className="border-t hover:bg-gray-50">
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                {/* Image món ăn */}
                                                                <div className="w-16 h-16 bg-gray-200 rounded border flex-shrink-0 overflow-hidden">
                                                                    {item.imageUrl ? (
                                                                        <img 
                                                                            src={item.imageUrl} 
                                                                            alt={item.name}
                                                                            className="w-full h-full object-cover"
                                                                            onError={(e) => {
                                                                                // Fallback khi ảnh lỗi
                                                                                e.currentTarget.style.display = 'none';
                                                                                e.currentTarget.parentElement!.innerHTML = `
                                                                                    <div class="w-full h-full flex items-center justify-center bg-gray-200">
                                                                                        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                                                                        </svg>
                                                                                    </div>
                                                                                `;
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center">
                                                                            <Package className="w-8 h-8 text-gray-400" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">{item.name}</p>
                                                                    <p className="text-xs text-gray-500">ID: {item.itemId}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">{item.quantity}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            {formatPrice(item.price)}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-semibold">
                                                            {formatPrice(item.subTotal)}
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr className="border-t bg-gray-50 font-semibold">
                                                    <td colSpan={3} className="px-4 py-3 text-right">
                                                        Tổng cộng:
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-green-600 text-lg">
                                                        {formatPrice(selectedOrder.totalPrice)}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="flex justify-between items-center">
                        <div className="flex gap-2">
                            {/* Nút Xác nhận - chỉ hiện khi PENDING */}
                            {selectedOrder && selectedOrder.status === 'PENDING' && (
                                <>
                                    <Button
                                        onClick={() => handleConfirmOrder(selectedOrder.orderId)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        ✅ Xác nhận đơn
                                    </Button>
                                    <Button
                                        onClick={() => handleCancelOrder(selectedOrder.orderId)}
                                        variant="destructive"
                                    >
                                        ❌ Hủy đơn
                                    </Button>
                                </>
                            )}

                            {/* Nút Chuẩn bị - chỉ hiện khi CONFIRMED */}
                            {selectedOrder && selectedOrder.status === 'CONFIRMED' && (
                                <>
                                    <Button
                                        onClick={() => handleStartPreparing(selectedOrder.orderId)}
                                        className="bg-orange-600 hover:bg-orange-700 text-white"
                                    >
                                        🍳 Chuẩn bị món
                                    </Button>
                                    <Button
                                        onClick={() => handleCancelOrder(selectedOrder.orderId)}
                                        variant="destructive"
                                    >
                                        ❌ Hủy đơn
                                    </Button>
                                </>
                            )}

                            {/* Nút Giao hàng - chỉ hiện khi PREPARING */}
                            {selectedOrder && selectedOrder.status === 'PREPARING' && (
                                <Button
                                    onClick={() => handleStartDelivery()}
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                    � Giao hàng
                                </Button>
                            )}

                            {/* Nút Hoàn thành - chỉ hiện khi SHIPPING */}
                            {selectedOrder && selectedOrder.status === 'SHIPPING' && (
                                <Button
                                    onClick={() => handleCompleteOrder(selectedOrder.orderId)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    ✔️ Hoàn thành
                                </Button>
                            )}

                            {/* Hiển thị thông báo nếu đã hoàn thành hoặc đã hủy */}
                            {selectedOrder && selectedOrder.status === 'DELIVERED' && (
                                <span className="text-green-600 font-semibold">
                                    ✅ Đơn hàng đã hoàn thành
                                </span>
                            )}
                            {selectedOrder && selectedOrder.status === 'CANCELLED' && (
                                <span className="text-red-600 font-semibold">
                                    ❌ Đơn hàng đã bị hủy
                                </span>
                            )}
                        </div>
                        <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="rounded-md">
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Drone Selection Dialog */}
            <Dialog open={isDroneDialogOpen} onOpenChange={setIsDroneDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Truck className="w-5 h-5 text-purple-600" />
                            Chọn Drone để giao hàng
                        </DialogTitle>
                        <DialogDescription>
                            Chọn một drone có sẵn để giao đơn hàng #{selectedOrder?.orderId}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        {availableDrones.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                <p>Không có drone nào khả dụng</p>
                                <p className="text-sm mt-2">Vui lòng thêm drone hoặc chờ drone khác sẵn sàng</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {availableDrones.map((drone) => (
                                    <div
                                        key={drone.droneId}
                                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                            selectedDroneId === drone.droneId
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                        }`}
                                        onClick={() => setSelectedDroneId(drone.droneId)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-gray-900">#{drone.droneId.substring(0, 8)}</p>
                                                <p className="text-sm text-gray-600">{drone.model}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">
                                                    🔋 {drone.battery}%
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    � {drone.capacity} kg
                                                </p>
                                                <Badge className="bg-green-600 text-white mt-1">
                                                    {drone.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDroneDialogOpen(false);
                                setSelectedDroneId('');
                            }}
                            disabled={isAssigningDrone}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleAssignDroneAndStartDelivery}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            disabled={!selectedDroneId || isAssigningDrone}
                        >
                            {isAssigningDrone ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <Truck className="w-4 h-4 mr-2" />
                                    Xác nhận giao hàng
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminOrder;
