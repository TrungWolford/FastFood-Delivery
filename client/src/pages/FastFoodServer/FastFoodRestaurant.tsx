import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../hooks/redux'
import LeftTaskBarFastFood from '../../components/LeftTaskBarFastFood'
import { Store, Plus, Search, Edit, MapPin, Phone, X, RefreshCw, Clock, Star, Power, Eye } from 'lucide-react'
import { restaurantService, restaurantDetailService } from '../../services/restaurantService'
import type { RestaurantResponse, RestaurantDetailResponse, CreateRestaurantRequest, UpdateRestaurantRequest } from '../../services/restaurantService'
import { toast } from 'sonner'

const FastFoodRestaurant: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const [authChecked, setAuthChecked] = useState(false)
  
  // Gradient colors for restaurant cards
  const gradients = [
    'from-orange-400 to-red-500',
    'from-green-400 to-teal-500',
    'from-blue-400 to-purple-500',
    'from-pink-400 to-rose-500',
    'from-yellow-400 to-orange-500',
    'from-indigo-400 to-blue-500',
    'from-violet-400 to-purple-500',
    'from-cyan-400 to-blue-500',
    'from-emerald-400 to-green-500',
  ]
  
  // States
  const [restaurants, setRestaurants] = useState<RestaurantResponse[]>([])
  const [filteredRestaurants, setFilteredRestaurants] = useState<RestaurantResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [currentRestaurant, setCurrentRestaurant] = useState<RestaurantResponse | null>(null)
  const [restaurantDetail, setRestaurantDetail] = useState<RestaurantDetailResponse | null>(null)
  
  // Form state with all possible fields
  interface RestaurantFormData extends UpdateRestaurantRequest {
    ownerId?: string; // Only used for create
  }
  
  const [formData, setFormData] = useState<RestaurantFormData>({
    restaurantName: '',
    address: '',
    city: '',
    ward: '', // Phường/Xã
    phone: '',
    latitude: 0,
    longitude: 0,
    avatarImage: '',
    ownerId: user?.accountId || ''
  })

  useEffect(() => {
    document.title = 'FastFood - Nhà hàng'
    
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
    } else {
      fetchRestaurants()
    }
  }, [authChecked, isAuthenticated, user, navigate])

  // Fetch restaurants from API
  const fetchRestaurants = async () => {
    setIsLoading(true)
    try {
      const response = await restaurantService.getAllRestaurants(0, 100)
      if (response.success && response.data) {
        const restaurantList = response.data.content || []
        setRestaurants(restaurantList)
        setFilteredRestaurants(restaurantList)
      } else {
        toast.error(response.message || 'Không thể tải danh sách nhà hàng')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tải danh sách nhà hàng')
    } finally {
      setIsLoading(false)
    }
  }

  // Search restaurants by name or address (Frontend filtering)
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRestaurants(restaurants)
    } else {
      const filtered = restaurants.filter(restaurant =>
        restaurant.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredRestaurants(filtered)
    }
  }, [searchQuery, restaurants])

  // Open dialog for create
  const handleCreate = () => {
    setCurrentRestaurant(null)
    setFormData({
      restaurantName: '',
      address: '',
      city: '',
      ward: '', // Phường/Xã
      phone: '',
      latitude: 0,
      longitude: 0,
      avatarImage: '',
      ownerId: user?.accountId || ''
    })
    setShowDialog(true)
  }

  // Open dialog for edit
  const handleEdit = (restaurant: RestaurantResponse) => {
    setCurrentRestaurant(restaurant)
    setFormData({
      restaurantName: restaurant.restaurantName,
      address: restaurant.address,
      city: restaurant.city,
      ward: restaurant.ward, // Phường/Xã
      phone: restaurant.phone,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      avatarImage: restaurant.avatarImage
    })
    setShowDialog(true)
  }

  // Open delete confirmation
  const handleDeleteClick = (restaurant: RestaurantResponse) => {
    setCurrentRestaurant(restaurant)
    setShowDeleteDialog(true)
  }

  // Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.restaurantName?.trim()) {
      toast.error('Vui lòng nhập tên nhà hàng')
      return
    }

    if (!formData.address?.trim()) {
      toast.error('Vui lòng nhập địa chỉ nhà hàng')
      return
    }

    // Validate ownerId for create operation
    if (!currentRestaurant) {
      const ownerId = formData.ownerId || ''
      if (!ownerId || ownerId.length !== 24) {
        toast.error('Vui lòng nhập ID chủ nhà hàng hợp lệ (24 ký tự hex)')
        return
      }
      
      // Validate hex string
      if (!/^[a-f0-9]{24}$/i.test(ownerId)) {
        toast.error('ID chủ nhà hàng phải là chuỗi hex (chỉ chứa 0-9, a-f)')
        return
      }
    }

    setIsLoading(true)
    try {
      if (currentRestaurant) {
        // Update
        const updateData: UpdateRestaurantRequest = {
          restaurantName: formData.restaurantName,
          address: formData.address,
          city: formData.city,
          ward: formData.ward, // Phường/Xã
          phone: formData.phone,
          latitude: formData.latitude,
          longitude: formData.longitude,
          avatarImage: formData.avatarImage
        }
        const response = await restaurantService.updateRestaurant(currentRestaurant.restaurantId, updateData)
        if (response.success) {
          toast.success(response.message || 'Cập nhật nhà hàng thành công')
          setShowDialog(false)
          fetchRestaurants()
        } else {
          toast.error(response.message || 'Không thể cập nhật nhà hàng')
        }
      } else {
        // Create
        const createData: CreateRestaurantRequest = {
          ownerId: formData.ownerId!, // Use ownerId from form
          restaurantName: formData.restaurantName!,
          address: formData.address!,
          city: formData.city!,
          ward: formData.ward!, // Phường/Xã
          phone: formData.phone!,
          latitude: formData.latitude || 0,
          longitude: formData.longitude || 0,
          avatarImage: formData.avatarImage
        }
        
        console.log('Creating restaurant with data:', createData)
        
        const response = await restaurantService.createRestaurant(createData)
        if (response.success) {
          toast.success(response.message || 'Tạo nhà hàng thành công')
          setShowDialog(false)
          fetchRestaurants()
        } else {
          toast.error(response.message || 'Không thể tạo nhà hàng')
        }
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      toast.error('Có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  // Delete restaurant (actually toggle status)
  const handleDelete = async () => {
    if (!currentRestaurant) return

    setIsLoading(true)
    try {
      // Toggle status: if active (1) -> inactive (0), if inactive (0) -> active (1)
      const newStatus = currentRestaurant.status === 1 ? 0 : 1
      
      const response = await restaurantService.changeRestaurantStatus(
        currentRestaurant.restaurantId, 
        newStatus
      )
      
      if (response.success) {
        const statusText = newStatus === 1 ? 'kích hoạt' : 'vô hiệu hóa'
        toast.success(`Đã ${statusText} nhà hàng thành công`)
        setShowDeleteDialog(false)
        fetchRestaurants()
      } else {
        toast.error(response.message || 'Không thể cập nhật trạng thái nhà hàng')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái nhà hàng')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle view detail
  const handleViewDetail = async (restaurant: RestaurantResponse) => {
    setCurrentRestaurant(restaurant)
    setShowDetailDialog(true)
    
    // Fetch restaurant detail
    setIsLoading(true)
    try {
      const detailResponse = await restaurantDetailService.getRestaurantDetailByRestaurant(restaurant.restaurantId)
      if (detailResponse.success && detailResponse.data) {
        setRestaurantDetail(detailResponse.data)
      } else {
        setRestaurantDetail(null)
      }
    } catch (error) {
      console.error('Error fetching restaurant detail:', error)
      setRestaurantDetail(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Approve restaurant (change status from 0 to 1)
  const handleApproveRestaurant = async (restaurant: RestaurantResponse) => {
    setIsLoading(true)
    try {
      const response = await restaurantService.changeRestaurantStatus(
        restaurant.restaurantId,
        1 // Approved status
      )

      if (response.success) {
        toast.success('Đã duyệt nhà hàng thành công')
        fetchRestaurants()
        if (showDetailDialog) {
          setShowDetailDialog(false)
        }
      } else {
        toast.error(response.message || 'Không thể duyệt nhà hàng')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi duyệt nhà hàng')
    } finally {
      setIsLoading(false)
    }
  }

  // Get status display
  const getStatusDisplay = (status: number) => {
    switch (status) {
      case 0:
        return { text: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700', badge: 'bg-white/90 text-yellow-600' }
      case 1:
        return { text: 'Đã duyệt', color: 'bg-green-100 text-green-700', badge: 'bg-white/90 text-green-600' }
      default:
        return { text: 'Không xác định', color: 'bg-gray-100 text-gray-700', badge: 'bg-white/90 text-gray-600' }
    }
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
          <div className="flex gap-3">
            <button
              onClick={fetchRestaurants}
              disabled={isLoading}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-5 py-2.5 rounded-lg transition-colors shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" />
              Thêm nhà hàng
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 bg-white p-4 rounded-xl shadow-md">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm nhà hàng theo tên hoặc địa chỉ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        )}

        {/* Restaurants Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                {searchQuery ? 'Không tìm thấy nhà hàng nào' : 'Chưa có nhà hàng nào'}
              </div>
            ) : (
              filteredRestaurants.map((restaurant, index) => {
                const gradientClass = gradients[index % gradients.length]
                
                return (
                  <div 
                    key={restaurant.restaurantId} 
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                  >
                    {/* Header with gradient and store icon */}
                    <div className={`relative h-32 bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
                      <div className="absolute inset-0 bg-black opacity-10"></div>
                      <Store className="w-16 h-16 text-white relative z-10" strokeWidth={1.5} />
                      
                      {/* Status badge on top right */}
                      <div className="absolute top-3 right-3 z-10">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm ${
                          getStatusDisplay(restaurant.status || 0).badge
                        }`}>
                          ● {getStatusDisplay(restaurant.status || 0).text}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Restaurant name */}
                      <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-1">
                        {restaurant.restaurantName}
                      </h3>

                      {/* Info items */}
                      <div className="space-y-2.5 mb-4">
                        {/* Address */}
                        <div className="flex items-start gap-2.5">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600 line-clamp-2">{restaurant.address}</span>
                        </div>

                        {/* City & Ward */}
                        {restaurant.city && restaurant.ward && (
                          <div className="flex items-center gap-2.5">
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{restaurant.ward}, {restaurant.city}</span>
                          </div>
                        )}

                        {/* Phone */}
                        {restaurant.phone && (
                          <div className="flex items-center gap-2.5">
                            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{restaurant.phone}</span>
                          </div>
                        )}

                        {/* Rating */}
                        {restaurant.rating !== undefined && restaurant.rating > 0 && (
                          <div className="flex items-center gap-2.5">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-700">
                              {restaurant.rating.toFixed(1)} / 5.0
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleEdit(restaurant)}
                          className="flex items-center gap-1.5 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteClick(restaurant)}
                          className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors font-medium ${
                            restaurant.status === 1
                              ? 'text-orange-600 hover:bg-orange-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={restaurant.status === 1 ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        >
                          <Power className="w-4 h-4" />
                          {restaurant.status === 1 ? 'Tắt' : 'Bật'}
                        </button>
                        <button
                          onClick={() => handleViewDetail(restaurant)}
                          className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                          Xem
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Create/Edit Dialog */}
        {showDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {currentRestaurant ? 'Chỉnh sửa nhà hàng' : 'Thêm nhà hàng mới'}
                </h2>
                <button
                  onClick={() => setShowDialog(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* ID Chủ nhà hàng - Only show for create */}
                {!currentRestaurant && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Chủ nhà hàng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.ownerId || ''}
                      onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                      placeholder="VD: 673e7a857c70e6486e1a0f58"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
                      required
                      pattern="[a-f0-9]{24}"
                      title="ID phải là chuỗi hex 24 ký tự"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      ID phải có đúng 24 ký tự (hex string)
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên nhà hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.restaurantName || ''}
                    onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                    placeholder="VD: FastFood Chi nhánh 1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="VD: 123 Nguyễn Huệ"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thành phố <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="VD: TP.HCM"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phường/Xã <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.ward || ''}
                      onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                      placeholder="VD: Phường Bến Nghé"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="VD: 0123 456 789"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vĩ độ
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude || 0}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                      placeholder="VD: 10.762622"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kinh độ
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude || 0}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                      placeholder="VD: 106.660172"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL Ảnh đại diện
                  </label>
                  <input
                    type="text"
                    value={formData.avatarImage || ''}
                    onChange={(e) => setFormData({ ...formData, avatarImage: e.target.value })}
                    placeholder="VD: https://..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Thông tin chi tiết (giờ mở cửa, mô tả, menu) được quản lý riêng
                  </p>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowDialog(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Đang xử lý...' : currentRestaurant ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Status Toggle Confirmation Dialog */}
        {showDeleteDialog && currentRestaurant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {currentRestaurant.status === 1 ? 'Vô hiệu hóa nhà hàng' : 'Kích hoạt nhà hàng'}
                </h2>
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn <strong>
                  {currentRestaurant.status === 1 ? 'vô hiệu hóa' : 'kích hoạt'}
                </strong> nhà hàng <strong>{currentRestaurant.restaurantName}</strong>?
                <br />
                {currentRestaurant.status === 1 ? (
                  <span className="text-sm text-orange-600 mt-2 block">
                    Nhà hàng sẽ không hiển thị cho khách hàng khi bị vô hiệu hóa.
                  </span>
                ) : (
                  <span className="text-sm text-green-600 mt-2 block">
                    Nhà hàng sẽ hiển thị trở lại cho khách hàng.
                  </span>
                )}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                    currentRestaurant.status === 1
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {isLoading 
                    ? 'Đang xử lý...' 
                    : currentRestaurant.status === 1 
                      ? 'Vô hiệu hóa' 
                      : 'Kích hoạt'
                  }
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Restaurant Detail Dialog */}
        {showDetailDialog && currentRestaurant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Chi tiết nhà hàng
                </h2>
                <button
                  onClick={() => setShowDetailDialog(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Restaurant Basic Info */}
              <div className="space-y-4 mb-6 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start gap-4">
                  {currentRestaurant.avatarImage && (
                    <img
                      src={currentRestaurant.avatarImage}
                      alt={currentRestaurant.restaurantName}
                      className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800">
                      {currentRestaurant.restaurantName}
                    </h3>
                    <div className="mt-2">
                      <span className={`text-xs font-semibold rounded-full px-3 py-1 ${getStatusDisplay(currentRestaurant.status).color}`}>
                        {getStatusDisplay(currentRestaurant.status).text}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact & Location Info */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Địa chỉ</p>
                    <p className="text-sm text-gray-800">{currentRestaurant.address}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Khu vực</p>
                    <p className="text-sm text-gray-800">{currentRestaurant.ward}, {currentRestaurant.city}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Số điện thoại</p>
                    <p className="text-sm text-gray-800">{currentRestaurant.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Đánh giá</p>
                    <p className="text-sm text-gray-800 flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      {currentRestaurant.rating.toFixed(1)} / 5.0
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Tọa độ</p>
                    <p className="text-sm text-gray-800">
                      {currentRestaurant.latitude.toFixed(6)}, {currentRestaurant.longitude.toFixed(6)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Người sở hữu</p>
                    <p className="text-sm text-gray-800 font-mono">{currentRestaurant.ownerId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Ngày tạo</p>
                    <p className="text-sm text-gray-800">
                      {currentRestaurant.createdAt 
                        ? new Date(currentRestaurant.createdAt).toLocaleString('vi-VN')
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Cập nhật lần cuối</p>
                    <p className="text-sm text-gray-800">
                      {currentRestaurant.updatedAt 
                        ? new Date(currentRestaurant.updatedAt).toLocaleString('vi-VN')
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Restaurant Detail Info */}
              {restaurantDetail ? (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Thông tin chi tiết</h3>
                  
                  {/* Opening Hours */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Giờ mở cửa
                    </p>
                    <p className="text-sm text-gray-800">{restaurantDetail.openingHours || 'Chưa cập nhật'}</p>
                  </div>

                  {/* Restaurant Types */}
                  {restaurantDetail.restaurantTypes && restaurantDetail.restaurantTypes.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Loại hình</p>
                      <div className="flex flex-wrap gap-2">
                        {restaurantDetail.restaurantTypes.map((type, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cuisines */}
                  {restaurantDetail.cuisines && restaurantDetail.cuisines.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Ẩm thực</p>
                      <div className="flex flex-wrap gap-2">
                        {restaurantDetail.cuisines.map((cuisine, index) => (
                          <span key={index} className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            {cuisine}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Specialties */}
                  {restaurantDetail.specialties && restaurantDetail.specialties.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Món đặc trưng</p>
                      <div className="flex flex-wrap gap-2">
                        {restaurantDetail.specialties.map((specialty, index) => (
                          <span key={index} className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Mô tả</p>
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {restaurantDetail.description || 'Chưa có mô tả'}
                    </p>
                  </div>

                  {/* Cover Image */}
                  {restaurantDetail.coverImage && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">Ảnh bìa</p>
                      <img
                        src={restaurantDetail.coverImage}
                        alt="Cover"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}

                  {/* Menu Images */}
                  {restaurantDetail.menuImages && restaurantDetail.menuImages.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">Ảnh menu</p>
                      <div className="grid grid-cols-3 gap-2">
                        {restaurantDetail.menuImages.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Menu ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-t pt-4">
                  <p className="text-center text-gray-500 py-4">
                    Chưa có thông tin chi tiết cho nhà hàng này
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                {currentRestaurant.status === 0 && (
                  <button
                    onClick={() => handleApproveRestaurant(currentRestaurant)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Đang xử lý...' : 'Duyệt nhà hàng'}
                  </button>
                )}
                <button
                  onClick={() => setShowDetailDialog(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FastFoodRestaurant
