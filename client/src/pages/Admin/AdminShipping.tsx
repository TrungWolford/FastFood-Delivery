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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Search, Truck, Plus, Edit, Eye, RefreshCw, MapPin, Package } from 'lucide-react';
import shippingService, { SHIPPING_STATUS_LABELS } from '../../services/shippingService';
import { droneService } from '../../services/droneService';
import { locationService } from '../../services/locationService';
import { websocketService } from '../../services/websocketService';
import DeliveryMapViewer from '../../components/DeliveryMapViewer';
import type { ShippingResponse, CreateShippingRequest, UpdateShippingRequest, UpdateShippingStatusRequest, LocationPoint } from '../../types/shipping';
import { ShippingStatus } from '../../types/shipping';
import type { Drone } from '../../types/fastfood';

const SHIPPING_STATUS_OPTIONS = [
  { value: -1, label: 'Đã hủy', color: 'bg-red-600' },
  { value: 0, label: 'Chờ xử lý', color: 'bg-yellow-600' },
  { value: 1, label: 'Đang giao', color: 'bg-blue-600' },
  { value: 2, label: 'Đã giao hàng', color: 'bg-green-600' },
];

function AdminShipping() {
  const user = useSelector((state: RootState) => state.auth.user);
  const restaurantId = user?.restaurantId;

  const [shippings, setShippings] = useState<ShippingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | 'all'>('all');
  
  // Drone filter
  const [drones, setDrones] = useState<Drone[]>([]);
  const [selectedDroneId, setSelectedDroneId] = useState<string | 'all'>('all');
  const [loadingDrones, setLoadingDrones] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<ShippingResponse | null>(null);
  const [droneRealTimeLocation, setDroneRealTimeLocation] = useState<LocationPoint | null>(null);

  const [formData, setFormData] = useState<Partial<CreateShippingRequest & UpdateShippingRequest & { deliveryId?: string }>>({
    droneId: '',
    orderId: '',
    startLocation: { latitude: 0, longitude: 0 },
    endLocation: { latitude: 0, longitude: 0 },
    status: ShippingStatus.PENDING,
  });

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Load drones when component mounts
  useEffect(() => {
    const loadDrones = async () => {
      if (!restaurantId) return;
      
      setLoadingDrones(true);
      try {
        const response = await droneService.getDronesByRestaurant(restaurantId, 0, 100);
        if (response && response.content) {
          setDrones(response.content);
        }
      } catch (error) {
        console.error('Error loading drones:', error);
        toast.error('Không thể tải danh sách drone');
      } finally {
        setLoadingDrones(false);
      }
    };

    loadDrones();
  }, [restaurantId]);

  // Connect to WebSocket when component mounts
  useEffect(() => {
    console.log('🔌 Initializing WebSocket connection...');
    websocketService.connect()
      .then(() => {
        console.log('✅ WebSocket connected successfully');
      })
      .catch((error) => {
        console.error('❌ WebSocket connection failed:', error);
        toast.error('Không thể kết nối WebSocket cho real-time tracking');
      });

    // Cleanup: disconnect when component unmounts
    return () => {
      console.log('🔌 Disconnecting WebSocket...');
      websocketService.disconnect();
    };
  }, []);

  // Subscribe to drone location updates when viewing a shipping with DELIVERING status
  useEffect(() => {
    if (!selectedShipping || 
        !isViewDialogOpen || 
        selectedShipping.status !== ShippingStatus.DELIVERING || 
        !selectedShipping.droneId) {
      return;
    }

    console.log('📡 Subscribing to drone location updates:', selectedShipping.droneId);
    
    const unsubscribe = websocketService.subscribeToDroneLocation(
      selectedShipping.droneId,
      (location) => {
        console.log('📍 Real-time location update received:', location);
        setDroneRealTimeLocation({
          latitude: location.latitude,
          longitude: location.longitude
        });
      }
    );

    // Cleanup: unsubscribe when dialog closes or shipping changes
    return () => {
      console.log('📡 Unsubscribing from drone location updates');
      unsubscribe();
    };
  }, [selectedShipping, isViewDialogOpen]);

  const loadShippings = async () => {
    if (!restaurantId) {
      console.warn('Restaurant ID not found');
      setShippings([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let allDeliveries: ShippingResponse[] = [];
      
      // If a specific drone is selected, load deliveries for that drone
      if (selectedDroneId && selectedDroneId !== 'all') {
        console.log('Loading deliveries for drone:', selectedDroneId, 'restaurant:', restaurantId);
        const result = await shippingService.getShippingsByDroneAndRestaurant(
          selectedDroneId,
          restaurantId
        );
        
        if (result.success && result.data) {
          allDeliveries = result.data;
          console.log('Loaded deliveries:', allDeliveries.length);
        } else {
          console.error('Failed to load deliveries:', result.message);
          // Only show error if it's not just "no deliveries found"
          if (result.message && !result.message.includes('không tìm thấy')) {
            toast.error(result.message || 'Không thể tải deliveries');
          }
          allDeliveries = [];
        }
      } else {
        // Load deliveries for all drones in the restaurant
        const droneIds = drones.map(d => d.droneId);
        
        if (droneIds.length === 0) {
          allDeliveries = [];
        } else {
          // Load deliveries for each drone and combine
          console.log('Loading deliveries for all drones:', droneIds.length);
          const promises = droneIds.map(droneId =>
            shippingService.getShippingsByDroneAndRestaurant(droneId, restaurantId)
              .catch(err => {
                console.error('Error loading deliveries for drone:', droneId, err);
                return { success: false, data: [] };
              })
          );
          
          const results = await Promise.all(promises);
          allDeliveries = results
            .filter(r => r.success && r.data)
            .flatMap(r => r.data || []);
          
          console.log('Total deliveries loaded:', allDeliveries.length);
        }
      }
      
      // Apply filters
      let list = allDeliveries;
      
      if (statusFilter !== 'all') {
        list = list.filter((s: ShippingResponse) => s.status === statusFilter);
      }
      
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase();
        list = list.filter((s: ShippingResponse) => 
          s.deliveryId?.toLowerCase().includes(searchLower) ||
          s.orderId?.toLowerCase().includes(searchLower) ||
          s.droneId?.toLowerCase().includes(searchLower)
        );
      }
      
      setShippings(list);
      setTotalItems(list.length);
      setTotalPages(Math.max(1, Math.ceil(list.length / itemsPerPage)));
    } catch (error) {
      console.error('Error loading shippings:', error);
      toast.error('Lỗi khi tải danh sách vận chuyển');
      setShippings([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId && drones.length > 0) {
      loadShippings();
    }
  }, [currentPage, debouncedSearchTerm, statusFilter, restaurantId, selectedDroneId, drones]);

  const shippingStats = {
    total: shippings.length,
    cancelled: shippings.filter((s) => s.status === ShippingStatus.CANCELLED).length,
    pending: shippings.filter((s) => s.status === ShippingStatus.PENDING).length,
    delivering: shippings.filter((s) => s.status === ShippingStatus.DELIVERING).length,
    delivered: shippings.filter((s) => s.status === ShippingStatus.DELIVERED).length,
  };

  const handleView = async (shipping: ShippingResponse) => {
    setSelectedShipping(shipping);
    setDroneRealTimeLocation(null); // Reset previous location
    setIsViewDialogOpen(true);

    // Fetch real-time drone location if status is DELIVERING
    if (shipping.status === ShippingStatus.DELIVERING && shipping.droneId) {
      try {
        console.log('📍 Fetching real-time location for drone:', shipping.droneId);
        const response = await locationService.getDroneLocation(shipping.droneId);
        if (response.success && response.data) {
          setDroneRealTimeLocation({
            latitude: response.data.latitude,
            longitude: response.data.longitude
          });
          console.log('✅ Real-time location fetched:', response.data);
        } else {
          console.log('⚠️ No location data available for this drone');
        }
      } catch (error) {
        console.error('❌ Error fetching drone location:', error);
        // Don't show error toast, just log it
      }
    }
  };

  const openCreateDialog = () => {
    setFormData({ 
      droneId: '',
      orderId: '',
      startLocation: { latitude: 0, longitude: 0 },
      endLocation: { latitude: 0, longitude: 0 },
      status: ShippingStatus.PENDING,
    });
    setIsCreateDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!formData.droneId || !formData.orderId) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const createRequest: CreateShippingRequest = {
        droneId: formData.droneId as string,
        orderId: formData.orderId as string,
        startLocation: formData.startLocation as LocationPoint,
        endLocation: formData.endLocation as LocationPoint,
        status: formData.status as ShippingStatus,
      };
      
      const result = await shippingService.createShipping(createRequest);
      if (result.success) {
        toast.success('Tạo vận chuyển thành công');
        setIsCreateDialogOpen(false);
        loadShippings();
      } else {
        toast.error(result.message || 'Tạo vận chuyển thất bại');
      }
    } catch (error) {
      console.error('Create shipping error:', error);
      toast.error('Tạo vận chuyển thất bại');
    }
  };

  const openEditDialog = (shipping: ShippingResponse) => {
    setSelectedShipping(shipping);
    setFormData({
      deliveryId: shipping.deliveryId,
      orderId: shipping.orderId,
      startLocation: shipping.startLocation,
      endLocation: shipping.endLocation,
      status: shipping.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedShipping) return;
    
    try {
      const updateData: UpdateShippingRequest = {
        orderId: formData.orderId,
        startLocation: formData.startLocation,
        endLocation: formData.endLocation,
        status: formData.status,
      };
      
      const result = await shippingService.updateShipping(selectedShipping.deliveryId, updateData);
      if (result.success) {
        toast.success('Cập nhật vận chuyển thành công');
        setIsEditDialogOpen(false);
        setSelectedShipping(null);
        loadShippings();
      } else {
        toast.error(result.message || 'Cập nhật vận chuyển thất bại');
      }
    } catch (error) {
      console.error('Update shipping error:', error);
      toast.error('Cập nhật vận chuyển thất bại');
    }
  };

  const handleChangeStatus = async (shipping: ShippingResponse) => {
    try {
      const newStatus = shipping.status === ShippingStatus.DELIVERED ? ShippingStatus.PENDING : ShippingStatus.DELIVERED;
      const result = await shippingService.updateShippingStatus(shipping.deliveryId, { status: newStatus });
      if (result.success) {
        toast.success('Thay đổi trạng thái thành công');
        loadShippings();
      } else {
        toast.error(result.message || 'Thay đổi trạng thái thất bại');
      }
    } catch (error) {
      console.error('Change status error:', error);
      toast.error('Thay đổi trạng thái thất bại');
    }
  };

  const formatLocation = (loc?: LocationPoint) => {
    if (!loc) return 'N/A';
    return `${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}`;
  };
  const formatDate = (date?: string | Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('vi-VN');
  };

  if (!restaurantId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LeftTaskbar />
        <div className="ml-64 p-4">
          <div className="mb-3">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-500" /> Quản lý Vận chuyển
            </h1>
          </div>
          <div className="bg-white shadow-sm border border-gray-200 p-8 rounded-lg text-center">
            <Truck className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-700">Không tìm thấy thông tin nhà hàng</p>
            <p className="text-sm text-gray-500 mt-2">Vui lòng đăng nhập lại hoặc liên hệ quản trị viên.</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: number) => {
    const option = SHIPPING_STATUS_OPTIONS.find(opt => opt.value === status);
    return option?.color || 'bg-gray-600';
  };

  const getStatusLabel = (status: number) => {
    return SHIPPING_STATUS_LABELS[status as ShippingStatus] || 'Không xác định';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LeftTaskbar />
      <div className="ml-64 p-4">
        <div className="mb-3">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-500" /> Quản lý Vận chuyển
          </h1>
          <p className="text-gray-600 mt-0.5 text-base">Quản lý các đơn vận chuyển của nhà hàng</p>
        </div>

        <div className="bg-slate-800 shadow-sm border border-slate-700 p-3 mb-3 rounded-lg">
          <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
            <div className="flex gap-2 flex-1">
              <div className="relative max-w-xs">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm vận chuyển..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 py-2 text-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-amber-500 rounded-md"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-44 border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 rounded-md">
                    {statusFilter === 'all' ? 'Tất cả trạng thái' : getStatusLabel(statusFilter as number)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border-gray-200 shadow-lg">
                  <DropdownMenuItem onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}>Tất cả trạng thái</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setStatusFilter(ShippingStatus.CANCELLED); setCurrentPage(1); }}>Đã hủy</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setStatusFilter(ShippingStatus.PENDING); setCurrentPage(1); }}>Chờ xử lý</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setStatusFilter(ShippingStatus.DELIVERING); setCurrentPage(1); }}>Đang giao</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setStatusFilter(ShippingStatus.DELIVERED); setCurrentPage(1); }}>Đã giao hàng</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Drone Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-44 border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 rounded-md">
                    {loadingDrones ? 'Đang tải...' : selectedDroneId === 'all' ? 'Tất cả Drone' : drones.find(d => d.droneId === selectedDroneId)?.model || 'Chọn Drone'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border-gray-200 shadow-lg max-h-60 overflow-y-auto">
                  <DropdownMenuItem onClick={() => { setSelectedDroneId('all'); setCurrentPage(1); }}>
                    Tất cả Drone
                  </DropdownMenuItem>
                  {drones.map(drone => (
                    <DropdownMenuItem 
                      key={drone.droneId} 
                      onClick={() => { setSelectedDroneId(drone.droneId); setCurrentPage(1); }}
                    >
                      {drone.model} - {drone.status}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={openCreateDialog} className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Thêm Vận chuyển
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600">Tổng số</div>
            <div className="text-2xl font-bold text-gray-900">{shippingStats.total}</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600">Đã hủy</div>
            <div className="text-2xl font-bold text-red-600">{shippingStats.cancelled}</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600">Chờ xử lý</div>
            <div className="text-2xl font-bold text-yellow-600">{shippingStats.pending}</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600">Đang giao</div>
            <div className="text-2xl font-bold text-blue-600">{shippingStats.delivering}</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600">Đã giao</div>
            <div className="text-2xl font-bold text-green-600">{shippingStats.delivered}</div>
          </div>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 overflow-hidden rounded-lg">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-slate-800 hover:bg-slate-800 border-b border-slate-700">
                  <TableHead className="font-semibold text-white px-4 py-3 text-center text-sm w-32">Mã Delivery</TableHead>
                  <TableHead className="font-semibold text-white px-4 py-3 text-center text-sm w-32">Mã Order</TableHead>
                  <TableHead className="font-semibold text-white px-4 py-3 text-center text-sm w-32">Mã Drone</TableHead>
                  <TableHead className="font-semibold text-white px-4 py-3 text-center text-sm w-28">Điểm đầu</TableHead>
                  <TableHead className="font-semibold text-white px-4 py-3 text-center text-sm w-28">Điểm cuối</TableHead>
                  <TableHead className="font-semibold text-white px-4 py-3 text-center text-sm w-32">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-white px-4 py-3 text-center text-sm w-40">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, idx) => (
                    <TableRow key={`s-${idx}`}>
                      <TableCell className="px-4 py-3"><div className="flex justify-center"><Skeleton className="h-6 w-24 rounded" /></div></TableCell>
                      <TableCell className="px-4 py-3 text-center"><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="px-4 py-3 text-center"><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="px-4 py-3 text-center"><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell className="px-4 py-3 text-center"><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell className="px-4 py-3 text-center"><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
                      <TableCell className="px-4 py-3 text-center"><Skeleton className="h-8 w-32 rounded" /></TableCell>
                    </TableRow>
                  ))
                ) : shippings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                      <Truck className="w-16 h-16 mx-auto mb-3 text-gray-400" />
                      <p className="text-lg font-medium">Không tìm thấy vận chuyển</p>
                      <p className="text-sm text-gray-400 mt-1">Thử thay đổi bộ lọc hoặc thêm vận chuyển mới</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  shippings.map((shipping) => (
                    <TableRow key={shipping.deliveryId} className="transition-all duration-200 cursor-pointer hover:bg-blue-50/50">
                      <TableCell className="px-4 py-3 text-center">
                        <div className="flex justify-center">
                          <div className="px-2 py-1 bg-amber-100 rounded flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5 text-amber-600" />
                            <span className="text-xs font-bold text-amber-600">#{shipping.deliveryId.substring(0, 8)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-gray-700">#{shipping.orderId.substring(0, 8)}</span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-gray-700">#{shipping.droneId.substring(0, 8)}</span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-xs">{formatLocation(shipping.startLocation)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-xs">{formatLocation(shipping.endLocation)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <Badge variant="default" className={`px-2 py-1 text-xs font-medium ${getStatusColor(shipping.status)} text-white`}>
                          {getStatusLabel(shipping.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleView(shipping)} className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 py-1.5 rounded-md">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(shipping)} className="bg-amber-50 hover:bg-amber-100 text-amber-600 px-2 py-1.5 rounded-md">
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleChangeStatus(shipping)} className="bg-slate-50 hover:bg-slate-100 text-slate-700 px-2 py-1.5 rounded-md">
                            <RefreshCw className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/50">
                <div className="text-sm text-gray-600 font-medium">Hiển thị trang {currentPage} trên {totalPages} (Tổng: {totalItems} vận chuyển)</div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1">Prev</Button>
                  <Button variant="ghost" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1">Next</Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chi tiết Vận chuyển</DialogTitle>
              <DialogDescription>Thông tin chi tiết về đơn vận chuyển</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Delivery Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <strong className="text-gray-600">Mã Delivery:</strong>
                  <span className="text-gray-800 font-mono text-sm">{selectedShipping?.deliveryId}</span>
                </div>
                <div className="flex justify-between">
                  <strong className="text-gray-600">Mã Order:</strong>
                  <span className="text-gray-800 font-mono text-sm">{selectedShipping?.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <strong className="text-gray-600">Mã Drone:</strong>
                  <span className="text-gray-800 font-mono text-sm">{selectedShipping?.droneId}</span>
                </div>
                <div className="flex justify-between">
                  <strong className="text-gray-600">Trạng thái:</strong>
                  <Badge className={`${getStatusColor(selectedShipping?.status || 0)} text-white`}>
                    {getStatusLabel(selectedShipping?.status || 0)}
                  </Badge>
                </div>
                <div className="flex justify-between md:col-span-2">
                  <strong className="text-gray-600">Giao lúc:</strong>
                  <span className="text-gray-700 text-sm">{formatDate(selectedShipping?.deliveredAt)}</span>
                </div>
              </div>

              {/* Location Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <strong className="text-green-700">Điểm xuất phát (Restaurant)</strong>
                  </div>
                  <p className="text-sm text-gray-700">{formatLocation(selectedShipping?.startLocation)}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <strong className="text-red-700">Điểm đến (Customer)</strong>
                  </div>
                  <p className="text-sm text-gray-700">{formatLocation(selectedShipping?.endLocation)}</p>
                </div>
              </div>

              {/* Real-time Map Viewer */}
              {selectedShipping && selectedShipping.startLocation && selectedShipping.endLocation && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    Bản đồ theo dõi giao hàng
                    {selectedShipping.status === ShippingStatus.DELIVERING && (
                      <span className="text-sm font-normal text-blue-600">(Real-time WebSocket)</span>
                    )}
                  </h3>
                  <DeliveryMapViewer
                    startLocation={selectedShipping.startLocation}
                    endLocation={selectedShipping.endLocation}
                    droneLocation={droneRealTimeLocation || undefined}
                    droneId={selectedShipping.droneId}
                    enableRealtime={selectedShipping.status === ShippingStatus.DELIVERING}
                    height="450px"
                  />
                </div>
              )}
            </div>
            
            <DialogFooter><Button onClick={() => setIsViewDialogOpen(false)}>Đóng</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm Vận chuyển</DialogTitle>
              <DialogDescription>Tạo đơn vận chuyển mới</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-3 mt-2">
              <div>
                <label className="text-sm font-medium">Mã Drone</label>
                <Input 
                  value={formData.droneId || ''} 
                  onChange={(e) => setFormData((s) => ({ ...s, droneId: e.target.value }))} 
                  placeholder="Nhập ID drone" 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Mã Order</label>
                <Input 
                  value={formData.orderId || ''} 
                  onChange={(e) => setFormData((s) => ({ ...s, orderId: e.target.value }))} 
                  placeholder="Nhập ID order" 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Điểm đầu - Latitude</label>
                <Input 
                  type="number" 
                  step="0.000001"
                  value={formData.startLocation?.latitude ?? 0} 
                  onChange={(e) => setFormData((s) => ({ 
                    ...s, 
                    startLocation: { 
                      latitude: Number(e.target.value), 
                      longitude: s.startLocation?.longitude ?? 0 
                    } 
                  }))} 
                  placeholder="VD: 10.762622"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Điểm đầu - Longitude</label>
                <Input 
                  type="number" 
                  step="0.000001"
                  value={formData.startLocation?.longitude ?? 0} 
                  onChange={(e) => setFormData((s) => ({ 
                    ...s, 
                    startLocation: { 
                      latitude: s.startLocation?.latitude ?? 0,
                      longitude: Number(e.target.value) 
                    } 
                  }))} 
                  placeholder="VD: 106.660172"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Điểm cuối - Latitude</label>
                <Input 
                  type="number" 
                  step="0.000001"
                  value={formData.endLocation?.latitude ?? 0} 
                  onChange={(e) => setFormData((s) => ({ 
                    ...s, 
                    endLocation: { 
                      latitude: Number(e.target.value),
                      longitude: s.endLocation?.longitude ?? 0 
                    } 
                  }))} 
                  placeholder="VD: 10.775622"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Điểm cuối - Longitude</label>
                <Input 
                  type="number" 
                  step="0.000001"
                  value={formData.endLocation?.longitude ?? 0} 
                  onChange={(e) => setFormData((s) => ({ 
                    ...s, 
                    endLocation: { 
                      latitude: s.endLocation?.latitude ?? 0,
                      longitude: Number(e.target.value) 
                    } 
                  }))} 
                  placeholder="VD: 106.678172"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Trạng thái</label>
                <Select 
                  value={String(formData.status ?? ShippingStatus.PENDING)} 
                  onValueChange={(value) => setFormData((s) => ({ ...s, status: Number(value) as ShippingStatus }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIPPING_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsCreateDialogOpen(false)} variant="ghost">Hủy</Button>
              <Button onClick={handleCreate}>Tạo</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cập nhật Vận chuyển</DialogTitle>
              <DialogDescription>Chỉnh sửa thông tin vận chuyển</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-3 mt-2">
              <div>
                <label className="text-sm font-medium">Mã Order</label>
                <Input 
                  value={formData.orderId || ''} 
                  onChange={(e) => setFormData((s) => ({ ...s, orderId: e.target.value }))} 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Điểm đầu - Latitude</label>
                <Input 
                  type="number" 
                  step="0.000001"
                  value={formData.startLocation?.latitude ?? 0} 
                  onChange={(e) => setFormData((s) => ({ 
                    ...s, 
                    startLocation: { 
                      latitude: Number(e.target.value), 
                      longitude: s.startLocation?.longitude ?? 0 
                    } 
                  }))} 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Điểm đầu - Longitude</label>
                <Input 
                  type="number" 
                  step="0.000001"
                  value={formData.startLocation?.longitude ?? 0} 
                  onChange={(e) => setFormData((s) => ({ 
                    ...s, 
                    startLocation: { 
                      latitude: s.startLocation?.latitude ?? 0,
                      longitude: Number(e.target.value) 
                    } 
                  }))} 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Điểm cuối - Latitude</label>
                <Input 
                  type="number" 
                  step="0.000001"
                  value={formData.endLocation?.latitude ?? 0} 
                  onChange={(e) => setFormData((s) => ({ 
                    ...s, 
                    endLocation: { 
                      latitude: Number(e.target.value),
                      longitude: s.endLocation?.longitude ?? 0 
                    } 
                  }))} 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Điểm cuối - Longitude</label>
                <Input 
                  type="number" 
                  step="0.000001"
                  value={formData.endLocation?.longitude ?? 0} 
                  onChange={(e) => setFormData((s) => ({ 
                    ...s, 
                    endLocation: { 
                      latitude: s.endLocation?.latitude ?? 0,
                      longitude: Number(e.target.value) 
                    } 
                  }))} 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Trạng thái</label>
                <Select 
                  value={String(formData.status ?? ShippingStatus.PENDING)} 
                  onValueChange={(value) => setFormData((s) => ({ ...s, status: Number(value) as ShippingStatus }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIPPING_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsEditDialogOpen(false)} variant="ghost">Hủy</Button>
              <Button onClick={handleUpdate}>Lưu</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}

export default AdminShipping;
