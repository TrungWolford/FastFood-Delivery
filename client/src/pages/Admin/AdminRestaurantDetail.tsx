import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import { toast } from 'sonner';
import LeftTaskbar from '../../components/LeftTaskbar';
import restaurantDetailService from '../../services/restaurantDetailService';
import { restaurantService, type RestaurantResponse } from '../../services/restaurantService';
import type { 
    CreateRestaurantDetailRequest 
} from '../../types/restaurantDetail';
import { 
    validateRestaurantTypes, 
    validateSpecialties,
    RESTAURANT_DETAIL_VALIDATION
} from '../../types/restaurantDetail';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { 
    Store, 
    MapPin, 
    Star, 
    Save,
    RefreshCw,
    Info,
    FileText,
    X,
    Plus
} from 'lucide-react';

const AdminRestaurantDetail: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    
    // State for restaurant and detail data
    const [restaurant, setRestaurant] = useState<RestaurantResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [restaurantId, setRestaurantId] = useState<string | null>(null);
    const [hasExistingDetail, setHasExistingDetail] = useState(false);

    // Active tab for navigation
    const [activeTab, setActiveTab] = useState<'basic' | 'detail'>('basic');

    // Form state for restaurant basic info
    const [restaurantName, setRestaurantName] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [phone, setPhone] = useState('');
    const [avatarImage, setAvatarImage] = useState('');

    // Form state for restaurant detail
    const [openingHours, setOpeningHours] = useState('');
    const [restaurantTypes, setRestaurantTypes] = useState<string[]>([]);
    const [cuisines, setCuisines] = useState<string[]>([]);
    const [specialties, setSpecialties] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [menuImages, setMenuImages] = useState<string[]>([]);

    // Input helpers for arrays
    const [newRestaurantType, setNewRestaurantType] = useState('');
    const [newCuisine, setNewCuisine] = useState('');
    const [newSpecialty, setNewSpecialty] = useState('');
    const [newMenuImage, setNewMenuImage] = useState('');

    useEffect(() => {
        document.title = 'FastFood - Thông tin nhà hàng';

        // Check if user is authenticated and has RESTAURANT role
        if (!isAuthenticated || !user) {
            toast.error('Bạn cần đăng nhập để truy cập trang này');
            navigate('/');
            return;
        }

        const userRoles = user.roles || [];
        const isRestaurant = userRoles.some((role) => role.roleName === 'RESTAURANT');

        if (!isRestaurant) {
            toast.error('Chỉ nhà hàng mới có quyền truy cập trang này');
            navigate('/');
            return;
        }

        loadRestaurantData();
    }, [isAuthenticated, user, navigate]);

    const loadRestaurantData = async () => {
        try {
            setLoading(true);

            // Get restaurant by ownerId
            if (!user?.userID) {
                toast.error('Không tìm thấy thông tin người dùng');
                return;
            }

            const result = await restaurantService.getRestaurantsByOwner(user.userID);
            
            if (!result.success || !result.data || result.data.length === 0) {
                toast.info('Bạn chưa đăng ký nhà hàng. Vui lòng đăng ký trước.');
                navigate('/admin/register');
                return;
            }

            const restaurantData = result.data[0];
            setRestaurant(restaurantData);
            setRestaurantId(restaurantData.restaurantId);

            // Populate restaurant basic info
            setRestaurantName(restaurantData.restaurantName);
            setAddress(restaurantData.address);
            setCity(restaurantData.city);
            setDistrict(restaurantData.district);
            setPhone(restaurantData.phone);
            setAvatarImage(restaurantData.avatarImage || '');

            // Try to load restaurant detail
            try {
                const detail = await restaurantDetailService.getRestaurantDetailByRestaurantId(restaurantData.restaurantId);
                
                if (detail) {
                    setHasExistingDetail(true);

                    // Populate restaurant detail fields
                    setOpeningHours(detail.openingHours);
                    setRestaurantTypes(detail.restaurantTypes);
                    setCuisines(detail.cuisines);
                    setSpecialties(detail.specialties);
                    setDescription(detail.description);
                    setCoverImage(detail.coverImage || '');
                    setMenuImages(detail.menuImages || []);

                    toast.success('Đã tải thông tin nhà hàng thành công');
                } else {
                    setHasExistingDetail(false);
                    toast.info('Chưa có thông tin chi tiết nhà hàng. Vui lòng điền thông tin.');
                }
            } catch (error) {
                // No detail exists yet, that's okay
                console.log('No restaurant detail found, user can create one');
                setHasExistingDetail(false);
                toast.info('Chưa có thông tin chi tiết nhà hàng. Vui lòng điền thông tin.');
            }
        } catch (error) {
            console.error('Error loading restaurant data:', error);
            toast.error('Không thể tải thông tin nhà hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRestaurant = async () => {
        if (!restaurantId) {
            toast.error('Không tìm thấy ID nhà hàng');
            return;
        }

        try {
            setSaving(true);

            const updateData = {
                restaurantName,
                address,
                city,
                district,
                phone,
                avatarImage: avatarImage || undefined,
            };

            await restaurantService.updateRestaurant(restaurantId, updateData);
            toast.success('Cập nhật thông tin cơ bản thành công');
            loadRestaurantData();
        } catch (error) {
            console.error('Error updating restaurant:', error);
            toast.error('Không thể cập nhật thông tin cơ bản');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveRestaurantDetail = async () => {
        if (!restaurantId) {
            toast.error('Không tìm thấy ID nhà hàng');
            return;
        }

        // Validation
        if (!validateRestaurantTypes(restaurantTypes)) {
            toast.error(`Vui lòng chọn 1-${RESTAURANT_DETAIL_VALIDATION.restaurantTypes.max} loại hình nhà hàng`);
            return;
        }

        if (!validateSpecialties(specialties)) {
            toast.error(`Vui lòng chọn 1-${RESTAURANT_DETAIL_VALIDATION.specialties.max} món đặc sản`);
            return;
        }

        if (!openingHours.trim()) {
            toast.error('Vui lòng nhập giờ mở cửa');
            return;
        }

        if (!description.trim()) {
            toast.error('Vui lòng nhập mô tả nhà hàng');
            return;
        }

        if (cuisines.length === 0) {
            toast.error('Vui lòng thêm ít nhất 1 món ăn');
            return;
        }

        try {
            setSaving(true);

            const detailData: CreateRestaurantDetailRequest = {
                openingHours: openingHours.trim(),
                restaurantTypes,
                cuisines,
                specialties,
                description: description.trim(),
                coverImage: coverImage.trim(),
                menuImages: menuImages,
            };

            if (hasExistingDetail) {
                // Update existing detail
                await restaurantDetailService.updateRestaurantDetail(restaurantId, detailData);
                toast.success('Cập nhật thông tin chi tiết thành công');
            } else {
                // Create new detail
                await restaurantDetailService.createRestaurantDetail(restaurantId, detailData);
                toast.success('Tạo thông tin chi tiết thành công');
                setHasExistingDetail(true);
            }

            loadRestaurantData();
        } catch (error) {
            console.error('Error saving restaurant detail:', error);
            toast.error('Không thể lưu thông tin chi tiết');
        } finally {
            setSaving(false);
        }
    };

    // Array management helpers
    const addRestaurantType = () => {
        if (!newRestaurantType.trim()) return;
        if (restaurantTypes.length >= RESTAURANT_DETAIL_VALIDATION.restaurantTypes.max) {
            toast.error(`Chỉ được thêm tối đa ${RESTAURANT_DETAIL_VALIDATION.restaurantTypes.max} loại hình`);
            return;
        }
        if (restaurantTypes.includes(newRestaurantType.trim())) {
            toast.error('Loại hình này đã tồn tại');
            return;
        }
        setRestaurantTypes([...restaurantTypes, newRestaurantType.trim()]);
        setNewRestaurantType('');
    };

    const removeRestaurantType = (index: number) => {
        setRestaurantTypes(restaurantTypes.filter((_, i) => i !== index));
    };

    const addCuisine = () => {
        if (!newCuisine.trim()) return;
        if (cuisines.includes(newCuisine.trim())) {
            toast.error('Món ăn này đã tồn tại');
            return;
        }
        setCuisines([...cuisines, newCuisine.trim()]);
        setNewCuisine('');
    };

    const removeCuisine = (index: number) => {
        setCuisines(cuisines.filter((_, i) => i !== index));
    };

    const addSpecialty = () => {
        if (!newSpecialty.trim()) return;
        if (specialties.length >= RESTAURANT_DETAIL_VALIDATION.specialties.max) {
            toast.error(`Chỉ được thêm tối đa ${RESTAURANT_DETAIL_VALIDATION.specialties.max} món đặc sản`);
            return;
        }
        if (specialties.includes(newSpecialty.trim())) {
            toast.error('Món đặc sản này đã tồn tại');
            return;
        }
        setSpecialties([...specialties, newSpecialty.trim()]);
        setNewSpecialty('');
    };

    const removeSpecialty = (index: number) => {
        setSpecialties(specialties.filter((_, i) => i !== index));
    };

    const addMenuImage = () => {
        if (!newMenuImage.trim()) return;
        if (menuImages.includes(newMenuImage.trim())) {
            toast.error('URL này đã tồn tại');
            return;
        }
        setMenuImages([...menuImages, newMenuImage.trim()]);
        setNewMenuImage('');
    };

    const removeMenuImage = (index: number) => {
        setMenuImages(menuImages.filter((_, i) => i !== index));
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50">
                <LeftTaskbar />
                <div className="flex-1 p-8">
                    <div className="max-w-5xl mx-auto space-y-6">
                        <Skeleton className="h-12 w-64" />
                        <Skeleton className="h-96 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <LeftTaskbar />
            <div className="flex-1 overflow-auto">
                <div className="max-w-5xl mx-auto p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Store className="w-8 h-8 text-orange-500" />
                                Thông tin nhà hàng
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Quản lý thông tin cơ bản và chi tiết của nhà hàng
                            </p>
                        </div>
                        <Button
                            onClick={loadRestaurantData}
                            variant="outline"
                            size="sm"
                            disabled={loading}
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Tải lại
                        </Button>
                    </div>

                    {/* Restaurant Status Badge */}
                    {restaurant && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <Store className="w-8 h-8 text-orange-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold">{restaurant.restaurantName}</h3>
                                            <p className="text-gray-600 text-sm flex items-center gap-2 mt-1">
                                                <MapPin className="w-4 h-4" />
                                                {restaurant.address}, {restaurant.district}, {restaurant.city}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <Badge variant={restaurant.status === 1 ? 'default' : 'secondary'}>
                                            {restaurant.status === 1 ? 'Đã duyệt' : 'Chờ duyệt'}
                                        </Badge>
                                        {restaurant.rating > 0 && (
                                            <div className="flex items-center gap-1 text-yellow-500">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span className="font-semibold">{restaurant.rating.toFixed(1)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-2 border-b">
                        <button
                            onClick={() => setActiveTab('basic')}
                            className={`px-6 py-3 font-medium transition-colors relative ${
                                activeTab === 'basic'
                                    ? 'text-orange-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                Thông tin cơ bản
                            </div>
                            {activeTab === 'basic' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('detail')}
                            className={`px-6 py-3 font-medium transition-colors relative ${
                                activeTab === 'detail'
                                    ? 'text-orange-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Thông tin chi tiết
                            </div>
                            {activeTab === 'detail' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600" />
                            )}
                        </button>
                    </div>

                    {/* Basic Info Tab */}
                    {activeTab === 'basic' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin cơ bản</CardTitle>
                                <CardDescription>
                                    Cập nhật thông tin cơ bản của nhà hàng
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="restaurantName">Tên nhà hàng *</Label>
                                        <Input
                                            id="restaurantName"
                                            value={restaurantName}
                                            onChange={(e) => setRestaurantName(e.target.value)}
                                            placeholder="Nhập tên nhà hàng"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Số điện thoại *</Label>
                                        <Input
                                            id="phone"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="Nhập số điện thoại"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Địa chỉ *</Label>
                                    <Input
                                        id="address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Nhập địa chỉ"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">Thành phố *</Label>
                                        <Input
                                            id="city"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            placeholder="Nhập thành phố"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="district">Quận/Huyện *</Label>
                                        <Input
                                            id="district"
                                            value={district}
                                            onChange={(e) => setDistrict(e.target.value)}
                                            placeholder="Nhập quận/huyện"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="avatarImage">URL hình đại diện</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="avatarImage"
                                            value={avatarImage}
                                            onChange={(e) => setAvatarImage(e.target.value)}
                                            placeholder="https://example.com/avatar.jpg"
                                        />
                                        {avatarImage && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => setAvatarImage('')}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                    {avatarImage && (
                                        <div className="mt-2">
                                            <img
                                                src={avatarImage}
                                                alt="Avatar preview"
                                                className="w-32 h-32 object-cover rounded-lg"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/placeholder-image.jpg';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleUpdateRestaurant}
                                        disabled={saving || !restaurantName || !phone || !address || !city || !district}
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {saving ? 'Đang lưu...' : 'Cập nhật thông tin'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Restaurant Detail Tab */}
                    {activeTab === 'detail' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin chi tiết</CardTitle>
                                <CardDescription>
                                    {hasExistingDetail
                                        ? 'Cập nhật thông tin chi tiết của nhà hàng'
                                        : 'Tạo thông tin chi tiết cho nhà hàng'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Opening Hours */}
                                <div className="space-y-2">
                                    <Label htmlFor="openingHours">Giờ mở cửa *</Label>
                                    <Input
                                        id="openingHours"
                                        value={openingHours}
                                        onChange={(e) => setOpeningHours(e.target.value)}
                                        placeholder="VD: 08:00 - 22:00"
                                    />
                                </div>

                                {/* Restaurant Types */}
                                <div className="space-y-2">
                                    <Label>
                                        Loại hình nhà hàng * (Tối đa {RESTAURANT_DETAIL_VALIDATION.restaurantTypes.max})
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={newRestaurantType}
                                            onChange={(e) => setNewRestaurantType(e.target.value)}
                                            placeholder="VD: Quán ăn nhanh, Nhà hàng cao cấp..."
                                            onKeyPress={(e) => e.key === 'Enter' && addRestaurantType()}
                                        />
                                        <Button
                                            type="button"
                                            onClick={addRestaurantType}
                                            disabled={restaurantTypes.length >= RESTAURANT_DETAIL_VALIDATION.restaurantTypes.max}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {restaurantTypes.map((type, index) => (
                                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                {type}
                                                <button
                                                    onClick={() => removeRestaurantType(index)}
                                                    className="ml-1 hover:bg-gray-300 rounded-full"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Cuisines */}
                                <div className="space-y-2">
                                    <Label>Món ăn *</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={newCuisine}
                                            onChange={(e) => setNewCuisine(e.target.value)}
                                            placeholder="VD: Pizza, Burger, Pasta..."
                                            onKeyPress={(e) => e.key === 'Enter' && addCuisine()}
                                        />
                                        <Button type="button" onClick={addCuisine}>
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {cuisines.map((cuisine, index) => (
                                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                {cuisine}
                                                <button
                                                    onClick={() => removeCuisine(index)}
                                                    className="ml-1 hover:bg-gray-300 rounded-full"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Specialties */}
                                <div className="space-y-2">
                                    <Label>
                                        Món đặc sản * (Tối đa {RESTAURANT_DETAIL_VALIDATION.specialties.max})
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={newSpecialty}
                                            onChange={(e) => setNewSpecialty(e.target.value)}
                                            placeholder="VD: Phở bò, Bún chả..."
                                            onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
                                        />
                                        <Button
                                            type="button"
                                            onClick={addSpecialty}
                                            disabled={specialties.length >= RESTAURANT_DETAIL_VALIDATION.specialties.max}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {specialties.map((specialty, index) => (
                                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                {specialty}
                                                <button
                                                    onClick={() => removeSpecialty(index)}
                                                    className="ml-1 hover:bg-gray-300 rounded-full"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Mô tả nhà hàng *</Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Nhập mô tả chi tiết về nhà hàng..."
                                        rows={5}
                                    />
                                    <p className="text-sm text-gray-500">
                                        {description.length} / {RESTAURANT_DETAIL_VALIDATION.description.max} ký tự
                                    </p>
                                </div>

                                {/* Cover Image */}
                                <div className="space-y-2">
                                    <Label htmlFor="coverImage">URL hình bìa</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="coverImage"
                                            value={coverImage}
                                            onChange={(e) => setCoverImage(e.target.value)}
                                            placeholder="https://example.com/cover.jpg"
                                        />
                                        {coverImage && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => setCoverImage('')}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                    {coverImage && (
                                        <div className="mt-2">
                                            <img
                                                src={coverImage}
                                                alt="Cover preview"
                                                className="w-full h-48 object-cover rounded-lg"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/placeholder-image.jpg';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Menu Images */}
                                <div className="space-y-2">
                                    <Label>Hình ảnh thực đơn</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={newMenuImage}
                                            onChange={(e) => setNewMenuImage(e.target.value)}
                                            placeholder="https://example.com/menu1.jpg"
                                            onKeyPress={(e) => e.key === 'Enter' && addMenuImage()}
                                        />
                                        <Button type="button" onClick={addMenuImage}>
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    {menuImages.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                            {menuImages.map((image, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={image}
                                                        alt={`Menu ${index + 1}`}
                                                        className="w-full h-32 object-cover rounded-lg"
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/placeholder-image.jpg';
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => removeMenuImage(index)}
                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleSaveRestaurantDetail}
                                        disabled={
                                            saving ||
                                            !openingHours ||
                                            restaurantTypes.length === 0 ||
                                            cuisines.length === 0 ||
                                            specialties.length === 0 ||
                                            !description
                                        }
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {saving ? 'Đang lưu...' : hasExistingDetail ? 'Cập nhật thông tin' : 'Tạo thông tin'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminRestaurantDetail;
