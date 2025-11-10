import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../hooks/redux'
import LeftTaskBarFastFood from '../../components/LeftTaskBarFastFood'
import { Shield, Plus, Search, Edit, Trash2, X, RefreshCw } from 'lucide-react'
import { roleService } from '../../services/roleService'
import type { RoleResponse, UpdateRoleRequest } from '../../services/roleService'
import { toast } from 'sonner'

const FastFoodRole: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  
  // States
  const [roles, setRoles] = useState<RoleResponse[]>([])
  const [filteredRoles, setFilteredRoles] = useState<RoleResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [currentRole, setCurrentRole] = useState<RoleResponse | null>(null)
  const [formData, setFormData] = useState<UpdateRoleRequest>({
    roleName: '',
    description: ''
  })

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
    } else {
      fetchRoles()
    }
  }, [isAuthenticated, user, navigate])

  // Fetch roles from API
  const fetchRoles = async () => {
    setIsLoading(true)
    try {
      const response = await roleService.getAllRoles()
      if (response.success && response.data) {
        setRoles(response.data)
        setFilteredRoles(response.data)
      } else {
        toast.error(response.message || 'Không thể tải danh sách vai trò')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tải danh sách vai trò')
    } finally {
      setIsLoading(false)
    }
  }

  // Search roles by roleName (Frontend filtering)
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRoles(roles)
    } else {
      const filtered = roles.filter(role =>
        role.roleName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredRoles(filtered)
    }
  }, [searchQuery, roles])

  // Open dialog for create
  const handleCreate = () => {
    setCurrentRole(null)
    setFormData({ roleName: '', description: '' })
    setShowDialog(true)
  }

  // Open dialog for edit
  const handleEdit = (role: RoleResponse) => {
    setCurrentRole(role)
    setFormData({
      roleName: role.roleName,
      description: role.description || ''
    })
    setShowDialog(true)
  }

  // Open delete confirmation
  const handleDeleteClick = (role: RoleResponse) => {
    setCurrentRole(role)
    setShowDeleteDialog(true)
  }

  // Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.roleName.trim()) {
      toast.error('Vui lòng nhập tên vai trò')
      return
    }

    setIsLoading(true)
    try {
      if (currentRole) {
        // Update
        const response = await roleService.updateRole(currentRole.roleId, formData)
        if (response.success) {
          toast.success(response.message || 'Cập nhật vai trò thành công')
          setShowDialog(false)
          fetchRoles()
        } else {
          toast.error(response.message || 'Không thể cập nhật vai trò')
        }
      } else {
        // Create
        const response = await roleService.createRole(formData)
        if (response.success) {
          toast.success(response.message || 'Tạo vai trò thành công')
          setShowDialog(false)
          fetchRoles()
        } else {
          toast.error(response.message || 'Không thể tạo vai trò')
        }
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  // Delete role
  const handleDelete = async () => {
    if (!currentRole) return

    setIsLoading(true)
    try {
      const response = await roleService.deleteRole(currentRole.roleId)
      if (response.success) {
        toast.success(response.message || 'Xóa vai trò thành công')
        setShowDeleteDialog(false)
        fetchRoles()
      } else {
        toast.error(response.message || 'Không thể xóa vai trò')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa vai trò')
    } finally {
      setIsLoading(false)
    }
  }

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
          <div className="flex gap-3">
            <button
              onClick={fetchRoles}
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
              Thêm vai trò
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
                placeholder="Tìm kiếm theo tên vai trò..."
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

        {/* Roles Table */}
        {!isLoading && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Tên vai trò</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Mô tả</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRoles.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        {searchQuery ? 'Không tìm thấy vai trò nào' : 'Chưa có vai trò nào'}
                      </td>
                    </tr>
                  ) : (
                    filteredRoles.map((role) => (
                      <tr key={role.roleId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">{role.roleId}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{role.roleName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{role.description || '-'}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEdit(role)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(role)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create/Edit Dialog */}
        {showDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {currentRole ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}
                </h2>
                <button
                  onClick={() => setShowDialog(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên vai trò <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.roleName}
                    onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                    placeholder="VD: ADMIN, USER, MANAGER"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Nhập mô tả vai trò..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
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
                    {isLoading ? 'Đang xử lý...' : currentRole ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && currentRole && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Xác nhận xóa</h2>
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa vai trò <strong>{currentRole.roleName}</strong>?
                <br />
                Hành động này không thể hoàn tác!
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
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FastFoodRole
