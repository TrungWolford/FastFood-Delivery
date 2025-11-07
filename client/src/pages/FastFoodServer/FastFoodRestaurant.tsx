import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../hooks/redux'
import LeftTaskBarFastFood from '../../components/LeftTaskBarFastFood'
import { Store, Plus, Search, Edit, Trash2, MapPin, Phone } from 'lucide-react'

const FastFoodRestaurant: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)

  useEffect(() => {
    document.title = 'FastFood - Nhà hàng'
    
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

  return (
    <div className="min-h-screen bg-gray-50">
      <LeftTaskBarFastFood />
      
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Store className="w-8 h-8 text-green-500" />
            Quản lý Nhà hàng
          </h1>
          <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg transition-colors shadow-md">
            <Plus className="w-5 h-5" />
            Thêm nhà hàng
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 bg-white p-4 rounded-xl shadow-md">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm nhà hàng..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Restaurants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-48 bg-gradient-to-br from-orange-400 to-red-500"></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">FastFood Chi nhánh 1</h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>123 Nguyễn Huệ, Q.1, TP.HCM</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Phone className="w-4 h-4" />
                  <span>0123 456 789</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                  Hoạt động
                </span>
                <div className="flex gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-48 bg-gradient-to-br from-green-400 to-teal-500"></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">FastFood Chi nhánh 2</h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>456 Lê Lợi, Q.3, TP.HCM</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Phone className="w-4 h-4" />
                  <span>0987 654 321</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                  Hoạt động
                </span>
                <div className="flex gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500"></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">FastFood Chi nhánh 3</h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>789 Trần Hưng Đạo, Q.5, TP.HCM</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Phone className="w-4 h-4" />
                  <span>0912 345 678</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
                  Bảo trì
                </span>
                <div className="flex gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FastFoodRestaurant
