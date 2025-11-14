// src/components/ProductGrid.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button/Button';
import { ArrowRight, UtensilsCrossed, MapPin, DollarSign, Edit, Power } from 'lucide-react';
import { menuItemService } from '../services/menuItemService';
import type { MenuItemResponse } from '../services/menuItemService';

interface ProductGridProps {
  title?: string;
  categoryName?: string;
  limit?: number;
  showViewAll?: boolean;
  viewAllLink?: string;
  onEdit?: (menuItem: MenuItemResponse) => void;
  onToggleStatus?: (menuItem: MenuItemResponse) => void;
  showActions?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  title = 'Món ăn nổi bật',
  categoryName,
  limit,
  showViewAll = true,
  viewAllLink,
  onEdit,
  onToggleStatus,
  showActions = false,
}) => {
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState<MenuItemResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // Gradient colors for cards
  const gradients = [
    'from-orange-400 to-pink-500',
    'from-blue-400 to-indigo-500',
    'from-green-400 to-teal-500',
    'from-purple-400 to-pink-500',
    'from-yellow-400 to-orange-500',
    'from-red-400 to-pink-500',
  ];

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        console.log('🔄 Loading menu items...');
        console.log('   - Category:', categoryName || 'All');
        console.log('   - Limit:', limit || 20);
        
        const response = await menuItemService.getAllMenuItems(0, limit || 20);
        
        console.log('📦 Menu items response:', response);
        console.log('   - Has content?', !!response?.content);
        console.log('   - Content length:', response?.content?.length || 0);

        if (response && response.content) {
          if (!mounted) return;
          setMenuItems(response.content);
          console.log('✅ Loaded menu items:', response.content.length);
        } else {
          console.warn('⚠️ No content in response');
        }
      } catch (error) {
        console.error('❌ Error loading menu items:', error);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [categoryName, limit]);

  // Filter menu items
  console.log('🔍 Filtering menu items:');
  console.log('   - Total items:', menuItems.length);
  
  // TEMPORARILY DISABLED: Filter by isAvailable to show all items for testing
  // let filteredItems = menuItems.filter((item) => item.isAvailable);
  let filteredItems = menuItems; // Show all items temporarily
  console.log('   - Items after availability check:', filteredItems.length);
  
  if (categoryName) {
    filteredItems = filteredItems.filter((item) => item.categoryName === categoryName);
    console.log('   - After category filter:', filteredItems.length);
  }

  const isLimited = limit && filteredItems.length > limit;
  if (limit) {
    filteredItems = filteredItems.slice(0, limit);
    console.log('   - After limit:', filteredItems.length);
  }
  
  console.log('📊 Final filtered items:', filteredItems.length);

  const handleViewAll = () => {
    if (viewAllLink) {
      navigate(viewAllLink);
    } else if (categoryName) {
      navigate(`/menu/${categoryName}`);
    } else {
      navigate('/menu');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="w-full">
      {/* Section Title */}
      {title && (
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
            <div className="w-16 h-1 bg-amber-600 rounded"></div>
          </div>
        </div>
      )}

      {/* Menu Items Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              Không có món ăn nào
            </div>
          ) : (
            filteredItems.map((menuItem, index) => {
              const gradientClass = gradients[index % gradients.length];
              
              return (
                <div 
                  key={menuItem.itemId} 
                  onClick={() => navigate(`/menu-item/${menuItem.itemId}`)}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 cursor-pointer"
                >
                  {/* Large image section */}
                  <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {menuItem.imageUrl ? (
                      <img 
                        src={menuItem.imageUrl} 
                        alt={menuItem.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      /* Fallback gradient with subtle icon if no image */
                      <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
                        <UtensilsCrossed className="w-20 h-20 text-white opacity-30" strokeWidth={1.5} />
                      </div>
                    )}
                    
                    {/* Status badge on top right */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm ${
                        menuItem.isAvailable
                          ? 'bg-white/90 text-green-600' 
                          : 'bg-white/90 text-red-600'
                      }`}>
                        {menuItem.isAvailable ? '● Còn món' : '● Hết món'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Menu item name */}
                    <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-1">
                      {menuItem.name}
                    </h3>

                    {/* Info items */}
                    <div className="space-y-2.5 mb-4">
                      {/* Restaurant Address */}
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-600 line-clamp-1">
                          {menuItem.restaurantAddress || 'Chưa có địa chỉ'}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2.5">
                        <DollarSign className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-lg font-bold text-amber-600">
                          {formatPrice(menuItem.price)}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    {menuItem.description && (
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                        {menuItem.description}
                      </p>
                    )}

                    {/* Action buttons */}
                    {showActions && (
                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            onEdit?.(menuItem);
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                          Sửa
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            onToggleStatus?.(menuItem);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors font-medium ${
                            menuItem.isAvailable
                              ? 'text-orange-600 hover:bg-orange-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={menuItem.isAvailable ? 'Đánh dấu hết món' : 'Đánh dấu còn món'}
                        >
                          <Power className="w-4 h-4" />
                          {menuItem.isAvailable ? 'Tắt' : 'Bật'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: limit || 6 }).map((_, i) => (
            <div key={i} className="h-96 bg-gray-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      )}

      {/* View All Button */}
      {showViewAll && isLimited && (
        <div className="mt-8 text-center">
          <Button
            onClick={handleViewAll}
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
          >
            Xem tất cả món ăn
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
