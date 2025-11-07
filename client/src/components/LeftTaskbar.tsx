import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../hooks/redux'
import { logout } from '../store/slices/authSlice'
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  Users, 
  Shield, 
  LogOut,
  User,
  Home,
  ShoppingBag,
  Truck,
  Star
} from 'lucide-react'

const LeftTaskbar: React.FC = () => {
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
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/admin/dashboard'
    },
    {
      icon: Package,
      label: 'Sản phẩm',
      path: '/admin/products'
    },
    {
      icon: Tags,
      label: 'Thể loại',
      path: '/admin/categories'
    },
    {
      icon: ShoppingBag,
      label: 'Đơn hàng',
      path: '/admin/orders'
    },
    {
      icon: Truck,
      label: 'Vận chuyển',
      path: '/admin/shippings'
    },
    {
      icon: Star,
      label: 'Đánh giá',
      path: '/admin/ratings'
    },
    {
      icon: Users,
      label: 'Tài khoản',
      path: '/admin/accounts'
    },
    {
      icon: Shield,
      label: 'Vai trò',
      path: '/admin/roles'
    }
  ]

  const isActivePath = (path: string) => {
    return location.pathname === path
  }

  // Bỏ check user để hiển thị LeftTaskbar luôn
  // if (!user) return null

  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col shadow-2xl z-50 border-r border-slate-700">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-xl shadow-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">{user?.accountName || 'Admin'}</h3>
            <p className="text-xs text-slate-400">{user?.roles?.[0]?.roleName || 'ADMIN'}</p>
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
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105' 
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white hover:shadow-md'
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
        <div className="p-4 border-t border-slate-700 space-y-2">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-slate-300 hover:bg-blue-600 hover:text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
          >
            <Home className="w-5 h-5" />
            <span>Trang khách hàng</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-slate-300 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
  )
}

export default LeftTaskbar
