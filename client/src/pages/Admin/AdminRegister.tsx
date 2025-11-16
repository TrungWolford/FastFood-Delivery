import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Store, 
  User, 
  FileText, 
  ChevronRight, 
  ChevronLeft,
  Check,
  MapPin,
  Phone,
  Mail,
  Clock,
  Image as ImageIcon,
  Upload,
  X,
  Loader2
} from 'lucide-react';
import TopNavigation from '../../components/ui/Header/Header';
import Footer from '../../components/ui/Footer/Footer';
import MapPicker from '../../components/MapPicker';
import { restaurantService, restaurantDetailService } from '../../services/restaurantService';
import { accountRestaurantDetailService } from '../../services/accountRestaurantDetailService';
import { uploadService } from '../../services/uploadService';
import { roleService } from '../../services/roleService';

// Types
interface RestaurantFormData {
  // Step 1: Basic Info
  restaurantName: string;
  address: string;
  phone: string;
  city: string;
  ward: string; // ✅ Đổi từ district sang ward (Phường/Xã)
  mapLocation: { lat: number; lng: number } | null;
  
  // Step 2: Owner Info (thông tin để tạo User account + AccountRestaurantDetail)
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerPassword: string;        // Mật khẩu cho tài khoản
  ownerPasswordConfirm: string; // Xác nhận mật khẩu
  ownerAddress: string;         // Địa chỉ cá nhân (có thể khác địa chỉ nhà hàng)
  cccdFront: string;
  cccdBack: string;
  businessLicenses: string[];
  
  // Step 3: Details
  openingHours: string;
  restaurantTypes: string[];
  cuisineTypes: string[];
  specialtyDishes: string[];
  timeSlots: string[];
  description: string;
  avatarImage: string;
  coverImage: string;
  menuImage: string;
}

const STEPS = [
  { number: 1, title: 'Thông tin cơ bản', icon: Store },
  { number: 2, title: 'Người đại diện', icon: User },
  { number: 3, title: 'Chi tiết quán', icon: FileText },
];

const RESTAURANT_TYPES = [
  'Nhà hàng',
  'Quán ăn',
  'Quán cafe',
  'Quán ăn vặt',
  'Quán lẩu',
  'Quán nướng',
  'Quán chay',
  'Buffet'
];

const CUISINE_TYPES = [
  'Châu Á',
  'Việt Nam',
  'Hàn Quốc',
  'Nhật Bản',
  'Trung Quốc',
  'Thái Lan',
  'Âu - Mỹ',
  'Brazil',
  'Mexico',
  'Ấn Độ'
];

const SPECIALTY_DISHES = [
  'Món nướng',
  'Món lẩu',
  'Món hải sản',
  'Món chay',
  'Món ăn vặt',
  'Món tráng miệng',
  'Đồ uống',
  'Món Âu',
  'Món Á',
  'Fast Food'
];

const TIME_SLOTS = [
  'Buổi sáng',
  'Buổi trưa',
  'Buổi chiều',
  'Buổi tối',
  'Khuya'
];

const CITIES = [
  'Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Cần Thơ',
  'Hải Phòng',
  'Biên Hòa',
  'Nha Trang',
  'Huế'
];

const DISTRICTS_HCM = [
  'Quận 1',
  'Quận 2',
  'Quận 3',
  'Quận 4',
  'Quận 5',
  'Quận 6',
  'Quận 7',
  'Quận 8',
  'Quận 9',
  'Quận 10',
  'Quận 11',
  'Quận 12',
  'Bình Thạnh',
  'Gò Vấp',
  'Phú Nhuận',
  'Tân Bình',
  'Tân Phú',
  'Thủ Đức'
];

// Time options for opening hours (06:00 to 23:30, 30 minutes interval)
const TIME_OPTIONS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30', '23:00', '23:30'
];

const AdminRegister: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [restaurantRoleId, setRestaurantRoleId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    email: string;
    restaurantName: string;
  } | null>(null);
  
  // State for opening hours (separate open and close time)
  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('22:00');
  
  const [formData, setFormData] = useState<RestaurantFormData>({
    restaurantName: '',
    address: '',
    phone: '',
    city: '',
    ward: '', // ✅ Đổi từ district sang ward
    mapLocation: null,
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerPassword: '',
    ownerPasswordConfirm: '',
    ownerAddress: '',
    cccdFront: '',
    cccdBack: '',
    businessLicenses: [],
    openingHours: '',
    restaurantTypes: [],
    cuisineTypes: [],
    specialtyDishes: [],
    timeSlots: [],
    description: '',
    avatarImage: '',
    coverImage: '',
    menuImage: '',
  });

  // Load roles on component mount to get RESTAURANT role ID
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const response = await roleService.getAllRoles();
        if (response.success && response.data) {
          // Tìm role có tên "RESTAURANT" hoặc "RestaurantOwner"
          const restaurantRole = response.data.find(
            role => role.roleName === 'RESTAURANT' || 
                   role.roleName === 'RestaurantOwner' ||
                   role.roleName.toLowerCase().includes('restaurant')
          );
          
          if (restaurantRole) {
            setRestaurantRoleId(restaurantRole.roleId);
            console.log('Found restaurant role:', restaurantRole);
          } else {
            console.warn('Restaurant role not found in roles list');
          }
        }
      } catch (error) {
        console.error('Error loading roles:', error);
      }
    };

    loadRoles();
    
    // Initialize openingHours with default value
    handleInputChange('openingHours', `${openTime}-${closeTime}`);
  }, []);

  const handleInputChange = (field: keyof RestaurantFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle opening hours change
  const handleOpenTimeChange = (time: string) => {
    setOpenTime(time);
    const newOpeningHours = `${time}-${closeTime}`;
    handleInputChange('openingHours', newOpeningHours);
  };

  const handleCloseTimeChange = (time: string) => {
    setCloseTime(time);
    const newOpeningHours = `${openTime}-${time}`;
    handleInputChange('openingHours', newOpeningHours);
  };

  const handleMultiSelect = (field: keyof RestaurantFormData, value: string, maxSelect: number) => {
    const currentArray = formData[field] as string[];
    if (currentArray.includes(value)) {
      handleInputChange(field, currentArray.filter(item => item !== value));
    } else if (currentArray.length < maxSelect) {
      handleInputChange(field, [...currentArray, value]);
    }
  };

  const handleImageUpload = (field: keyof RestaurantFormData, files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    // TODO: Upload to Cloudinary
    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      handleInputChange(field, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleMultiImageUpload = (files: FileList | null) => {
    if (!files) return;
    
    const maxImages = 10;
    const remainingSlots = maxImages - formData.businessLicenses.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    filesToUpload.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          businessLicenses: [...prev.businessLicenses, reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeBusinessLicense = (index: number) => {
    setFormData(prev => ({
      ...prev,
      businessLicenses: prev.businessLicenses.filter((_, i) => i !== index)
    }));
  };

  // Validation functions for each step
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.restaurantName.trim()) {
      newErrors.restaurantName = 'Vui lòng nhập tên quán';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }
    if (!formData.city) {
      newErrors.city = 'Vui lòng chọn thành phố';
    }
    if (!formData.ward) {
      newErrors.ward = 'Vui lòng chọn phường/xã'; // ✅ Đổi từ district sang ward
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại liên hệ';
    } else {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        newErrors.phone = 'Số điện thoại không hợp lệ (10-11 chữ số)';
      }
    }
    if (!formData.mapLocation || formData.mapLocation.lat === 0 || formData.mapLocation.lng === 0) {
      newErrors.mapLocation = 'Vui lòng chọn vị trí trên bản đồ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Vui lòng nhập họ tên người đại diện';
    }
    if (!formData.ownerEmail.trim()) {
      newErrors.ownerEmail = 'Vui lòng nhập email';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.ownerEmail.trim())) {
        newErrors.ownerEmail = 'Email không hợp lệ';
      }
    }
    if (!formData.ownerPhone.trim()) {
      newErrors.ownerPhone = 'Vui lòng nhập số điện thoại';
    } else {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(formData.ownerPhone.trim())) {
        newErrors.ownerPhone = 'Số điện thoại không hợp lệ (10-11 chữ số)';
      } else if (formData.ownerPhone.trim() === formData.phone.trim()) {
        newErrors.ownerPhone = '⚠️ Số điện thoại chủ nhà hàng trùng với số điện thoại nhà hàng. Vui lòng sử dụng số khác.';
      }
    }
    // Validate password
    if (!formData.ownerPassword.trim()) {
      newErrors.ownerPassword = 'Vui lòng nhập mật khẩu';
    } else if (formData.ownerPassword.length < 6) {
      newErrors.ownerPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    // Validate password confirmation
    if (!formData.ownerPasswordConfirm.trim()) {
      newErrors.ownerPasswordConfirm = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.ownerPassword !== formData.ownerPasswordConfirm) {
      newErrors.ownerPasswordConfirm = 'Mật khẩu xác nhận không khớp';
    }
    // Validate owner address
    if (!formData.ownerAddress.trim()) {
      newErrors.ownerAddress = 'Vui lòng nhập địa chỉ cá nhân';
    }
    if (!formData.cccdFront) {
      newErrors.cccdFront = 'Vui lòng tải ảnh CCCD mặt trước';
    }
    if (!formData.cccdBack) {
      newErrors.cccdBack = 'Vui lòng tải ảnh CCCD mặt sau';
    }
    if (formData.businessLicenses.length === 0) {
      newErrors.businessLicenses = 'Vui lòng tải ít nhất 1 ảnh giấy đăng ký kinh doanh';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.openingHours.trim()) {
      newErrors.openingHours = 'Vui lòng nhập thời gian mở cửa';
    }
    if (formData.restaurantTypes.length === 0) {
      newErrors.restaurantTypes = 'Vui lòng chọn ít nhất 1 loại hình quán';
    }
    if (formData.cuisineTypes.length === 0) {
      newErrors.cuisineTypes = 'Vui lòng chọn ít nhất 1 loại ẩm thực';
    }
    if (formData.specialtyDishes.length === 0) {
      newErrors.specialtyDishes = 'Vui lòng chọn ít nhất 1 món đặc trưng';
    }
    if (formData.timeSlots.length === 0) {
      newErrors.timeSlots = 'Vui lòng chọn ít nhất 1 thời gian phục vụ';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Vui lòng nhập miêu tả về quán';
    } else if (formData.description.trim().length < 50) {
      newErrors.description = 'Miêu tả phải có ít nhất 50 ký tự';
    }
    if (!formData.avatarImage) {
      newErrors.avatarImage = 'Vui lòng tải ảnh đại diện quán';
    }
    if (!formData.coverImage) {
      newErrors.coverImage = 'Vui lòng tải ảnh bìa quán';
    }
    if (!formData.menuImage) {
      newErrors.menuImage = 'Vui lòng tải ảnh menu quán';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 1 && !validateStep1()) {
      return;
    }
    if (currentStep === 2 && !validateStep2()) {
      return;
    }
    
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate step 3 before submitting
    if (!validateStep3()) {
      return;
    }
    
    // Check if restaurant role ID is loaded
    if (!restaurantRoleId) {
      alert('Lỗi: Không tìm thấy role RESTAURANT. Vui lòng thử lại!');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // ==========================================
      // STEP 1: UPLOAD ALL IMAGES FIRST
      // ==========================================
      console.log('🖼️  Step 1: Uploading all images to Cloudinary...');
      
      // 1.1: Upload CCCD images
      console.log('📤 Uploading CCCD images...');
      const cccdFrontFile = uploadService.dataUrlToFile(formData.cccdFront, 'cccd-front.jpg');
      const cccdBackFile = uploadService.dataUrlToFile(formData.cccdBack, 'cccd-back.jpg');
      
      const cccdFrontResult = await uploadService.uploadImage(cccdFrontFile, 'cccd');
      if (!cccdFrontResult.success || !cccdFrontResult.data) {
        throw new Error('Không thể upload ảnh CCCD mặt trước');
      }
      console.log('✅ CCCD Front URL:', cccdFrontResult.data.url);
      
      const cccdBackResult = await uploadService.uploadImage(cccdBackFile, 'cccd');
      if (!cccdBackResult.success || !cccdBackResult.data) {
        throw new Error('Không thể upload ảnh CCCD mặt sau');
      }
      console.log('✅ CCCD Back URL:', cccdBackResult.data.url);
      
      // 1.2: Upload business license images
      console.log('📤 Uploading business license images...');
      const businessLicenseFiles = formData.businessLicenses.map((dataUrl, index) =>
        uploadService.dataUrlToFile(dataUrl, `business-license-${index + 1}.jpg`)
      );
      
      const businessLicenseResult = await uploadService.uploadMultipleImages(
        businessLicenseFiles,
        'business-license'
      );
      
      if (!businessLicenseResult.success || !businessLicenseResult.data) {
        throw new Error('Không thể upload ảnh giấy phép kinh doanh');
      }
      console.log('✅ Business License URLs:', businessLicenseResult.data.map(img => img.url));
      
      // 1.3: Upload restaurant images (avatar, cover, menu)
      console.log('📤 Uploading restaurant images...');
      
      const avatarFile = uploadService.dataUrlToFile(formData.avatarImage, 'avatar.jpg');
      const avatarResult = await uploadService.uploadImage(avatarFile, 'restaurant');
      if (!avatarResult.success || !avatarResult.data) {
        throw new Error('Không thể upload ảnh đại diện nhà hàng');
      }
      console.log('✅ Avatar URL:', avatarResult.data.url);
      
      const coverFile = uploadService.dataUrlToFile(formData.coverImage, 'cover.jpg');
      const coverResult = await uploadService.uploadImage(coverFile, 'restaurant');
      if (!coverResult.success || !coverResult.data) {
        throw new Error('Không thể upload ảnh bìa nhà hàng');
      }
      console.log('✅ Cover URL:', coverResult.data.url);
      
      const menuFile = uploadService.dataUrlToFile(formData.menuImage, 'menu.jpg');
      const menuResult = await uploadService.uploadImage(menuFile, 'restaurant/menu');
      if (!menuResult.success || !menuResult.data) {
        throw new Error('Không thể upload ảnh menu');
      }
      console.log('✅ Menu URL:', menuResult.data.url);
      
      console.log('🎉 All images uploaded successfully to Cloudinary!');
      
      // ==========================================
      // STEP 2: CREATE USER ACCOUNT
      // ==========================================
      console.log('👤 Step 2: Creating user account with RESTAURANT role...');
      
      const createUserResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullname: formData.ownerName,
          password: formData.ownerPassword,
          email: formData.ownerEmail,
          phone: formData.ownerPhone,
          address: formData.ownerAddress,
          role: restaurantRoleId
        })
      });
      
      if (!createUserResponse.ok) {
        const errorData = await createUserResponse.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Không thể tạo tài khoản người dùng';
        
        if (errorMessage.toLowerCase().includes('phone') && errorMessage.toLowerCase().includes('exist')) {
          alert(`❌ Số điện thoại "${formData.ownerPhone}" đã được sử dụng.\n\nVui lòng sử dụng số điện thoại khác.`);
        } else if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('exist')) {
          alert(`❌ Email "${formData.ownerEmail}" đã được sử dụng.\n\nVui lòng sử dụng email khác.`);
        } else {
          alert(`❌ Lỗi tạo tài khoản: ${errorMessage}`);
        }
        throw new Error(errorMessage);
      }
      
      const userData = await createUserResponse.json();
      const userId = userData.userID || userData.userId;
      
      if (!userId) {
        throw new Error('Không nhận được userId từ server');
      }
      
      console.log('✅ User account created successfully! UserId:', userId);
      
      // ==========================================
      // STEP 3: CREATE RESTAURANT WITH IMAGE URLs
      // ==========================================
      console.log('🏪 Step 3: Creating restaurant with uploaded image URLs...');
      
      const restaurantData = {
        ownerId: userId,
        restaurantName: formData.restaurantName,
        address: formData.address,
        city: formData.city,
        ward: formData.ward,
        phone: formData.phone,
        latitude: formData.mapLocation?.lat || 0,
        longitude: formData.mapLocation?.lng || 0,
        avatarImage: avatarResult.data.url // ✅ URL from Cloudinary
      };
      
      console.log('📝 Restaurant data to send:', restaurantData);
      
      const restaurantResult = await restaurantService.createRestaurant(restaurantData);
      
      if (!restaurantResult.success || !restaurantResult.data) {
        const errorMessage = restaurantResult.message || 'Không thể tạo nhà hàng';
        
        if (errorMessage.toLowerCase().includes('phone') && errorMessage.toLowerCase().includes('exist')) {
          alert(`❌ Số điện thoại nhà hàng "${formData.phone}" đã được sử dụng.\n\nVui lòng sử dụng số điện thoại khác.`);
        } else {
          alert(`❌ Lỗi tạo nhà hàng: ${errorMessage}`);
        }
        throw new Error(errorMessage);
      }
      
      const restaurantId = restaurantResult.data.restaurantId;
      console.log('✅ Restaurant created successfully! RestaurantId:', restaurantId);
      console.log('🖼️  Avatar image saved to database:', restaurantData.avatarImage);
      
      // ==========================================
      // STEP 4: CREATE RESTAURANT DETAIL
      // ==========================================
      console.log('📋 Step 4: Creating restaurant detail...');
      
      const restaurantDetailData = {
        openingHours: formData.openingHours,
        restaurantTypes: formData.restaurantTypes,
        cuisines: formData.cuisineTypes,
        specialties: formData.specialtyDishes,
        description: formData.description,
        coverImage: coverResult.data.url, // ✅ URL from Cloudinary
        menuImages: [menuResult.data.url] // ✅ URL from Cloudinary
      };
      
      const restaurantDetailResult = await restaurantDetailService.createRestaurantDetail(
        restaurantId,
        restaurantDetailData
      );
      
      if (!restaurantDetailResult.success) {
        console.warn('⚠️  Failed to create restaurant detail:', restaurantDetailResult.message);
      } else {
        console.log('✅ Restaurant detail created successfully');
      }
      
      // ==========================================
      // STEP 5: CREATE ACCOUNT RESTAURANT DETAIL
      // ==========================================
      console.log('📝 Step 5: Creating account restaurant detail...');
      
      const accountRestaurantDetailData = {
        userId: userId,
        restaurantId: restaurantId,
        cccdImages: [
          {
            side: 'front',
            url: cccdFrontResult.data.url // ✅ URL from Cloudinary
          },
          {
            side: 'back',
            url: cccdBackResult.data.url // ✅ URL from Cloudinary
          }
        ],
        businessLicenseImages: businessLicenseResult.data.map(img => img.url) // ✅ URLs from Cloudinary
      };
      
      const accountDetailResult = await accountRestaurantDetailService.createAccountRestaurantDetail(
        accountRestaurantDetailData
      );
      
      if (!accountDetailResult.success) {
        console.warn('⚠️  Failed to create account detail:', accountDetailResult.message);
      } else {
        console.log('✅ Account restaurant detail created successfully');
      }
      
      // ==========================================
      // SUCCESS!
      // ==========================================
      console.log('🎉 ===== REGISTRATION COMPLETED SUCCESSFULLY! =====');
      console.log('👤 User ID:', userId);
      console.log('🏪 Restaurant ID:', restaurantId);
      console.log('🖼️  All images saved with Cloudinary URLs');
      
      setSuccessData({
        email: formData.ownerEmail,
        restaurantName: formData.restaurantName
      });
      setShowSuccessModal(true);
      
    } catch (error: any) {
      console.error('❌ Error submitting form:', error);
      alert(error.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <TopNavigation />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Đăng ký nhà hàng
            </h1>
            <p className="text-gray-600">
              Hoàn thành các bước để trở thành đối tác của chúng tôi
            </p>
          </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 -z-10">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
              />
            </div>

            {STEPS.map((step) => {
              const isCompleted = currentStep > step.number;
              const isCurrent = currentStep === step.number;
              const Icon = step.icon;

              return (
                <div key={step.number} className="flex flex-col items-center flex-1">
                  <div
                    className={`
                      w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                      ${isCompleted ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg' : ''}
                      ${isCurrent ? 'bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg scale-110' : ''}
                      ${!isCompleted && !isCurrent ? 'bg-white border-2 border-gray-300' : ''}
                    `}
                  >
                    {isCompleted ? (
                      <Check className="w-8 h-8 text-white" />
                    ) : (
                      <Icon className={`w-8 h-8 ${isCurrent ? 'text-white' : 'text-gray-400'}`} />
                    )}
                  </div>
                  <div className="text-center">
                    <div className={`font-semibold text-sm ${isCurrent ? 'text-orange-600' : 'text-gray-600'}`}>
                      Bước {step.number}
                    </div>
                    <div className={`text-xs ${isCurrent ? 'text-orange-600' : 'text-gray-500'}`}>
                      {step.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Store className="w-7 h-7 text-orange-500" />
                Thông tin cơ bản
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Restaurant Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên quán <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.restaurantName}
                    onChange={(e) => handleInputChange('restaurantName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                      errors.restaurantName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập tên nhà hàng"
                  />
                  {errors.restaurantName && (
                    <p className="text-sm text-red-500 mt-1">{errors.restaurantName}</p>
                  )}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Số nhà, tên đường"
                    />
                  </div>
                  {errors.address && (
                    <p className="text-sm text-red-500 mt-1">{errors.address}</p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Thành phố <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Chọn thành phố</option>
                    {CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  {errors.city && (
                    <p className="text-sm text-red-500 mt-1">{errors.city}</p>
                  )}
                </div>

                {/* Ward / District */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phường / Xã <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.ward}
                    onChange={(e) => handleInputChange('ward', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                      errors.ward ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={!formData.city}
                  >
                    <option value="">Chọn phường/xã</option>
                    {DISTRICTS_HCM.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                  {errors.ward && (
                    <p className="text-sm text-red-500 mt-1">{errors.ward}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại liên hệ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0xxx xxx xxx"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Map Location */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Định vị trên bản đồ <span className="text-red-500">*</span>
                  </label>
                  <MapPicker
                    onLocationSelect={(lat, lng) => {
                      handleInputChange('mapLocation', { lat, lng });
                    }}
                    initialLat={formData.mapLocation?.lat}
                    initialLng={formData.mapLocation?.lng}
                    height="450px"
                  />
                  {errors.mapLocation && (
                    <p className="text-sm text-red-500 mt-2">{errors.mapLocation}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Owner Info */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-7 h-7 text-orange-500" />
                Thông tin người đại diện
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Owner Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Họ tên người đại diện <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                      errors.ownerName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Họ và tên đầy đủ"
                  />
                  {errors.ownerName && (
                    <p className="text-sm text-red-500 mt-1">{errors.ownerName}</p>
                  )}
                </div>

                {/* Owner Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.ownerEmail}
                      onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                        errors.ownerEmail ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="email@example.com"
                    />
                  </div>
                  {errors.ownerEmail && (
                    <p className="text-sm text-red-500 mt-1">{errors.ownerEmail}</p>
                  )}
                </div>

                {/* Owner Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">(Phải khác số điện thoại nhà hàng)</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.ownerPhone}
                      onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                        errors.ownerPhone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0xxx xxx xxx"
                    />
                  </div>
                  {errors.ownerPhone && (
                    <p className="text-sm text-red-500 mt-1">{errors.ownerPhone}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.ownerPassword}
                    onChange={(e) => handleInputChange('ownerPassword', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                      errors.ownerPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ít nhất 6 ký tự"
                  />
                  {errors.ownerPassword && (
                    <p className="text-sm text-red-500 mt-1">{errors.ownerPassword}</p>
                  )}
                </div>

                {/* Password Confirmation */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.ownerPasswordConfirm}
                    onChange={(e) => handleInputChange('ownerPasswordConfirm', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                      errors.ownerPasswordConfirm ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập lại mật khẩu"
                  />
                  {errors.ownerPasswordConfirm && (
                    <p className="text-sm text-red-500 mt-1">{errors.ownerPasswordConfirm}</p>
                  )}
                </div>

                {/* Owner Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Địa chỉ cá nhân <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.ownerAddress}
                      onChange={(e) => handleInputChange('ownerAddress', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                        errors.ownerAddress ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Địa chỉ thường trú"
                    />
                  </div>
                  {errors.ownerAddress && (
                    <p className="text-sm text-red-500 mt-1">{errors.ownerAddress}</p>
                  )}
                </div>

                {/* CCCD */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CCCD - Mặt trước <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    {formData.cccdFront ? (
                      <div className="relative rounded-lg overflow-hidden border-2 border-green-500">
                        <img src={formData.cccdFront} alt="CCCD Front" className="w-full h-48 object-cover" />
                        <button
                          onClick={() => handleInputChange('cccdFront', '')}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-orange-500 transition">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click để tải ảnh</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload('cccdFront', e.target.files)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  {errors.cccdFront && (
                    <p className="text-sm text-red-500 mt-1">{errors.cccdFront}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CCCD - Mặt sau <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    {formData.cccdBack ? (
                      <div className="relative rounded-lg overflow-hidden border-2 border-green-500">
                        <img src={formData.cccdBack} alt="CCCD Back" className="w-full h-48 object-cover" />
                        <button
                          onClick={() => handleInputChange('cccdBack', '')}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-orange-500 transition">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click để tải ảnh</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload('cccdBack', e.target.files)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  {errors.cccdBack && (
                    <p className="text-sm text-red-500 mt-1">{errors.cccdBack}</p>
                  )}
                </div>

                {/* Business Licenses */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giấy đăng ký kinh doanh <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">(Tối đa 10 ảnh)</span>
                  </label>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {formData.businessLicenses.map((image, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden border-2 border-green-500">
                        <img src={image} alt={`License ${index + 1}`} className="w-full h-32 object-cover" />
                        <button
                          onClick={() => removeBusinessLicense(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    {formData.businessLicenses.length < 10 && (
                      <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-orange-500 transition flex items-center justify-center h-32">
                        <div>
                          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-600">Thêm ảnh</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleMultiImageUpload(e.target.files)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  {errors.businessLicenses && (
                    <p className="text-sm text-red-500 mt-2">{errors.businessLicenses}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-7 h-7 text-orange-500" />
                Thông tin quán chi tiết
              </h2>

              <div className="grid grid-cols-1 gap-6">
                {/* Opening Hours */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Thời gian mở cửa <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Open Time */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Giờ mở cửa</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <select
                          value={openTime}
                          onChange={(e) => handleOpenTimeChange(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition border-gray-300 bg-white"
                        >
                          {TIME_OPTIONS.map((time) => (
                            <option key={`open-${time}`} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {/* Close Time */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Giờ đóng cửa</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <select
                          value={closeTime}
                          onChange={(e) => handleCloseTimeChange(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition border-gray-300 bg-white"
                        >
                          {TIME_OPTIONS.map((time) => (
                            <option key={`close-${time}`} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Giờ hoạt động: {openTime} - {closeTime}
                  </p>
                  {errors.openingHours && (
                    <p className="text-sm text-red-500 mt-1">{errors.openingHours}</p>
                  )}
                </div>

                {/* Restaurant Types */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Loại hình quán <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">(Tối đa 2)</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {RESTAURANT_TYPES.map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleMultiSelect('restaurantTypes', type, 2)}
                        className={`
                          px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium
                          ${formData.restaurantTypes.includes(type)
                            ? 'border-orange-500 bg-orange-50 text-orange-600'
                            : 'border-gray-200 hover:border-orange-300 text-gray-700'
                          }
                        `}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  {errors.restaurantTypes && (
                    <p className="text-sm text-red-500 mt-2">{errors.restaurantTypes}</p>
                  )}
                </div>

                {/* Cuisine Types */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ẩm thực <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {CUISINE_TYPES.map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleMultiSelect('cuisineTypes', type, 99)}
                        className={`
                          px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium
                          ${formData.cuisineTypes.includes(type)
                            ? 'border-orange-500 bg-orange-50 text-orange-600'
                            : 'border-gray-200 hover:border-orange-300 text-gray-700'
                          }
                        `}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  {errors.cuisineTypes && (
                    <p className="text-sm text-red-500 mt-2">{errors.cuisineTypes}</p>
                  )}
                </div>

                {/* Specialty Dishes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Món đặc trưng <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">(Tối đa 3)</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {SPECIALTY_DISHES.map(dish => (
                      <button
                        key={dish}
                        type="button"
                        onClick={() => handleMultiSelect('specialtyDishes', dish, 3)}
                        className={`
                          px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium
                          ${formData.specialtyDishes.includes(dish)
                            ? 'border-orange-500 bg-orange-50 text-orange-600'
                            : 'border-gray-200 hover:border-orange-300 text-gray-700'
                          }
                        `}
                      >
                        {dish}
                      </button>
                    ))}
                  </div>
                  {errors.specialtyDishes && (
                    <p className="text-sm text-red-500 mt-2">{errors.specialtyDishes}</p>
                  )}
                </div>

                {/* Time Slots */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Thời gian phục vụ <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {TIME_SLOTS.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleMultiSelect('timeSlots', slot, 99)}
                        className={`
                          px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium
                          ${formData.timeSlots.includes(slot)
                            ? 'border-orange-500 bg-orange-50 text-orange-600'
                            : 'border-gray-200 hover:border-orange-300 text-gray-700'
                          }
                        `}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  {errors.timeSlots && (
                    <p className="text-sm text-red-500 mt-2">{errors.timeSlots}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Miêu tả về quán <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">(Tối thiểu 50 ký tự)</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition resize-none ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập miêu tả chi tiết về quán của bạn (món ăn đặc trưng, không gian, dịch vụ...)"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      {formData.description.length}/50 ký tự
                    </p>
                    {errors.description && (
                      <p className="text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>
                </div>
                
                {/* Images */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Avatar Image */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ảnh đại diện <span className="text-red-500">*</span>
                    </label>
                    {formData.avatarImage ? (
                      <div className="relative rounded-lg overflow-hidden border-2 border-green-500">
                        <img src={formData.avatarImage} alt="Avatar" className="w-full h-48 object-cover" />
                        <button
                          onClick={() => handleInputChange('avatarImage', '')}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-orange-500 transition h-48 flex flex-col items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Tải ảnh lên</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload('avatarImage', e.target.files)}
                          className="hidden"
                        />
                      </label>
                    )}
                    {errors.avatarImage && (
                      <p className="text-sm text-red-500 mt-1">{errors.avatarImage}</p>
                    )}
                  </div>

                  {/* Cover Image */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ảnh bìa <span className="text-red-500">*</span>
                    </label>
                    {formData.coverImage ? (
                      <div className="relative rounded-lg overflow-hidden border-2 border-green-500">
                        <img src={formData.coverImage} alt="Cover" className="w-full h-48 object-cover" />
                        <button
                          onClick={() => handleInputChange('coverImage', '')}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-orange-500 transition h-48 flex flex-col items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Tải ảnh lên</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload('coverImage', e.target.files)}
                          className="hidden"
                        />
                      </label>
                    )}
                    {errors.coverImage && (
                      <p className="text-sm text-red-500 mt-1">{errors.coverImage}</p>
                    )}
                  </div>

                  {/* Menu Image */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ảnh menu <span className="text-red-500">*</span>
                    </label>
                    {formData.menuImage ? (
                      <div className="relative rounded-lg overflow-hidden border-2 border-green-500">
                        <img src={formData.menuImage} alt="Menu" className="w-full h-48 object-cover" />
                        <button
                          onClick={() => handleInputChange('menuImage', '')}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-orange-500 transition h-48 flex flex-col items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Tải ảnh lên</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload('menuImage', e.target.files)}
                          className="hidden"
                        />
                      </label>
                    )}
                    {errors.menuImage && (
                      <p className="text-sm text-red-500 mt-1">{errors.menuImage}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all
                ${currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              <ChevronLeft className="w-5 h-5" />
              Quay lại
            </button>

            {currentStep < STEPS.length ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 hover:shadow-xl"
              >
                Tiếp theo
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`
                  flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all shadow-lg
                  ${isSubmitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-xl'
                  }
                `}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Hoàn tất đăng ký
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    <Footer />
    
    {/* Success Modal */}
    {showSuccessModal && successData && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              Đăng ký thành công!
            </h2>
          </div>
          
          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <Mail className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-700">Email đăng nhập</p>
                  <p className="text-base text-gray-900 font-medium">{successData.email}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 mb-3">
                <Store className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-700">Nhà hàng</p>
                  <p className="text-base text-gray-900 font-medium">{successData.restaurantName}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-700">Trạng thái</p>
                  <p className="text-base text-gray-900 font-medium">Mật khẩu đã được thiết lập</p>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800 mb-2">
                <span className="font-semibold">⏳ Đang chờ phê duyệt</span>
              </p>
              <p className="text-sm text-amber-700">
                Tài khoản của bạn đang chờ phê duyệt từ quản trị viên. 
                Bạn sẽ nhận được thông báo qua email khi tài khoản được kích hoạt.
              </p>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/');
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default AdminRegister;
