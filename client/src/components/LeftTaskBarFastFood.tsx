import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../hooks/redux'
import { logout } from '../store/slices/authSlice'
import { 
  Users,
  Shield,
  ShoppingBag,
  Store,
  Plane,
  LogOut,
  User,
  Home
} from 'lucide-react'

const LeftTaskBarFastFood: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const menuItems = [
    {
      icon: Users,
      label: 'Tài khoản',
      path: '/fastfood/accounts'
    },
    {
      icon: Shield,
      label: 'Vai trò',
      path: '/fastfood/roles'
    },
    {
      icon: ShoppingBag,
      label: 'Đơn hàng',
      path: '/fastfood/orders'
    },
    {
      icon: Store,
      label: 'Nhà hàng',
      path: '/fastfood/restaurants'
    },
    {
      icon: Plane,
      label: 'Drone',
      path: '/fastfood/drones'
    }
  ]

  const isActivePath = (path: string) => {
    return location.pathname === path
  }

  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col shadow-2xl z-50 border-r border-blue-700">
      {/* Header */}
      <div className="p-6 border-b border-blue-700">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-green-500 to-teal-500 p-3 rounded-xl shadow-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">{user?.accountName || 'FastFood Admin'}</h3>
            <p className="text-xs text-blue-300">{user?.roles?.[0]?.roleName || 'FASTFOOD_ADMIN'}</p>
          </div>
        </div>
      </div>

      {/* Body - Menu Items */}
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = isActivePath(item.path)
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg transform scale-105' 
                    : 'text-blue-200 hover:bg-blue-700 hover:text-white hover:shadow-md'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Footer - Customer Page & Logout */}
      <div className="p-4 border-t border-blue-700 space-y-2">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-blue-200 hover:bg-purple-600 hover:text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
        >
          <Home className="w-5 h-5" />
          <span>Trang khách hàng</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-blue-200 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
        >
          <LogOut className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  )
}

export default LeftTaskBarFastFood
