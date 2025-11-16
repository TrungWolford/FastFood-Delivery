import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../hooks/redux'
import LeftTaskBarFastFood from '../../components/LeftTaskBarFastFood'
import { ShoppingBag, Search, Eye, Package, Clock, RefreshCw } from 'lucide-react'
import { orderService } from '../../services/orderService'
import type { OrderResponse } from '../../services/orderService'

const FastFoodOrder: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const [authChecked, setAuthChecked] = useState(false)
  
  // State management
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shipping: 0,
    completed: 0
  })

  useEffect(() => {
    document.title = 'FastFood - Đơn hàng'
    
    // Prevent redirect when user refreshes the page (F5)
    if (!authChecked) {
      const timer = setTimeout(() => setAuthChecked(true), 200);
      return () => clearTimeout(timer);
    }
    
    if (!isAuthenticated || !user) {
      navigate('/fastfood/login')
      return
    }
    
    const userRoles = user.roles || []
    const isAdmin = userRoles.some(role => role.roleName === 'ADMIN')
    
    if (!isAdmin) {
      navigate('/fastfood/login')
      return
    }

    // Fetch orders
    fetchOrders()
  }, [authChecked, isAuthenticated, user, navigate])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await orderService.getAllOrders(0, 100)
      
      if (response.success && response.data) {
        setOrders(response.data)
        calculateStats(response.data)
      } else {
        console.error(response.message || 'Không thể tải danh sách đơn hàng')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      alert('Có lỗi xảy ra khi tải đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (orderList: OrderResponse[]) => {
    const total = orderList.length
    const pending = orderList.filter(o => o.status === 1).length
    const shipping = orderList.filter(o => o.shipping?.status === 2).length
    const completed = orderList.filter(o => o.status === 2).length
    
    setStats({ total, pending, shipping, completed })
  }

  const getStatusBadge = (status: number) => {
    const statusMap = {
      0: { label: 'Đã hủy', className: 'bg-red-100 text-red-700' },
      1: { label: 'Đang xử lý', className: 'bg-yellow-100 text-yellow-700' },
      2: { label: 'Hoàn thành', className: 'bg-green-100 text-green-700' }
    }
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap[0]
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    )
  }

  const getPaymentMethodLabel = (method: number) => {
    return method === 0 ? 'Tiền mặt (COD)' : 'Chuyển khoản'
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const handleViewOrder = (orderId: string) => {
    navigate(`/fastfood/orders/${orderId}`)
  }

  const filteredOrders = orders.filter(order => {
    const query = searchQuery.toLowerCase()
    return (
      order.orderId.toLowerCase().includes(query) ||
      order.accountName.toLowerCase().includes(query) ||
      (order.shipping?.receiverName || '').toLowerCase().includes(query)
    )
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <LeftTaskBarFastFood />
      
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-green-500" />
            Quản lý Đơn hàng
          </h1>
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Đang xử lý</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Đang giao</p>
                <p className="text-2xl font-bold text-blue-600">{stats.shipping}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Hoàn thành</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 bg-white p-4 rounded-xl shadow-md">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng theo mã, khách hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-green-500 animate-spin" />
              <span className="ml-3 text-gray-600">Đang tải...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchQuery ? 'Không tìm thấy đơn hàng phù hợp' : 'Chưa có đơn hàng nào'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Mã đơn</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Khách hàng</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Ngày đặt</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Tổng tiền</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Thanh toán</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        #{order.orderId.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{order.accountName}</div>
                          {order.shipping?.receiverName && (
                            <div className="text-xs text-gray-500">
                              Người nhận: {order.shipping.receiverName}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(order.orderDate)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getPaymentMethodLabel(order.paymentMethod)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewOrder(order.orderId)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FastFoodOrder
