import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, ShoppingCart, Phone, LogOut, UserCircle, History, Settings } from 'lucide-react';
import { Button } from '../Button/Button';
import { Input } from '../input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../dropdowns/dropdown-menu';

import { useAppSelector, useAppDispatch } from '../../../hooks/redux';
import { logout } from '../../../store/slices/authSlice';
import LoginDialog from '../../../pages/Mainpage/Login';
import { cartService } from '../../../services/cartService';
import { productService } from '../../../services/productService';
import { toast } from 'sonner';
import { localStorageCartService } from '@/services/localStorageCartService';
import { images } from '../../../assets/img';
import CategoryNavbar from '../../CategoryNavbar';

const TopNavigation: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0); // Number of restaurants with items

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // Handle search
  const handleSearch = async () => {
    console.log('🎯 handleSearch called');
    console.log('🎯 searchQuery value:', searchQuery);
    console.log('🎯 searchQuery trimmed:', searchQuery.trim());
    
    if (!searchQuery.trim()) {
      console.log('⚠️ Search query is empty');
      toast.error('Vui lòng nhập từ khóa tìm kiếm');
      return;
    }

    try {
      console.log('🔍 Searching for:', searchQuery);
      console.log('🔍 Calling productService.searchProducts...');
      
      const response = await productService.searchProducts(searchQuery, 0, 12);
      
      console.log('📦 Full response:', response);
      
      // Response trực tiếp có content, totalElements (không có success, data wrapper)
      if (response && response.content) {
        console.log('✅ Search results:', response.content);
        console.log('✅ Total elements:', response.totalElements);
        toast.success(`Tìm thấy ${response.totalElements || 0} sản phẩm`);
        
        // Navigate to search results page
        navigate(`/product/search?q=${encodeURIComponent(searchQuery)}`);
      } else {
        console.log('❌ No results or invalid response structure');
        toast.error('Không tìm thấy sản phẩm nào');
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      toast.error('Đã xảy ra lỗi khi tìm kiếm');
    }
  };

  // Handle search on Enter key
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Helper function to check authentication and show login message
  const requireAuth = (action: string) => {
    if (!isAuthenticated || !user) {
      toast.error(`Vui lòng đăng nhập để ${action}`);
      setIsLoginDialogOpen(true);
      return false;
    }
    return true;
  };

  // Fetch cart items count when user is authenticated
  useEffect(() => {
    const updateCartCount = () => {
      if (isAuthenticated && user) {
        fetchCartCount();
      } else {
        // Lấy từ localStorage
        const count = localStorageCartService.getItemCount();
        setCartCount(count > 0 ? 1 : 0); // 1 cart if has items, 0 otherwise
      }
    };

    updateCartCount();

    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      if (isAuthenticated && user) {
        fetchCartCount();
      } else {
        const count = localStorageCartService.getItemCount();
        setCartCount(count > 0 ? 1 : 0);
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  // Fetch cart count (number of restaurants with items)
  const fetchCartCount = async () => {
    if (!user?.accountId) return;

    try {
      // Get all carts for this user
      const response = await cartService.getAllCartsByUser(user.accountId);
      if (response.success && response.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const carts = Array.isArray(response.data) ? response.data : [response.data] as any[];
        // Count carts that have items
        const cartsWithItems = carts.filter((cart) => cart.items && cart.items.length > 0);
        setCartCount(cartsWithItems.length);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      setCartCount(0);
    }
  };

  return (
    <>
      <div className="bg-primary text-white">
        {/* Top bar with hotline */}
        <div className="bg-[#F38258] text-white px-4 py-1 text-sm">
          <div className="container mx-auto flex items-center">
            <Phone className="w-4 h-4 mr-2" />
            <span className="font-medium">Hotline: 0903.400.028</span>
            <span className="ml-2 text-white-700">(8h - 12h, 13h30 - 17h)</span>
            <span className="ml-auto">Liên hệ hợp tác</span>
          </div>
        </div>

        {/* Main navigation */}
        <div className="container h-[75px]  mx-auto px-[70px] py-3 flex justify-between">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className=" px-3 py-2 rounded-md mr-3">
              <img src={images.logo} alt="" className="w-15 h-16 bg-contain" />
            </div>
          </button>

          {/* Search bar */}
          <div className="flex-1 w-[500px] max-w-2xl mx-8">
            <div className="relative">
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-4 pr-12 py-2 rounded border-0 bg-white text-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
              />
              <Button
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-[#F38258] text-white px-4 rounded"
                onClick={handleSearch}
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* User actions */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Login/Register or User Info */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 hover:text-amber-400 transition-colors cursor-pointer outline-none">
                <User className="w-7 h-7" />
                <div className="text-base text-left">
                  <div className="text-white font-medium">{user.accountName}</div>
                  <div className="text-gray-300 text-sm">{user.accountPhone}</div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 mr-4">
                <DropdownMenuItem
                  onClick={() => {
                    if (requireAuth('xem thông tin tài khoản')) {
                      navigate('/account/profile');
                    }
                  }}
                  className="cursor-pointer"
                >
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Thông tin tài khoản</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (requireAuth('xem lịch sử đơn hàng')) {
                      navigate('/customer/orders');
                    }
                  }}
                  className="cursor-pointer"
                >
                  <History className="mr-2 h-4 w-4" />
                  <span>Lịch sử đơn hàng</span>
                </DropdownMenuItem>

                {/* Admin Panel - Only show for admin users */}
                {user.roles && user.roles.some((role) => role.roleName === 'ADMIN') && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        if (requireAuth('truy cập trang quản trị')) {
                          navigate('/admin/dashboard');
                        }
                      }}
                      className="cursor-pointer text-blue-600 focus:text-blue-600"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Trang quản trị</span>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={() => setIsLoginDialogOpen(true)}
              className="flex items-center gap-2 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <User className="w-7 h-7" />
              <div className="text-base">
                <div className="text-white font-medium text-sm">Tài khoản</div>
              </div>
            </button>
          )}

          {/* Divider */}
          <div className="w-[1px] h-8 bg-gray-300 mx-4"></div>

          {/* Shopping cart - Simple click to navigate */}
          <div 
            className="flex items-center gap-2 hover:text-amber-400 transition-colors cursor-pointer group"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isAuthenticated && user) {
                navigate('/carts');
              } else {
                toast.info('Vui lòng đăng nhập để xem giỏ hàng');
                setIsLoginDialogOpen(true);
              }
            }}
          >
            <div className="relative">
              <ShoppingCart className="w-8 h-8 group-hover:text-amber-400" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </div>
            <div className="text-white group-hover:text-amber-400">
              <div className="font-medium ml-2">Giỏ hàng</div>
            </div>
          </div>
        </div>
      </div>

        {/* Login Dialog */}
        <LoginDialog isOpen={isLoginDialogOpen} onClose={() => setIsLoginDialogOpen(false)} />
      </div>
      
      {/* Category Navigation Bar */}
      <CategoryNavbar />
    </>
  );
};

export default TopNavigation;
