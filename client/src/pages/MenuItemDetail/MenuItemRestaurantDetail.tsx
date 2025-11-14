import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
    Clock, 
    MapPin, 
    Star, 
    Plus,
    Minus,
    ShoppingCart,
    ArrowLeft,
    Info,
    DollarSign
} from 'lucide-react';
import { menuItemService, type MenuItemResponse } from '@/services/menuItemService';
import { restaurantService, type RestaurantResponse } from '@/services/restaurantService';
import { cartService } from '@/services/cartService';
import { useAppSelector } from '@/hooks/redux';
import TopNavigation from '@/components/ui/Header/Header';
import Footer from '@/components/ui/Footer/Footer';

const MenuItemRestaurantDetail: React.FC = () => {
    const { menuItemId } = useParams<{ menuItemId: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);

    // State
    const [menuItem, setMenuItem] = useState<MenuItemResponse | null>(null);
    const [restaurant, setRestaurant] = useState<RestaurantResponse | null>(null);
    const [relatedMenuItems, setRelatedMenuItems] = useState<MenuItemResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({});

    // Load menu item and restaurant details
    useEffect(() => {
        const loadData = async () => {
            if (!menuItemId) {
                toast.error('Không tìm thấy món ăn');
                navigate('/');
                return;
            }

            try {
                setLoading(true);

                // Load menu item details
                console.log('📋 Loading menu item:', menuItemId);
                const itemData = await menuItemService.getMenuItemById(menuItemId);
                setMenuItem(itemData);

                // Load restaurant details
                console.log('🏪 Loading restaurant:', itemData.restaurantId);
                const restaurantResponse = await restaurantService.getRestaurantById(itemData.restaurantId);
                
                if (restaurantResponse.success && restaurantResponse.data) {
                    setRestaurant(restaurantResponse.data);
                } else {
                    toast.error('Không thể tải thông tin nhà hàng');
                }

                // Load related menu items from same restaurant
                console.log('🍽️ Loading related menu items...');
                const allMenuItems = await menuItemService.getMenuItemsByRestaurant(itemData.restaurantId);
                
                // Filter out current item - show all items from restaurant (including unavailable)
                const related = allMenuItems.filter(
                    item => item.itemId !== menuItemId
                );
                setRelatedMenuItems(related);
                console.log(`📦 Loaded ${related.length} menu items from restaurant`);

                console.log('✅ Data loaded successfully');
            } catch (error: any) {
                console.error('❌ Error loading data:', error);
                toast.error('Không thể tải thông tin món ăn');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [menuItemId, navigate]);

    // Handle quantity change
    const handleQuantityChange = (itemId: string, delta: number) => {
        setCartQuantities(prev => {
            const currentQty = prev[itemId] || 0;
            const newQty = Math.max(0, currentQty + delta);
            return { ...prev, [itemId]: newQty };
        });
    };

    // Handle add to cart
    const handleAddToCart = async (item: MenuItemResponse) => {
        if (!isAuthenticated || !user || !user.userID) {
            toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
            navigate('/account/login');
            return;
        }

        const quantity = cartQuantities[item.itemId] || 1;

        try {
            console.log('🛒 Adding to cart:', { accountId: user.userID, menuItemId: item.itemId, quantity });
            
            // Call API to add to cart
            const response = await cartService.addToCart({
                accountId: user.userID,
                productId: item.itemId,
                quantity: quantity
            });

            if (response.success) {
                toast.success(
                    `Đã thêm ${quantity} x ${item.name} vào giỏ hàng`,
                    {
                        duration: 2000,
                        position: 'top-right',
                    }
                );
                
                // Reset quantity
                setCartQuantities(prev => ({ ...prev, [item.itemId]: 0 }));
            } else {
                toast.error(response.message || 'Không thể thêm vào giỏ hàng');
            }
        } catch (error: any) {
            console.error('❌ Error adding to cart:', error);
            toast.error('Không thể thêm vào giỏ hàng');
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (!menuItem || !restaurant) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-600">Không tìm thấy thông tin món ăn</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation Header */}
            <TopNavigation />
            
            {/* Back Button Section */}
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 hover:text-amber-600 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Quay lại
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Menu Item & Restaurant Info Section */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                    <div className="grid md:grid-cols-2 gap-8 p-8">
                        {/* Left: Menu Item Image */}
                        <div className="relative">
                            <img
                                src={menuItem.imageUrl || '/placeholder-food.jpg'}
                                alt={menuItem.name}
                                className="w-full h-[400px] object-cover rounded-lg shadow-md"
                                onError={(e) => {
                                    e.currentTarget.src = '/placeholder-food.jpg';
                                }}
                            />
                            {/* Status Badge */}
                            <div className="absolute top-4 right-4">
                                <span
                                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                        menuItem.isAvailable
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    {menuItem.isAvailable ? 'Có sẵn' : 'Hết món'}
                                </span>
                            </div>
                        </div>

                        {/* Right: Info */}
                        <div className="flex flex-col justify-between">
                            {/* Restaurant Name */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Info className="w-5 h-5 text-amber-600" />
                                    <span className="text-sm text-gray-500 uppercase tracking-wide">
                                        CAFÉ/DESSERT
                                    </span>
                                </div>

                                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                    {menuItem.name}
                                </h1>

                                <div className="mb-6">
                                    <p className="text-gray-600 leading-relaxed">
                                        {menuItem.description || 'Món ăn ngon từ nhà hàng'}
                                    </p>
                                </div>

                                {/* Category */}
                                {menuItem.categoryName && (
                                    <div className="mb-6">
                                        <span className="inline-block px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                                            {menuItem.categoryName}
                                        </span>
                                    </div>
                                )}

                                {/* Restaurant Info */}
                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <h3 className="font-semibold text-gray-900 mb-3">
                                        {restaurant.restaurantName}
                                    </h3>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-amber-600" />
                                            <span>{restaurant.address}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-amber-600" />
                                            <span>08:00 - 23:00</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
                                            <span>100+ đánh giá trên ShopeeFood</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Price and Add to Cart */}
                            <div className="border-t pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-6 h-6 text-gray-400" />
                                        <span className="text-sm text-gray-500">Giá:</span>
                                        <span className="text-2xl font-bold text-amber-600">
                                            {menuItem.price.toLocaleString('vi-VN')}đ
                                        </span>
                                    </div>
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="text-sm font-medium text-gray-700">Số lượng:</span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleQuantityChange(menuItem.itemId, -1)}
                                            disabled={!cartQuantities[menuItem.itemId]}
                                            className="w-8 h-8 rounded-full border-2 border-amber-600 text-amber-600 flex items-center justify-center hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-12 text-center font-semibold text-lg">
                                            {cartQuantities[menuItem.itemId] || 1}
                                        </span>
                                        <button
                                            onClick={() => handleQuantityChange(menuItem.itemId, 1)}
                                            className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center hover:bg-amber-700 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Add to Cart Button */}
                                <button
                                    onClick={() => handleAddToCart(menuItem)}
                                    disabled={!menuItem.isAvailable}
                                    className="w-full bg-amber-600 text-white py-4 rounded-lg font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    {menuItem.isAvailable ? 'Thêm vào giỏ hàng' : 'Hết món'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Menu Items Section */}
                {relatedMenuItems.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Các món khác từ {restaurant.restaurantName}
                        </h2>

                        {/* List layout - Row by row */}
                        <div className="space-y-4">
                            {relatedMenuItems.map((item) => (
                                <div
                                    key={item.itemId}
                                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer bg-white"
                                    onClick={() => navigate(`/menu-item/${item.itemId}`)}
                                >
                                    {/* Image - Small square */}
                                    <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
                                        <img
                                            src={item.imageUrl || '/placeholder-food.jpg'}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = '/placeholder-food.jpg';
                                            }}
                                        />
                                        {!item.isAvailable && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                <span className="text-white text-xs font-semibold">Hết</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info section - Grows to fill space */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                                            {item.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 line-clamp-1">
                                            {item.description || `Nhập ${item.categoryName || 'món ăn ngon'}`}
                                        </p>
                                    </div>

                                    {/* Price - Right aligned */}
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className="text-lg font-bold text-amber-600">
                                            {item.price.toLocaleString('vi-VN')}
                                            <span className="text-sm align-super">đ</span>
                                        </span>

                                        {/* Add button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddToCart(item);
                                            }}
                                            disabled={!item.isAvailable}
                                            className="w-10 h-10 rounded-lg bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Footer */}
            <Footer />
        </div>
    );
};

export default MenuItemRestaurantDetail;
