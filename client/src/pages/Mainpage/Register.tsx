import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Button, 
  Input, 
  Label,
  Checkbox,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../../components/ui'
import { Eye, EyeOff, Lock, User, Phone, Loader2, Mail, MapPin } from 'lucide-react'
import TopNavigation from '../../components/ui/Header/Header'
import Footer from '../../components/ui/Footer/Footer'
import { registerService } from '../../services/registerService'
import { toast } from 'sonner'

const Register: React.FC = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  })

  // Set page title
  useEffect(() => {
    document.title = 'Đăng ký tài khoản - BookCity.VN'
    return () => {
      document.title = 'BookCity.VN - Hệ thống nhà sách trực tuyến'
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const validateForm = (): boolean => {
    // Validate full name
    if (!formData.fullName.trim()) {
      toast.error('Vui lòng nhập tên tài khoản')
      return false
    }

    if (formData.fullName.trim().length < 3) {
      toast.error('Tên tài khoản phải có ít nhất 3 ký tự')
      return false
    }

    // Validate email
    if (!formData.email.trim()) {
      toast.error('Vui lòng nhập email')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Email không hợp lệ')
      return false
    }

    // Validate phone
    if (!formData.phone.trim()) {
      toast.error('Vui lòng nhập số điện thoại')
      return false
    }

    const phoneRegex = /^[0-9]{10,11}$/
    if (!phoneRegex.test(formData.phone.trim())) {
      toast.error('Số điện thoại không hợp lệ')
      return false
    }

    // Validate address
    if (!formData.address.trim()) {
      toast.error('Vui lòng nhập địa chỉ')
      return false
    }

    if (formData.address.trim().length < 10) {
      toast.error('Địa chỉ phải có ít nhất 10 ký tự')
      return false
    }

    // Validate password
    if (!formData.password) {
      toast.error('Vui lòng nhập mật khẩu')
      return false
    }

    if (formData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự')
      return false
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      toast.error('Vui lòng xác nhận mật khẩu')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp')
      return false
    }

    // Validate terms
    if (!formData.acceptTerms) {
      toast.error('Vui lòng đồng ý với điều khoản sử dụng')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

         try {
       // Register account directly - let backend handle phone validation
       const registerData = {
         accountName: formData.fullName.trim(),
         accountPhone: formData.phone.trim(),
         email: formData.email.trim(),
         address: formData.address.trim(),
         password: formData.password
       }

       // eslint-disable-next-line @typescript-eslint/no-unused-vars
       const result = await registerService.registerAccount(registerData)
      
      toast.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.')
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false
      })
      
      // Navigate to login
      navigate('/')
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         } catch (error: any) {
       let errorMessage = 'Không thể đăng ký tài khoản. Vui lòng thử lại!'
       
       if (error.response?.status === 400) {
         errorMessage = error.response?.data?.message || 'Thông tin đăng ký không hợp lệ'
       } else if (error.response?.status === 409) {
         errorMessage = 'Số điện thoại này đã được đăng ký'
       } else if (error.response?.status === 500) {
         errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau!'
       } else if (error.message) {
         errorMessage = error.message
       }
       
       toast.error(errorMessage)
     } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    // Navigate back to home using React Router
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopNavigation />
      
      <main className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-400 to-orange-600 text-white">
                <CardTitle className="text-2xl font-bold text-center">
                  Đăng ký tài khoản
                </CardTitle>
                <CardDescription className="text-white text-center">
                  Tạo tài khoản mới để khám phá thế giới sách
                </CardDescription>
              </CardHeader>

              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      Họ và tên *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="Nhập họ và tên đầy đủ"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="pl-10 h-12 text-base"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Nhập địa chỉ email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10 h-12 text-base"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Số điện thoại *
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Nhập số điện thoại (10-11 số)"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="pl-10 h-12 text-base"
                        required
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium">
                      Địa chỉ *
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="address"
                        name="address"
                        type="text"
                        placeholder="Nhập địa chỉ chi tiết (số nhà, đường, phường, quận)"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="pl-10 h-12 text-base"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Mật khẩu *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Nhập mật khẩu"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10 pr-10 h-12 text-base"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Xác nhận mật khẩu *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Nhập lại mật khẩu"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-10 pr-10 h-12 text-base"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Accept Terms */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-white">
                      <Checkbox
                        id="acceptTerms"
                        name="acceptTerms"
                        checked={formData.acceptTerms}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, acceptTerms: checked as boolean }))
                        }
                        required
                      />
                      <Label htmlFor="acceptTerms" className="text-sm text-gray-600">
                        Tôi đồng ý với{' '}
                        <a href="#" className="text-orange-500 hover:text-orange-600 underline">
                          Điều khoản sử dụng
                        </a>{' '}
                        và{' '}
                        <a href="#" className="text-orange-00 hover:text-orange-600 underline">
                          Chính sách bảo mật
                        </a>
                      </Label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 h-12 text-base rounded-md"
                    disabled={!formData.acceptTerms || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang đăng ký...
                      </>
                    ) : (
                      'Đăng ký tài khoản'
                    )}
                  </Button>

                  {/* Login Link */}
                  <div className="pt-4 border-t border-gray-200 text-center space-y-3">
                    <p className="text-sm text-gray-600">
                      Đã có tài khoản?{' '}
                      <button
                        type="button"
                        onClick={handleBackToLogin}
                        className="text-orange-500 hover:text-orange-600 font-semibold underline"
                      >
                        Đăng nhập ngay
                      </button>
                    </p>
                    
                    {/* Business Registration Link */}
                    <div className="pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => navigate('/admin/register')}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline flex items-center justify-center gap-1 mx-auto"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Đăng ký tài khoản dành cho doanh nghiệp - nhà hàng
                      </button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Register