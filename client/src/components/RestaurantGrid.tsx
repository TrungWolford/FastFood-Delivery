// src/components/RestaurantGrid.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button/Button';
import { ArrowRight, MapPin, Star, UtensilsCrossed } from 'lucide-react';
import { restaurantService } from '../services/restaurantService';
import type { RestaurantResponse } from '../services/restaurantService';

interface RestaurantGridProps {
  title?: string;
  city?: string;
  district?: string;
  limit?: number;
  showViewAll?: boolean;
  viewAllLink?: string;
}

const RestaurantGrid: React.FC<RestaurantGridProps> = ({
  title = 'Nhà hàng nổi bật',
  city,
  district,
  limit,
  showViewAll = true,
  viewAllLink,
}) => {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState<RestaurantResponse[]>([]);
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
        console.log('🔄 Loading restaurants...');
        console.log('   - City:', city || 'All');
        console.log('   - District:', district || 'All');
        console.log('   - Limit:', limit || 20);
        
        const response = await restaurantService.getAllRestaurants(0, limit || 20);
        
        console.log('📦 Restaurants response:', response);

        if (response.success && response.data?.content) {
          if (!mounted) return;
          setRestaurants(response.data.content);
          console.log('✅ Loaded restaurants:', response.data.content.length);
        } else {
          console.warn('⚠️ No restaurants in response');
        }
      } catch (error) {
        console.error('❌ Error loading restaurants:', error);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [city, district, limit]);

  // Filter restaurants by status (only show active restaurants)
  let filteredRestaurants = restaurants.filter((restaurant) => restaurant.status === 1);
  
  // Filter by city if provided
  if (city) {
    filteredRestaurants = filteredRestaurants.filter((restaurant) => restaurant.city === city);
  }

  // Filter by ward if provided
  if (district) {
    filteredRestaurants = filteredRestaurants.filter((restaurant) => restaurant.ward === district);
  }

  const isLimited = limit && filteredRestaurants.length > limit;
  if (limit) {
    filteredRestaurants = filteredRestaurants.slice(0, limit);
  }

  console.log('📊 Final filtered restaurants:', filteredRestaurants.length);

  const handleRestaurantClick = (restaurantId: string) => {
    navigate(`/restaurant/${restaurantId}`);
  };

  if (loading) {
    return (
      <div className="w-full py-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          <span className="ml-4 text-gray-600">Đang tải nhà hàng...</span>
        </div>
      </div>
    );
  }

  if (!loading && filteredRestaurants.length === 0) {
    return (
      <div className="w-full py-12">
        <div className="text-center text-gray-500">
          <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">Không có nhà hàng nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        {showViewAll && isLimited && (
          <Button
            variant="ghost"
            onClick={() => navigate(viewAllLink || '/restaurants')}
            className="group"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        )}
      </div>

      {/* Restaurant Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRestaurants.map((restaurant, index) => (
          <div
            key={restaurant.restaurantId}
            onClick={() => handleRestaurantClick(restaurant.restaurantId)}
            className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
          >
            {/* Restaurant Image */}
            <div className="relative h-48 overflow-hidden">
              {restaurant.avatarImage ? (
                <img
                  src={restaurant.avatarImage}
                  alt={restaurant.restaurantName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center`}>
                  <UtensilsCrossed className="w-20 h-20 text-white opacity-50" />
                </div>
              )}
              
              {/* Rating Badge */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1 shadow-lg">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-semibold text-gray-800">
                  {restaurant.rating.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Restaurant Info */}
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-amber-600 transition-colors line-clamp-1">
                {restaurant.restaurantName}
              </h3>

              {/* Location */}
              <div className="flex items-start text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0 text-gray-400" />
                <span className="line-clamp-2">{restaurant.address}</span>
              </div>

              {/* City & Ward */}
              <div className="flex items-center text-xs text-gray-500 mb-3">
                <span className="bg-gray-100 px-2 py-1 rounded-full mr-2">
                  {restaurant.city}
                </span>
                <span className="bg-gray-100 px-2 py-1 rounded-full">
                  {restaurant.ward}
                </span>
              </div>

              {/* Action Button */}
              <button className="w-full mt-2 py-2 bg-amber-50 text-amber-600 font-semibold rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors duration-200">
                Xem thực đơn
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantGrid;
