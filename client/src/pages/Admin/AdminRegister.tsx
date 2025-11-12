import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import TopNavigation from '../../components/ui/Header/Header';
import Footer from '../../components/ui/Footer/Footer';

// Types
interface RestaurantFormData {
  // Step 1: Basic Info
  restaurantName: string;
  address: string;
  phone: string;
  city: string;
  district: string;
  mapLocation: { lat: number; lng: number } | null;
  
  // Step 2: Owner Info
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerPhoneAlt: string;
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

const AdminRegister: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<RestaurantFormData>({
    restaurantName: '',
    address: '',
    phone: '',
    city: '',
    district: '',
    mapLocation: null,
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerPhoneAlt: '',
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

  const handleInputChange = (field: keyof RestaurantFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
    if (!formData.district) {
      newErrors.district = 'Vui lòng chọn quận/huyện';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại liên hệ';
    } else {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        newErrors.phone = 'Số điện thoại không hợp lệ (10-11 chữ số)';
      }
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
      }
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
    
    try {
      console.log('Submitting form data:', formData);
      // TODO: Submit to API
      alert('Đăng ký thành công! Chờ phê duyệt.');
      navigate('/');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  // Helper functions to check if step is complete (for button state)
  const isStep1Complete = (): boolean => {
    return !!(
      formData.restaurantName.trim() &&
      formData.address.trim() &&
      formData.city &&
      formData.district &&
      formData.phone.trim() &&
      /^[0-9]{10,11}$/.test(formData.phone.trim())
    );
  };

  const isStep2Complete = (): boolean => {
    return !!(
      formData.ownerName.trim() &&
      formData.ownerEmail.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail.trim()) &&
      formData.ownerPhone.trim() &&
      /^[0-9]{10,11}$/.test(formData.ownerPhone.trim()) &&
      formData.cccdFront &&
      formData.cccdBack &&
      formData.businessLicenses.length > 0
    );
  };

  const isStep3Complete = (): boolean => {
    return !!(
      formData.openingHours.trim() &&
      formData.restaurantTypes.length > 0 &&
      formData.cuisineTypes.length > 0 &&
      formData.specialtyDishes.length > 0 &&
      formData.timeSlots.length > 0 &&
      formData.description.trim().length >= 50 &&
      formData.avatarImage &&
      formData.coverImage &&
      formData.menuImage
    );
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

                {/* District */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quận / Huyện <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                      errors.district ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={!formData.city}
                  >
                    <option value="">Chọn quận/huyện</option>
                    {DISTRICTS_HCM.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                  {errors.district && (
                    <p className="text-sm text-red-500 mt-1">{errors.district}</p>
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
                    Định vị trên bản đồ
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      Click để chọn vị trí trên bản đồ
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      (Tính năng sẽ được cập nhật)
                    </p>
                  </div>
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

                {/* Owner Phone Alt */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại khác
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.ownerPhoneAlt}
                      onChange={(e) => handleInputChange('ownerPhoneAlt', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                      placeholder="0xxx xxx xxx (tùy chọn)"
                    />
                  </div>
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
                  <div className="relative">
                    <Clock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.openingHours}
                      onChange={(e) => handleInputChange('openingHours', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                        errors.openingHours ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="VD: 8:00 - 22:00"
                    />
                  </div>
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

                {/* Description - already has error handling */}
                
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
                disabled={
                  (currentStep === 1 && !isStep1Complete()) ||
                  (currentStep === 2 && !isStep2Complete())
                }
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg
                  ${(currentStep === 1 && !isStep1Complete()) || (currentStep === 2 && !isStep2Complete())
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 hover:shadow-xl'
                  }
                `}
              >
                Tiếp theo
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isStep3Complete()}
                className={`
                  flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all shadow-lg
                  ${!isStep3Complete()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-xl'
                  }
                `}
              >
                <Check className="w-5 h-5" />
                Hoàn tất đăng ký
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default AdminRegister;
