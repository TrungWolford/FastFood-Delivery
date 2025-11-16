// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../hooks/redux'
import LeftTaskBarFastFood from '../../components/LeftTaskBarFastFood'
import { Users, Plus, Search, Edit, Trash2, RefreshCw } from 'lucide-react'
import { userService } from '../../services/userService'
import type { UserResponse } from '../../services/userService'

const FastFoodAccount: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const [authChecked, setAuthChecked] = useState(false)
  
  // State management
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    document.title = 'FastFood - Tài khoản'
    
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

    // Fetch users
    fetchUsers()
  }, [authChecked, isAuthenticated, user, navigate])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await userService.getAllUsers(0, 100)
      
      if (response.success && response.data) {
        setUsers(response.data.content || [])
      } else {
        console.error(response.message || 'Không thể tải danh sách người dùng')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      alert('Có lỗi xảy ra khi tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
        Hoạt động
      </span>
    ) : (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
        Ngừng hoạt động
      </span>
    )
  }

  const filteredUsers = users.filter(u => {
    const query = searchQuery.toLowerCase()
    return (
      u.username.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.fullName || '').toLowerCase().includes(query) ||
      (u.phoneNumber || '').toLowerCase().includes(query)
    )
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <LeftTaskBarFastFood />
      
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Users className="w-8 h-8 text-green-500" />
            Quản lý Tài khoản
          </h1>
          <div className="flex gap-3">
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
            <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg transition-colors shadow-md">
              <Plus className="w-5 h-5" />
              Thêm tài khoản
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
                placeholder="Tìm kiếm tài khoản..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-green-500 animate-spin" />
              <span className="ml-3 text-gray-600">Đang tải...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchQuery ? 'Không tìm thấy tài khoản phù hợp' : 'Chưa có tài khoản nào'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Tên đăng nhập</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Họ tên</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Số điện thoại</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Vai trò</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((userItem) => (
                    <tr key={userItem.userId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        #{userItem.userId.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {userItem.username}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {userItem.fullName || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {userItem.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {userItem.phoneNumber || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 flex-wrap">
                          {userItem.roles.map((role) => (
                            <span
                              key={role.roleId}
                              className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700"
                            >
                              {role.roleName}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(userItem.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
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

export default FastFoodAccount
