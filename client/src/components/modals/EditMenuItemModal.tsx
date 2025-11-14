import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button/Button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { menuItemService, type UpdateMenuItemRequest, type MenuItemResponse } from '../../services/menuItemService';
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
    imageUrl: string;
    isAvailable: boolean;
}

interface EditMenuItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    menuItem: MenuItemResponse | null;
}

const EditMenuItemModal: React.FC<EditMenuItemModalProps> = ({ isOpen, onClose, onSuccess, menuItem }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [hasNewImage, setHasNewImage] = useState(false);

    const [formData, setFormData] = useState<MenuItemFormData>({
        name: '',
        categoryName: '',
        price: '',
        description: '',
        imageUrl: '',
        isAvailable: true,
    });

    // Populate form when menuItem changes
    useEffect(() => {
        if (isOpen && menuItem) {
            setFormData({
                name: menuItem.name || '',
                categoryName: menuItem.categoryName || '',
                price: menuItem.price?.toString() || '',
                description: menuItem.description || '',
                imageUrl: menuItem.imageUrl || '',
                isAvailable: menuItem.isAvailable !== undefined ? menuItem.isAvailable : true,
            });
            setImagePreviewUrl(menuItem.imageUrl || '');
            setHasNewImage(false);
            setImageFile(null);
        }
    }, [isOpen, menuItem]);

    const handleInputChange = (field: keyof MenuItemFormData, value: string | number | boolean) => {
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
            setHasNewImage(true);

            toast.success('Đã chọn hình ảnh mới. Sẽ upload lên Cloudinary khi cập nhật.');
        } catch (error) {
            console.error('Error processing image:', error);
            toast.error('Không thể xử lý hình ảnh');
        }
    };

    const removeImage = () => {
        if (hasNewImage && imagePreviewUrl) {
            imageService.revokePreviewUrl(imagePreviewUrl);
        }
        setImagePreviewUrl('');
        setImageFile(null);
        setHasNewImage(false);
    };

    const validateForm = (): boolean => {
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

        if (!validateForm() || !menuItem) return;

        setIsLoading(true);

        try {
            let uploadedImageUrl = formData.imageUrl; // Keep existing image by default

            // Upload new image if user selected one
            if (hasNewImage && imageFile) {
                console.log('=== UPLOADING NEW IMAGE TO CLOUDINARY ===');
                console.log('Image file:', imageFile.name, 'Size:', imageFile.size, 'Type:', imageFile.type);
                
                try {
                    const result = await cloudinaryService.uploadImage(imageFile, {
                        folder: 'menuitems/images'
                    });
                    
                    console.log('Image upload result:', result);
                    
                    if (result.success && result.data) {
                        uploadedImageUrl = result.data.url;
                        console.log('✅ New image uploaded successfully:', uploadedImageUrl);
                        
                        toast.success('Đã tải lên hình ảnh mới thành công', {
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
            }

            // Update menu item
            console.log('=== UPDATING MENU ITEM IN DATABASE ===');
            
            const updateData: UpdateMenuItemRequest = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                categoryName: formData.categoryName,
                price: parseFloat(formData.price),
                imageUrl: uploadedImageUrl,
                isAvailable: formData.isAvailable,
            };

            console.log('📦 Updating menu item with data:', updateData);

            await menuItemService.updateMenuItem(menuItem.itemId, updateData);

            toast.success('Đã cập nhật món ăn thành công!', {
                duration: 3000,
                position: 'top-right',
            });

            // Clean up
            if (hasNewImage && imagePreviewUrl) {
                imageService.revokePreviewUrl(imagePreviewUrl);
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error updating menu item:', error);

            const errorMessage = error.response?.data?.message || error.message || 'Không thể cập nhật món ăn';

            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        // Clean up image preview URL
        if (hasNewImage && imagePreviewUrl) {
            imageService.revokePreviewUrl(imagePreviewUrl);
        }

        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-amber-500" />
                        Cập nhật món ăn
                    </DialogTitle>
                    <DialogDescription>
                        Chỉnh sửa thông tin món ăn
                        {menuItem && (
                            <span className="text-xs text-gray-500 ml-2">
                                (ID: {menuItem.itemId})
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
                            <Label htmlFor="price">Giá *</Label>
                            <Input
                                id="price"
                                type="number"
                                value={formData.price}
                                onChange={(e) => handleInputChange('price', e.target.value)}
                                placeholder="Nhập giá món ăn..."
                                className="w-full"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="category">Danh mục *</Label>
                        <Select
                            value={formData.categoryName}
                            onValueChange={(value) => handleInputChange('categoryName', value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Chọn danh mục..." />
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

                    {/* Status */}
                    <div className="space-y-2">
                        <Label htmlFor="status">Trạng thái *</Label>
                        <Select
                            value={formData.isAvailable.toString()}
                            onValueChange={(value) => handleInputChange('isAvailable', value === 'true')}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Chọn trạng thái..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">Có sẵn</SelectItem>
                                <SelectItem value="false">Hết món</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả *</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Nhập mô tả món ăn..."
                            className="w-full min-h-[100px]"
                            rows={4}
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label>Hình ảnh món ăn</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            {imagePreviewUrl ? (
                                <div className="relative inline-block">
                                    <img
                                        src={imagePreviewUrl}
                                        alt="Preview"
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    {hasNewImage && (
                                        <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                            Ảnh mới
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center cursor-pointer py-8">
                                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-600">Click để chọn ảnh</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                            {imagePreviewUrl && (
                                <label className="block mt-2 text-center cursor-pointer">
                                    <span className="text-sm text-blue-600 hover:text-blue-700">
                                        Thay đổi ảnh
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-amber-500 hover:bg-amber-600 text-white"
                        >
                            {isLoading ? (
                                <>
                                    <span className="mr-2">Đang cập nhật...</span>
                                </>
                            ) : (
                                'Lưu thay đổi'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditMenuItemModal;
