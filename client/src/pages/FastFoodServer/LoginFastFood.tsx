import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../hooks/redux'
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice'
import { authService } from '../../services/authService'
import { Eye, EyeOff, UtensilsCrossed, Lock, User } from 'lucide-react'
import { toast } from 'sonner'

const LoginFastFood: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.username || !formData.password) {
      toast.error('Vui lòng nhập đầy đủ thông tin!')
      return
    }

    setIsLoading(true)
    dispatch(loginStart())
    
    try {
      const response = await authService.login({
        email: formData.username,
        password: formData.password
      })
      
      if (response.success && response.user) {
        dispatch(loginSuccess(response.user))
        
        // Check user roles
        const userRoles = response.user.roles || []
        const isAdmin = userRoles.some(role => role.roleName === 'ADMIN')
        
        if (isAdmin) {
          toast.success('Đăng nhập thành công! Chào mừng Admin.')
          setTimeout(() => {
            navigate('/fastfood/accounts')
          }, 500)
        } else {
          toast.error('Bạn không có quyền truy cập trang quản trị!')
          dispatch(loginFailure('Không có quyền truy cập'))
          authService.logout()
        }
      } else {
        dispatch(loginFailure(response.message || 'Đăng nhập thất bại'))
        toast.error(response.message || 'Đăng nhập thất bại')
      }
    } catch (error) {
      dispatch(loginFailure('Có lỗi xảy ra khi đăng nhập'))
      toast.error('Có lỗi xảy ra khi đăng nhập')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmEwMDAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAtMC42NjMgMC41LTEuMjI3IDEuMTQ2LTEuMjk1bC4xNTQtLjAwNWgxYzAuNjYzIDAgMS4yMjcuNSAxLjI5NSAxLjE0NmwuMDA1LjE1NHYxYzAgLjY2My0uNSAxLjIyNy0xLjE0NiAxLjI5NWwtLjE1NC4wMDVoLTFjLS42NjMgMC0xLjIyNy0uNS0xLjI5NS0xLjE0NkwzNiAxNXYtMXptLTIwIDBjMC0uNjYzLjUtMS4yMjcgMS4xNDYtMS4yOTVsLjE1NC0uMDA1aDE2YzAuNjYzIDAgMS4yMjcuNSAxLjI5NSAxLjE0NmwuMDA1LjE1NHYxYzAgLjY2My0uNSAxLjIyNy0xLjE0NiAxLjI5NWwtLjE1NC4wMDVoLTE2Yy0uNjYzIDAtMS4yMjctLjUtMS4yOTUtMS4xNDZMMTYgMTV2LTF6bTIwIDIwYzAtLjY2My41LTEuMjI3IDEuMTQ2LTEuMjk1bC4xNTQtLjAwNWgxYzAuNjYzIDAgMS4yMjcuNSAxLjI5NSAxLjE0NmwuMDA1LjE1NHYxYzAgLjY2My0uNSAxLjIyNy0xLjE0NiAxLjI5NWwtLjE1NC4wMDVoLTFjLS42NjMgMC0xLjIyNy0uNS0xLjI5NS0xLjE0NkwzNiAzNXYtMXptLTIwIDBjMC0uNjYzLjUtMS4yMjcgMS4xNDYtMS4yOTVsLjE1NC0uMDA1aDE2YzAuNjYzIDAgMS4yMjcuNSAxLjI5NSAxLjE0NmwuMDA1LjE1NHYxYzAgLjY2My0uNSAxLjIyNy0xLjE0NiAxLjI5NWwtLjE1NC4wMDVoLTE2Yy0uNjYzIDAtMS4yMjctLjUtMS4yOTUtMS4xNDZMMTYgMzV2LTF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
      
      <div className="w-full max-w-md relative">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full shadow-lg mb-4">
            <UtensilsCrossed className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">FastFood Admin</h1>
          <p className="text-gray-600">Đăng nhập vào hệ thống quản trị</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6">
            <h2 className="text-2xl font-bold text-center">Đăng nhập</h2>
            <p className="text-center text-orange-100 mt-1">Chào mừng bạn quay lại!</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="username"
                  name="username"
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Ghi nhớ đăng nhập
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang đăng nhập...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </button>

            {/* Back to Home */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
                disabled={isLoading}
              >
                ← Quay lại trang chủ
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>© 2024 FastFood Admin. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default LoginFastFood
