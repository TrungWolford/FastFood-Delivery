import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  UtensilsCrossed, 
  Apple, 
  Wine, 
  Flower2, 
  ShoppingBag, 
  Pill,
  PawPrint 
} from 'lucide-react';

const CategoryNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const categories = [
    {
      icon: UtensilsCrossed,
      label: 'Đồ ăn',
      path: '/category/do-an',
      color: 'text-orange-600'
    },
    {
      icon: Apple,
      label: 'Thực phẩm',
      path: '/category/thuc-pham',
      color: 'text-green-600'
    },
    {
      icon: Wine,
      label: 'Rượu bia',
      path: '/category/ruou-bia',
      color: 'text-purple-600'
    },
    {
      icon: Flower2,
      label: 'Hoa',
      path: '/category/hoa',
      color: 'text-pink-600'
    },
    {
      icon: ShoppingBag,
      label: 'Siêu thị',
      path: '/category/sieu-thi',
      color: 'text-blue-600'
    },
    {
      icon: Pill,
      label: 'Thuốc',
      path: '/category/thuoc',
      color: 'text-red-600'
    },
    {
      icon: PawPrint,
      label: 'Thú cưng',
      path: '/category/thu-cung',
      color: 'text-amber-600'
    }
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-[70px]">
        <nav className="flex items-center justify-between gap-2 py-3">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = isActivePath(category.path);
            return (
              <button
                key={category.path}
                onClick={() => navigate(category.path)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md transform scale-105'
                    : 'text-gray-700 hover:text-primary hover:bg-orange-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white animate-bounce' : `${category.color} group-hover:text-primary`}`} />
                <span className={`font-medium text-sm ${isActive ? 'text-white' : ''}`}>{category.label}</span>
                {isActive && (
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-orange-500"></div>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default CategoryNavbar;
