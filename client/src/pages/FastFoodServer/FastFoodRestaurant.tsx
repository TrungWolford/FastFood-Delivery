import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../hooks/redux'
import LeftTaskBarFastFood from '../../components/LeftTaskBarFastFood'
import { Store, Plus, Search, Edit, Trash2, MapPin, Phone } from 'lucide-react'
import { restaurantService } from '../../services/restaurantService'
import type { Restaurant } from '../../types/fastfood'

const FastFoodRestaurant: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')

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

  // Fetch restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true)
        const response = await restaurantService.getAllRestaurants(0, 50)
        setRestaurants(response.content)
      } catch (error) {
        console.error('Error fetching restaurants:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurants()
  }, [])

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      const response = await restaurantService.getAllRestaurants(0, 50)
      setRestaurants(response.content)
      return
    }

    try {
      const response = await restaurantService.searchRestaurants(searchKeyword, 0, 50)
      setRestaurants(response.content)
    } catch (error) {
      console.error('Error searching restaurants:', error)
    }
  }

  const getStatusBadge = (status: number) => {
    if (status === 1) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
          Hoạt động
        </span>
      )
    }
    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
        Bảo trì
      </span>
    )
  }

  const getGradientClass = (index: number) => {
    const gradients = [
      'from-orange-400 to-red-500',
      'from-green-400 to-teal-500',
      'from-blue-400 to-purple-500',
      'from-pink-400 to-rose-500',
      'from-cyan-400 to-blue-500',
    ]
    return gradients[index % gradients.length]
  }

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
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        )}

        {/* Restaurants Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant, index) => (
              <div key={restaurant.restaurantId} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className={`h-48 bg-gradient-to-br ${getGradientClass(index)}`}></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{restaurant.restaurantName}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{restaurant.address}, {restaurant.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Phone className="w-4 h-4" />
                      <span>{restaurant.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    {getStatusBadge(restaurant.status)}
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
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && restaurants.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Không tìm thấy nhà hàng nào</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FastFoodRestaurant
