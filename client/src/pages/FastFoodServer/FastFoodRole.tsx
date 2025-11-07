import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../hooks/redux'
import LeftTaskBarFastFood from '../../components/LeftTaskBarFastFood'
import { Shield, Plus, Search, Edit, Trash2 } from 'lucide-react'

const FastFoodRole: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)

  useEffect(() => {
    document.title = 'FastFood - Vai trò'
    
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
            <Shield className="w-8 h-8 text-green-500" />
            Quản lý Vai trò
          </h1>
          <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg transition-colors shadow-md">
            <Plus className="w-5 h-5" />
            Thêm vai trò
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 bg-white p-4 rounded-xl shadow-md">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm vai trò..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Roles Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Tên vai trò</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Mô tả</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Quyền hạn</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">1</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">ADMIN</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Quản trị viên hệ thống</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Xem tất cả</span>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Thêm</span>
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">Sửa</span>
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">Xóa</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FastFoodRole
