import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button/Button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { menuItemService, type CreateMenuItemRequest } from '../../services/menuItemService';
import { restaurantService } from '../../services/restaurantService';
import { authService } from '../../services/authService';
import { imageService } from '../../services/imageService';
import { cloudinaryService } from '../../services/cloudinaryService';

import { VALIDATION_RULES } from '../../config/constants';
import { Upload, X, BookOpen } from 'lucide-react';

// Fixed categories for FastFood
const FIXED_CATEGORIES = [
    'Đồ ăn',
    'Thực phẩm',
    'Rượu bia',
    'Hoa',
    'Siêu thị',
    'Thuốc',
    'Thú cưng'
];

interface MenuItemFormData {
    name: string;
    categoryName: string;
    price: string;
    description: string;
    restaurantId: string;
    imageUrl: string;
}

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [restaurantId, setRestaurantId] = useState<string>('');

    const [formData, setFormData] = useState<MenuItemFormData>({
        name: '',
        categoryName: '',
        price: '',
        description: '',
        restaurantId: '',
        imageUrl: '',
    });

    // Load restaurant ID when modal opens
    useEffect(() => {
        if (isOpen) {
            loadRestaurantId();
        }
    }, [isOpen]);

    const loadRestaurantId = async () => {
        try {
            // Get current user from localStorage
            const user = authService.loadUserFromStorage();
            
            console.log('📋 Current user from localStorage:', user);
            
            // Get accountId from either userID or accountId field
            const accountId = user?.accountId || user?.userID;
            
            if (!user || !accountId) {
                console.error('❌ User not found or missing accountId/userID');
                console.log('💡 User object:', user);
                console.log('💡 Please login first');
                console.log('💡 To check: JSON.parse(localStorage.getItem("user"))');
                
                // For development/testing: Use a default restaurant ID
                const defaultRestaurantId = '1';
                setRestaurantId(defaultRestaurantId);
                setFormData(prev => ({ ...prev, restaurantId: defaultRestaurantId }));
                console.log('⚠️ Using default restaurant ID for testing:', defaultRestaurantId);
                
                toast.warning('Không tìm thấy thông tin đăng nhập. Đang sử dụng nhà hàng mặc định để test.', {
                    duration: 5000,
                });
                return;
            }

            console.log('🔍 Fetching restaurants for owner ID:', accountId);
            console.log('👤 User info:');
            console.log('   - Account ID:', accountId);
            console.log('   - Name:', user.accountName || user.fullname);
            console.log('   - Phone:', user.accountPhone || user.phone);
            console.log('   - Roles:', user.roles?.map(r => r.roleName).join(', '));

            // Get restaurants by owner ID
            const response = await restaurantService.getRestaurantsByOwner(accountId);
            
            console.log('📦 Restaurant API response:', response);
            
            if (response.success && response.data && response.data.length > 0) {
                // Use the first restaurant
                const firstRestaurantId = response.data[0].restaurantId;
                const restaurantName = response.data[0].restaurantName;
                
                setRestaurantId(firstRestaurantId);
                setFormData(prev => ({ ...prev, restaurantId: firstRestaurantId }));
                
                console.log('✅ Successfully loaded restaurant:');
                console.log('   - Restaurant ID:', firstRestaurantId);
                console.log('   - Restaurant Name:', restaurantName);
                console.log('   - Owner ID:', accountId);
                
                toast.success(`Đã tải thông tin nhà hàng: ${restaurantName}`, {
                    duration: 2000,
                });
            } else {
                console.warn('⚠️ No restaurants found for owner:', accountId);
                console.log('💡 Please create a restaurant first in Restaurant Management');
                console.log('💡 Response data:', response.data);
                
                // For development/testing: Use a default restaurant ID
                const defaultRestaurantId = '1';
                setRestaurantId(defaultRestaurantId);
                setFormData(prev => ({ ...prev, restaurantId: defaultRestaurantId }));
                console.log('⚠️ Using default restaurant ID:', defaultRestaurantId);
                
                toast.warning('Bạn chưa có nhà hàng. Đang sử dụng nhà hàng mặc định để test.', {
                    duration: 5000,
                });
            }
        } catch (error: any) {
            console.error('❌ Error loading restaurant ID:', error);
            console.error('📋 Error details:', error.response?.data);
            console.error('📋 Error message:', error.message);
            
            // For development: Use fallback ID
            const fallbackRestaurantId = '1';
            setRestaurantId(fallbackRestaurantId);
            setFormData(prev => ({ ...prev, restaurantId: fallbackRestaurantId }));
            console.log('⚠️ Using fallback restaurant ID:', fallbackRestaurantId);
            
            toast.warning('Không thể kết nối API nhà hàng. Đang sử dụng nhà hàng mặc định.', {
                duration: 5000,
            });
        }
    };

    const handleInputChange = (field: keyof MenuItemFormData, value: string | number) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];

        // Validate file using imageService
        const validation = imageService.validateImage(file);
        if (!validation.isValid) {
            toast.error(validation.error);
            return;
        }

        try {
            // Create preview URL
            const previewUrl = imageService.createPreviewUrl(file);
            setImagePreviewUrl(previewUrl);
            setImageFile(file);

            toast.success('Đã chọn hình ảnh. Sẽ upload lên Cloudinary khi tạo món ăn.');
        } catch (error) {
            console.error('Error processing image:', error);
            toast.error('Không thể xử lý hình ảnh');
        }
    };

    const removeImage = () => {
        // Revoke the object URL to free memory
        if (imagePreviewUrl) {
            imageService.revokePreviewUrl(imagePreviewUrl);
        }
        setImagePreviewUrl('');
        setImageFile(null);
    };

    const validateForm = (): boolean => {
        if (!formData.restaurantId) {
            toast.error('Không tìm thấy thông tin nhà hàng');
            return false;
        }

        if (!formData.name.trim()) {
            toast.error('Vui lòng nhập tên món ăn');
            return false;
        }

        if (formData.name.length < VALIDATION_RULES.PRODUCT_NAME.MIN_LENGTH) {
            toast.error(VALIDATION_RULES.PRODUCT_NAME.MESSAGE);
            return false;
        }

        if (!formData.price || parseFloat(formData.price) <= 0) {
            toast.error(VALIDATION_RULES.PRICE.MESSAGE);
            return false;
        }

        if (!formData.description.trim()) {
            toast.error('Vui lòng nhập mô tả món ăn');
            return false;
        }

        if (!formData.categoryName) {
            toast.error('Vui lòng chọn danh mục');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            let uploadedImageUrl = '';

            // ========== STEP 1: Upload image to Cloudinary (if selected) ==========
            if (imageFile) {
                console.log('=== UPLOADING IMAGE TO CLOUDINARY ===');
                console.log('Image file:', imageFile.name, 'Size:', imageFile.size, 'Type:', imageFile.type);
                
                try {
                    const result = await cloudinaryService.uploadImage(imageFile, {
                        folder: 'menuitems/images'
                    });
                    
                    console.log('Image upload result:', result);
                    
                    if (result.success && result.data) {
                        uploadedImageUrl = result.data.url;
                        console.log('✅ Image uploaded successfully:', uploadedImageUrl);
                        
                        toast.success('Đã tải lên hình ảnh thành công', {
                            duration: 2000,
                            position: 'top-right',
                        });
                    } else {
                        console.error('❌ Image upload failed:', result.message);
                        toast.error(`Không thể tải lên hình ảnh: ${result.message}`);
                        throw new Error(`Failed to upload image: ${result.message}`);
                    }
                } catch (error) {
                    console.error('❌ Error uploading image:', error);
                    toast.error('Lỗi khi tải lên hình ảnh');
                    throw error;
                }
            } else {
                console.log('No image selected, creating menu item without image');
            }

            // ========== STEP 2: Create menu item with Cloudinary URL ==========
            console.log('=== CREATING MENU ITEM IN DATABASE ===');
            
            const menuItemData: CreateMenuItemRequest = {
                restaurantId: formData.restaurantId,
                name: formData.name.trim(),
                description: formData.description.trim(),
                categoryName: formData.categoryName,
                price: parseFloat(formData.price),
                imageUrl: uploadedImageUrl, // Use uploaded URL or empty string
            };

            console.log('📦 Creating menu item with data:', menuItemData);

            await menuItemService.createMenuItem(menuItemData);

            toast.success('Đã tạo món ăn thành công!', {
                duration: 3000,
                position: 'top-right',
            });

            // Reset form
            setFormData({
                name: '',
                categoryName: '',
                price: '',
                description: '',
                restaurantId: restaurantId, // Keep current restaurant ID
                imageUrl: '',
            });

            // Clear image preview
            if (imagePreviewUrl) {
                imageService.revokePreviewUrl(imagePreviewUrl);
            }
            setImagePreviewUrl('');
            setImageFile(null);

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error creating menu item:', error);

            const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo món ăn';

            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        // Clean up image preview URL
        if (imagePreviewUrl) {
            imageService.revokePreviewUrl(imagePreviewUrl);
        }
        setImagePreviewUrl('');
        setImageFile(null);

        // Reset form
        setFormData({
            name: '',
            categoryName: '',
            price: '',
            description: '',
            restaurantId: restaurantId, // Keep current restaurant ID
            imageUrl: '',
        });

        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-amber-500" />
                        Thêm món ăn mới
                    </DialogTitle>
                    <DialogDescription>
                        Điền thông tin chi tiết để tạo món ăn mới trong hệ thống
                        {formData.restaurantId && (
                            <span className="text-xs text-gray-500 ml-2">
                                (Restaurant ID: {formData.restaurantId})
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Tên món ăn *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Nhập tên món ăn..."
                                className="w-full"
                                maxLength={VALIDATION_RULES.PRODUCT_NAME.MAX_LENGTH}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="categoryName">Danh mục *</Label>
                            <Select
                                value={formData.categoryName}
                                onValueChange={(value) => handleInputChange('categoryName', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    {FIXED_CATEGORIES.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Giá bán (VNĐ) *</Label>
                            <Input
                                id="price"
                                type="number"
                                value={formData.price}
                                onChange={(e) => handleInputChange('price', e.target.value)}
                                placeholder="0"
                                min="0"
                                step="1000"
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả món ăn *</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Nhập mô tả chi tiết về món ăn..."
                            rows={4}
                            className="w-full"
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label>Hình ảnh món ăn</Label>
                        <div className="max-w-xs">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="image-upload"
                            />
                            <label
                                htmlFor="image-upload"
                                className="block w-full h-48 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors"
                            >
                                {imagePreviewUrl ? (
                                    <div className="relative w-full h-full">
                                        <img
                                            src={imagePreviewUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover rounded-md"
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                removeImage();
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <Upload className="w-12 h-12 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-600 font-medium">Chọn hình ảnh</span>
                                        <span className="text-xs text-gray-400 mt-1">PNG, JPG, GIF tối đa 5MB</span>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            {isLoading ? 'Đang tạo...' : 'Tạo món ăn'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddProductModal;