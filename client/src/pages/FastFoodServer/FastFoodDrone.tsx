import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../hooks/redux'
import LeftTaskBarFastFood from '../../components/LeftTaskBarFastFood'
import { Plane, Plus, Search, Edit, Trash2, Battery, MapPin } from 'lucide-react'
import { droneService } from '../../services/droneService'
import type { Drone } from '../../types/fastfood'

const FastFoodDrone: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const [drones, setDrones] = useState<Drone[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    delivering: 0,
    maintenance: 0,
  })

  useEffect(() => {
    document.title = 'FastFood - Drone'
    
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

  // Fetch drones
  useEffect(() => {
    const fetchDrones = async () => {
      try {
        setLoading(true)
        const [dronesResponse, statsResponse] = await Promise.all([
          droneService.getAllDrones(0, 50),
          droneService.getDroneStats(),
        ])
        setDrones(dronesResponse.content)
        setStats(statsResponse)
      } catch (error) {
        console.error('Error fetching drones:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDrones()
  }, [])

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      const response = await droneService.getAllDrones(0, 50)
      setDrones(response.content)
      return
    }

    try {
      const response = await droneService.searchDrones(searchKeyword, 0, 50)
      setDrones(response.content)
    } catch (error) {
      console.error('Error searching drones:', error)
    }
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
            Sẵn sàng
          </span>
        )
      case 2:
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
            Đang giao
          </span>
        )
      default:
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
            Bảo trì
          </span>
        )
    }
  }

  const getBatteryColor = (batteryLevel: number) => {
    if (batteryLevel >= 70) return 'text-green-600'
    if (batteryLevel >= 30) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getGradientClass = (index: number) => {
    const gradients = [
      'from-blue-400 to-cyan-500',
      'from-green-400 to-teal-500',
      'from-purple-400 to-pink-500',
      'from-orange-400 to-red-500',
      'from-indigo-400 to-blue-500',
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
            <Plane className="w-8 h-8 text-green-500" />
            Quản lý Drone
          </h1>
          <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg transition-colors shadow-md">
            <Plus className="w-5 h-5" />
            Thêm drone
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Tổng drone</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Plane className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Đang hoạt động</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Plane className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Đang giao hàng</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.delivering}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Plane className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Bảo trì</p>
                <p className="text-2xl font-bold text-red-600">{stats.maintenance}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <Plane className="w-6 h-6 text-red-600" />
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
                placeholder="Tìm kiếm drone theo mã, model..."
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

        {/* Drones Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drones.map((drone, index) => (
              <div key={drone.droneId} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className={`h-48 bg-gradient-to-br ${getGradientClass(index)} flex items-center justify-center`}>
                  <Plane className="w-24 h-24 text-white" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-800">{drone.droneCode}</h3>
                    {getStatusBadge(drone.status)}
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Model:</span>
                      <span className="font-semibold text-gray-800">{drone.model}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Pin:</span>
                      <div className="flex items-center gap-2">
                        <Battery className={`w-4 h-4 ${getBatteryColor(drone.batteryLevel)}`} />
                        <span className={`font-semibold ${getBatteryColor(drone.batteryLevel)}`}>
                          {drone.batteryLevel}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{drone.currentLocation || drone.restaurantName || 'Chưa xác định'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200">
                      <Edit className="w-4 h-4 mx-auto" />
                    </button>
                    <button className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200">
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && drones.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Không tìm thấy drone nào</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FastFoodDrone
