import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../hooks/redux'
import { mockProducts, mockCategories, mockAccounts } from '../../hooks/data'
import LeftTaskBarFastFood from '../../components/LeftTaskBarFastFood'
import { 
  BarChart, 
  Package, 
  Users, 
  Tags, 
  TrendingUp,
  DollarSign,
  Eye,
  AlertTriangle,
  ShoppingBag,
  Star
} from 'lucide-react'

const FastFoodDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)

  useEffect(() => {
    document.title = 'FastFood - Dashboard'
    
    // Check if user is authenticated and has ADMIN role
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

  const totalProducts = mockProducts.length
  const activeProducts = mockProducts.filter(p => p.status === 1).length
  const totalCategories = mockCategories.filter(c => c.status === 1).length
  const totalUsers = mockAccounts.filter(a => a.roles?.some(role => role.roleName === 'CUSTOMER')).length
  const totalRevenue = mockProducts.reduce((sum, p) => sum + (p.price * (p.stock > 100 ? 10 : p.stock > 50 ? 5 : 2)), 0)

  const stats = [
    {
      title: 'Tổng món ăn',
      value: totalProducts,
      icon: Package,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      title: 'Món ăn đang bán',
      value: activeProducts,
      icon: Eye,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Danh mục',
      value: totalCategories,
      icon: Tags,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Khách hàng',
      value: totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    }
  ]

  const recentProducts = mockProducts.slice(0, 5)
  const lowStockProducts = mockProducts.filter(p => p.stock < 20 && p.status === 1)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LeftTaskBarFastFood />
      
      <div className="ml-64 p-4">
        {/* Header */}
        <div className="mb-3">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-orange-500" />
            Dashboard
          </h1>
          <p className="text-gray-600 mt-0.5 text-base">Tổng quan hệ thống quản lý FastFood</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-full`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Revenue Card & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Card */}
          <div className="lg:col-span-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm mb-1">Doanh thu ước tính</p>
                <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">+15.3% so với tháng trước</span>
                </div>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Thao tác nhanh</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/admin/products')}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-all group"
              >
                <Package className="w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-gray-700">Quản lý món ăn</span>
              </button>
              <button 
                onClick={() => navigate('/admin/categories')}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all group"
              >
                <Tags className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-gray-700">Quản lý danh mục</span>
              </button>
              <button 
                onClick={() => navigate('/admin/orders')}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all group"
              >
                <ShoppingBag className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-gray-700">Quản lý đơn hàng</span>
              </button>
              <button 
                onClick={() => navigate('/admin/ratings')}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-all group"
              >
                <Star className="w-5 h-5 text-yellow-600 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-gray-700">Đánh giá</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Products & Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Products */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-500" />
                Món ăn mới nhất
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentProducts.map((product) => (
                  <div key={product.productId} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{product.productName}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{product.description || 'Món ăn ngon'}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-medium text-green-600">{formatPrice(product.price)}</p>
                      <p className="text-sm text-gray-500">
                        <span className={product.stock > 50 ? 'text-green-600' : product.stock > 20 ? 'text-yellow-600' : 'text-red-600'}>
                          Kho: {product.stock}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Cảnh báo tồn kho thấp
              </h3>
            </div>
            <div className="p-6">
              {lowStockProducts.length > 0 ? (
                <div className="space-y-4">
                  {lowStockProducts.slice(0, 5).map((product) => (
                    <div key={product.productId} className="flex items-center justify-between p-3 hover:bg-red-50 rounded-lg transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{product.productName}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{product.description || 'Món ăn ngon'}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-medium text-red-600">
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            Còn {product.stock}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500">{formatPrice(product.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                    <Package className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-gray-600 font-medium">Tất cả món ăn đều có tồn kho đủ</p>
                  <p className="text-sm text-gray-500 mt-1">Không có món nào cần nhập thêm</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đơn hàng hôm nay</p>
                <p className="text-2xl font-bold text-gray-800">127</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+8% so với hôm qua</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đánh giá trung bình</p>
                <p className="text-2xl font-bold text-gray-800">4.8 ⭐</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+0.2 điểm</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Khách hàng mới</p>
                <p className="text-2xl font-bold text-gray-800">+23</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>Tuần này</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FastFoodDashboard
