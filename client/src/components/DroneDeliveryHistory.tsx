import React, { useEffect, useState } from 'react';
import { Package, MapPin, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { shippingService } from '../services/shippingService';
import { SHIPPING_STATUS_LABELS, SHIPPING_STATUS_COLORS } from '../types/shipping';
import type { ShippingResponse } from '../types/shipping';

interface DroneDeliveryHistoryProps {
  droneId: string;
  restaurantId: string;
  droneName?: string;
}

/**
 * Component hiển thị lịch sử giao hàng của một drone cụ thể
 * Chỉ hiển thị các deliveries của drone thuộc nhà hàng
 */
const DroneDeliveryHistory: React.FC<DroneDeliveryHistoryProps> = ({ 
  droneId, 
  restaurantId,
  droneName = 'Drone' 
}) => {
  const [deliveries, setDeliveries] = useState<ShippingResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    delivering: 0,
    pending: 0,
    cancelled: 0
  });

  useEffect(() => {
    loadDeliveries();
  }, [droneId, restaurantId]);

  const loadDeliveries = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await shippingService.getShippingsByDroneAndRestaurant(droneId, restaurantId);
      
      if (result.success && result.data) {
        const deliveryData = result.data;
        setDeliveries(deliveryData);
        
        // Calculate statistics
        setStats({
          total: deliveryData.length,
          completed: deliveryData.filter(d => d.status === 2).length,
          delivering: deliveryData.filter(d => d.status === 1).length,
          pending: deliveryData.filter(d => d.status === 0).length,
          cancelled: deliveryData.filter(d => d.status === -1).length,
        });
      } else {
        setError(result.message || 'Không thể tải lịch sử giao hàng');
      }
    } catch (err: any) {
      console.error('Error loading deliveries:', err);
      setError('Đã xảy ra lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 2: return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 1: return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 0: return <Clock className="w-5 h-5 text-yellow-500" />;
      case -1: return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Package className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Đang tải lịch sử giao hàng...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start">
          <XCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
          <div>
            <h3 className="font-medium text-red-800">Lỗi</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button
              onClick={loadDeliveries}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          Lịch sử giao hàng - {droneName}
        </h2>
        <button
          onClick={loadDeliveries}
          className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Làm mới
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">Tổng số</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600">Hoàn thành</div>
          <div className="text-2xl font-bold text-green-700 mt-1">{stats.completed}</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600">Đang giao</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{stats.delivering}</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-600">Chờ xử lý</div>
          <div className="text-2xl font-bold text-yellow-700 mt-1">{stats.pending}</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-600">Đã hủy</div>
          <div className="text-2xl font-bold text-red-700 mt-1">{stats.cancelled}</div>
        </div>
      </div>

      {/* Deliveries List */}
      {deliveries.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Chưa có lịch sử giao hàng nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deliveries.map((delivery) => (
            <div
              key={delivery.deliveryId}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {getStatusIcon(delivery.status)}
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-800">
                        Order #{delivery.orderId.slice(-8)}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${SHIPPING_STATUS_COLORS[delivery.status]}`}
                      >
                        {SHIPPING_STATUS_LABELS[delivery.status]}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 text-green-500" />
                        <div>
                          <div className="font-medium text-gray-700">Điểm xuất phát</div>
                          <div className="text-xs text-gray-500">
                            {formatCoordinates(
                              delivery.startLocation.latitude,
                              delivery.startLocation.longitude
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 text-red-500" />
                        <div>
                          <div className="font-medium text-gray-700">Điểm đến</div>
                          <div className="text-xs text-gray-500">
                            {formatCoordinates(
                              delivery.endLocation.latitude,
                              delivery.endLocation.longitude
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{formatDate(delivery.deliveredAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-400 ml-4">
                  ID: {delivery.deliveryId.slice(-6)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DroneDeliveryHistory;
