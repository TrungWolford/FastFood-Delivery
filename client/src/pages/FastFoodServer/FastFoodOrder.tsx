import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../hooks/redux'
import LeftTaskBarFastFood from '../../components/LeftTaskBarFastFood'
import { ShoppingBag, Search, Eye, Package, Clock } from 'lucide-react'
import { fastfoodOrderService } from '../../services/fastfoodOrderService'
import type { OrderResponse } from '../../services/orderService'
import type { FastFoodOrderStats } from '../../types/fastfood'

const FastFoodOrder: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [stats, setStats] = useState<FastFoodOrderStats>({
    total: 0,
    pending: 0,
    processing: 0,
    shipping: 0,
    completed: 0,
    cancelled: 0,
  })

  useEffect(() => {
    document.title = 'FastFood - Đơn hàng'
    
    if (!isAuthenticated || !user) {
      navigate('/fastfood/login')
      return
    }
    
    const userRoles = user.roles || []
    const isAdmin = userRoles.some(role => role.roleName === 'ADMIN')
    
    if (!isAdmin) {
      navigate('/fastfood/login')
    }
  }, [isAuthenticated, user, navigate])

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const [ordersResponse, statsResponse] = await Promise.all([
          fastfoodOrderService.getAllOrders(0, 50),
          fastfoodOrderService.getOrderStats(),
        ])
        setOrders(ordersResponse.content)
        setStats(statsResponse)
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      const response = await fastfoodOrderService.getAllOrders(0, 50)
      setOrders(response.content)
      return
    }

    try {
      const response = await fastfoodOrderService.searchOrders(searchKeyword, 0, 50)
      setOrders(response.content)
    } catch (error) {
      console.error('Error searching orders:', error)
    }
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 2:
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
            Hoàn thành
          </span>
        )
      case 1:
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
            Đang xử lý
          </span>
        )
      default:
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
            Đã hủy
          </span>
        )
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LeftTaskBarFastFood />
      
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-green-500" />
            Quản lý Đơn hàng
          </h1>
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
                <p className="text-2xl font-bold text-yellow-600">{stats.processing}</p>
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
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        )}

        {/* Orders Table */}
        {!loading && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Mã đơn</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Khách hàng</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Ngày đặt</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Tổng tiền</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">#{order.orderId}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{order.accountName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(order.orderDate)}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatPrice(order.totalAmount)}</td>
                      <td className="px-6 py-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Không tìm thấy đơn hàng nào</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FastFoodOrder
