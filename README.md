# FastFood Delivery - Hệ Thống Giao Hàng Đồ Ăn Nhanh 🍕🚁

## 📋 Mô Tả Dự Án

**FastFood Delivery** là một nền tảng giao hàng đồ ăn nhanh hiện đại, cho phép khách hàng đặt món từ các nhà hàng yêu thích, thanh toán an toàn qua VNPay hoặc COD, và theo dõi giao hàng real-time bằng drone.

### ✨ Tính Năng Chính

- 🔐 **Xác thực người dùng** - Đăng nhập với số điện thoại & mật khẩu, phân quyền theo vai trò
- 🛡️ **Phân quyền theo vai trò** - Hệ thống RBAC (Role-Based Access Control):
  - **Customer**: Mua hàng, xem lịch sử đơn hàng, đánh giá
  - **Restaurant Owner**: Quản lý nhà hàng, thực đơn, xử lý đơn hàng
  - **Admin**: Quản lý toàn hệ thống, drone, người dùng
- 🍽️ **Quản lý nhà hàng & thực đơn** - CRUD operations cho món ăn với upload ảnh Cloudinary
- 🛒 **Giỏ hàng thông minh** - Multi-cart cho nhiều nhà hàng, cập nhật real-time
- 📦 **Quản lý đơn hàng** - Theo dõi trạng thái từ PENDING → COMPLETED/CANCELLED
- 💳 **Thanh toán đa dạng** - Hỗ trợ 2 phương thức:
  - COD (Thanh toán khi nhận hàng)
  - VNPay (Thanh toán online an toàn với HMAC-SHA512)
- 🚁 **Giao hàng bằng Drone** - Tạo, quản lý drone, kiểm tra pin & trạng thái
- 📍 **Theo dõi real-time** - WebSocket STOMP + Redis cho tracking vị trí drone
- 📱 **Tích hợp bản đồ** - OpenStreetMap API cho autocomplete địa chỉ
- ⭐ **Đánh giá & Feedback** - Khách hàng đánh giá sau khi hoàn thành đơn hàng
- 🕒 **Lịch sử đơn hàng chi tiết** - Hiển thị đầy đủ ngày giờ phút giây

### 🏗️ Kiến Trúc

**Kiến trúc phân lớp (Layered Architecture):**

1. **Presentation Layer** - React Frontend với TypeScript
2. **API Gateway** - REST Controllers (Spring Boot)
3. **Business Logic Layer** - Services với business rules
4. **Data Access Layer** - MongoDB Repositories
5. **External Services** - VNPay, Cloudinary, OpenStreetMap, Redis

**Các Service chính:**
- `AuthService` - Xác thực & phân quyền
- `CartService` - Quản lý giỏ hàng
- `OrderService` - Xử lý đơn hàng
- `PaymentService` - Tích hợp VNPay
- `MenuItemService` - Quản lý thực đơn
- `RatingService` - Đánh giá & bình luận
- `RestaurantService` - Quản lý nhà hàng
- `DroneService` - Quản lý drone & delivery
- `LocationService` - Redis-based real-time tracking

### 🛠️ Tech Stack

**Backend:**
- **Framework**: Spring Boot 3.5.5
- **Language**: Java 17
- **Database**: MongoDB (NoSQL)
- **Cache & Real-time**: Redis (location tracking, session)
- **Real-time Communication**: WebSocket STOMP
- **Build Tool**: Maven
- **Security**: Role-based Access Control (RBAC)

**Frontend:**
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Lucide Icons
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Toast Notifications**: Sonner

**External Services:**
- **Payment Gateway**: VNPay Sandbox (HMAC-SHA512)
- **Image Storage**: Cloudinary CDN
- **Maps & Geocoding**: OpenStreetMap Nominatim API
- **Location Services**: Redis GeoSpatial

### 📁 Cấu Trúc Project

```
FastFood-Delivery/
├── server/                     # Spring Boot Backend
│   ├── src/main/java/com/FastFoodDelivery/
│   │   ├── controller/         # REST API Controllers
│   │   │   ├── AuthController.java
│   │   │   ├── CartController.java
│   │   │   ├── OrderController.java
│   │   │   ├── PaymentController.java
│   │   │   ├── DroneController.java
│   │   │   └── ... (11 controllers)
│   │   ├── service/            # Business Logic Services
│   │   │   ├── Impl/           # Service Implementations
│   │   │   └── ... (9 services)
│   │   ├── entity/             # MongoDB Document Models
│   │   ├── repository/         # Data Access Layer
│   │   ├── dto/                # Data Transfer Objects
│   │   │   ├── request/
│   │   │   └── response/
│   │   └── config/             # Configuration Classes
│   │       ├── WebSocketConfig.java
│   │       ├── CloudinaryConfig.java
│   │       └── RedisConfig.java
│   └── pom.xml                 # Maven Dependencies
│
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable Components
│   │   │   ├── Cart.tsx
│   │   │   ├── ProductItem.tsx
│   │   │   ├── RestaurantGrid.tsx
│   │   │   ├── DroneLocationTracker.tsx
│   │   │   ├── OpenStreetMapAutocomplete.tsx
│   │   │   └── ui/             # UI Components
│   │   ├── pages/              # Page Components
│   │   │   ├── Customer/       # Customer Dashboard
│   │   │   │   ├── OrderHistory.tsx
│   │   │   │   └── OrderDetail.tsx
│   │   │   ├── Restaurant/     # Restaurant Dashboard
│   │   │   │   ├── RestaurantDetail.tsx
│   │   │   │   └── MenuManagement.tsx
│   │   │   ├── Admin/          # Admin Dashboard
│   │   │   ├── Home/           # Landing Page
│   │   │   ├── Checkout/       # Checkout Flow
│   │   │   └── ...
│   │   ├── services/           # API Client Services
│   │   │   ├── authService.ts
│   │   │   ├── cartService.ts
│   │   │   ├── orderService.ts
│   │   │   ├── droneService.ts
│   │   │   ├── locationService.ts
│   │   │   └── ...
│   │   ├── store/              # Redux Store
│   │   │   ├── authSlice.ts
│   │   │   ├── cartSlice.ts
│   │   │   └── index.ts
│   │   ├── utils/              # Utility Functions
│   │   │   └── roleCheck.ts    # RBAC Helper
│   │   ├── types/              # TypeScript Types
│   │   └── config/             # App Configuration
│   └── package.json
│
├── docs/                       # Documentation
│   ├── MONGODB_SCHEMAS.md      # Database Schema (Prisma-style)
│   ├── DELIVERY_DRONE_COMPLETE_SUMMARY.md
│   ├── LOCATION_REDIS_INTEGRATION.md
│   └── ...
│
└── README.md                   # This file
```

### 📊 Database Schema (MongoDB)

**11 Collections:**

| Collection | Mô tả | Key Fields |
|------------|-------|------------|
| `users` | Người dùng hệ thống | accountId, phoneNumber, fullName, roles[] |
| `roles` | Vai trò (RBAC) | roleId, roleName (CUSTOMER/RESTAURANT/ADMIN) |
| `restaurants` | Nhà hàng | restaurantId, name, address, city, district |
| `restaurant_details` | Chi tiết nhà hàng | accountId, description, bankInfo |
| `menuitems` | Thực đơn | menuItemId, name, price, imageUrl |
| `categories` | Danh mục món ăn | categoryId, name |
| `carts` | Giỏ hàng | cartId, userId, restaurantId, items[] |
| `orders` | Đơn hàng | orderId, status, orderItems[], finalAmount |
| `payments` | Thanh toán | paymentId, orderId, method (VNPAY/COD) |
| `ratings` | Đánh giá | ratingId, orderId, stars, comment |
| `drones` | Drone giao hàng | droneId, battery, status, deliveryCount |
| `locations` | Vị trí real-time | droneId, latitude, longitude (Redis GeoSpatial) |

📖 **Chi tiết schema**: [MONGODB_SCHEMAS.md](./MONGODB_SCHEMAS.md)

### 🔌 API Endpoints (50+ Endpoints)

Được tổ chức thành **11 nhóm chức năng:**

| Nhóm | Endpoints | Chức Năng Chính |
|------|-----------|-----------------|
| **Authentication** | 2 | Login, Logout |
| **Users** | 5 | CRUD users, Get by phone/role |
| **Roles** | 3 | CRUD roles |
| **Restaurants** | 8 | CRUD restaurants, Filter by location, Get details |
| **Menu Items** | 6 | CRUD menu items, Upload images, Get by restaurant |
| **Categories** | 4 | CRUD categories |
| **Carts** | 8 | Add/Update/Remove items, Get cart details, Clear cart |
| **Orders** | 8 | Create order, Update status, Get order history, Cancel |
| **Payments** | 3 | VNPay create/callback, COD payment |
| **Ratings** | 4 | Create rating, Get by order/restaurant |
| **Drones** | 7 | CRUD drones, Assign to order, Update location |
| **Locations** | 3 | Track drone, Get real-time position (Redis) |
| **WebSocket** | - | STOMP `/ws/tracking`, Subscribe `/topic/drone/{id}` |

📖 **API Documentation**: Xem chi tiết tại [API_SWAGGER.yaml](./API_SWAGGER.yaml) hoặc Swagger UI khi chạy server

### 🚀 Tính Năng Nổi Bật

#### 1️⃣ Phân Quyền Theo Vai Trò (RBAC)
- ✅ **Customer**: Chỉ được mua hàng, không thể truy cập admin/restaurant features
- ✅ **Restaurant Owner**: Quản lý nhà hàng, menu, đơn hàng của mình
- ✅ **Admin**: Toàn quyền quản lý hệ thống
- ✅ Kiểm tra quyền ở cả Frontend (React) và Backend (Spring Security)
- ✅ Toast notifications khi vi phạm quyền truy cập

#### 2️⃣ Thanh Toán An Toàn (VNPay Integration)
- ✅ **HMAC-SHA512** hash validation
- ✅ **Idempotent** payment processing (tránh duplicate transaction)
- ✅ **Atomic transaction** với @Transactional
- ✅ **Unique vnpTxnRef** per order (UUID-based)
- ✅ **Payment expiration** (15 phút timeout)
- ✅ Support cả **VNPay** và **COD** (Cash on Delivery)

#### 3️⃣ Theo Dõi Giao Hàng Real-time
- 🔗 **STOMP Protocol** qua WebSocket endpoint `/ws/tracking`
- 📡 **Subscribe** `/topic/drone/{droneId}` để nhận location updates
- ⚡ **Redis GeoSpatial** cho high-performance location storage
- 📍 **OpenStreetMap** integration cho địa chỉ autocomplete
- �️ Hiển thị vị trí drone trên bản đồ (React component)

#### 4️⃣ Quản Lý Drone Thông Minh
- 🚁 **CRUD operations** đầy đủ
- 🔋 **Kiểm tra pin** trước khi giao (minimum 20%)
- 📊 **Thống kê** số lần giao hàng (deliveryCount)
- ⚠️ **Quản lý trạng thái**: IDLE → DELIVERING → CHARGING
- 🎯 **Auto-assign** drone gần nhất với pin đủ

#### 5️⃣ Multi-Cart System
- 🛒 Hỗ trợ **nhiều giỏ hàng** từ nhiều nhà hàng khác nhau
- ⚡ **Real-time update** số lượng và tổng tiền
- 💾 **Persistent** cart data (MongoDB)
- 🔄 **Auto-sync** khi user login/logout

### 🔄 Quy Trình Chính

#### **Quy Trình Đặt Hàng & Thanh Toán:**
```
1. 👤 Customer đăng nhập (Role check: CUSTOMER only)
   ↓
2. 🔍 Browse nhà hàng theo city/district (OpenStreetMap autocomplete)
   ↓
3. 📋 Xem menu món ăn (Filter by category, Search)
   ↓
4. 🛒 Thêm vào giỏ hàng (Multi-cart support)
   ↓
5. 💳 Checkout - Chọn địa chỉ giao hàng
   ↓
6. 💰 Chọn phương thức thanh toán:
   - VNPay (Redirect to VNPay sandbox)
   - COD (Cash on Delivery)
   ↓
7. ✅ Tạo đơn hàng (Status: PENDING)
   ↓
8. 🏪 Restaurant xác nhận đơn (Status: CONFIRMED)
   ↓
9. 🚁 Hệ thống gán drone (Check: battery >= 20%)
   ↓
10. 📍 Customer theo dõi real-time qua WebSocket
   ↓
11. 🎯 Drone giao hàng (Status: DELIVERING → COMPLETED)
   ↓
12. ⭐ Customer đánh giá (Rating & Review)
```

#### **Quy Trình Quản Lý Nhà Hàng:**
```
1. 🏪 Restaurant Owner đăng nhập
   ↓
2. ➕ Tạo/Cập nhật thông tin nhà hàng
   ↓
3. 📸 Upload ảnh (Cloudinary integration)
   ↓
4. 🍕 Quản lý menu items (CRUD operations)
   ↓
5. 📦 Xem & xử lý đơn hàng
   ↓
6. ✅ Xác nhận/Hủy đơn hàng
```

### 📋 Hướng Dẫn Setup

#### **Yêu Cầu Hệ Thống:**
- ☕ **Java 17 or higher**
- 📦 **Node.js 18+ & npm/pnpm**
- 🍃 **MongoDB 6.0+** (running on localhost:27017)
- 🔴 **Redis 7.0+** (running on localhost:6379)
- 🌐 **Internet connection** (for VNPay, Cloudinary, OpenStreetMap API)

#### **1. Clone Repository**
```bash
git clone https://github.com/TrungWolford/FastFood-Delivery.git
cd FastFood-Delivery
```

#### **2. Setup Backend (Spring Boot)**
```bash
cd server

# Cấu hình application.properties (nếu cần)
# - MongoDB URI
# - Redis host/port
# - VNPay credentials
# - Cloudinary API keys

# Build & Run
mvn clean install
mvn spring-boot:run

# Server chạy tại: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

**Environment Variables (Optional):**
```properties
# MongoDB
spring.data.mongodb.uri=mongodb://localhost:27017/fastfood_delivery

# Redis
spring.redis.host=localhost
spring.redis.port=6379

# VNPay (Sandbox)
vnpay.tmnCode=YOUR_TMN_CODE
vnpay.hashSecret=YOUR_HASH_SECRET
vnpay.url=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

# Cloudinary
cloudinary.cloud_name=YOUR_CLOUD_NAME
cloudinary.api_key=YOUR_API_KEY
cloudinary.api_secret=YOUR_API_SECRET
```

#### **3. Setup Frontend (React)**
```bash
cd client

# Install dependencies
npm install
# hoặc
pnpm install

# Run development server
npm run dev

# UI chạy tại: http://localhost:5173
```

#### **4. Test Accounts**

**Customer Account:**
```
Phone: 0123456789
Password: customer123
```

**Restaurant Owner Account:**
```
Phone: 0987654321
Password: restaurant123
```

**Admin Account:**
```
Phone: 0111111111
Password: admin123
```

### 🧪 Testing

#### **API Testing với Swagger UI**
```
http://localhost:8080/swagger-ui.html
```

Hoặc import file `API_SWAGGER.yaml` vào:
- [Swagger Editor](https://editor.swagger.io/)
- [Postman](https://www.postman.com/)

#### **VNPay Sandbox Testing**

Sử dụng thông tin test card sau để thanh toán:

| Thông tin | Giá trị |
|-----------|---------|
| **Bank** | NCB |
| **Card Number** | 9704198526191432198 |
| **Card Holder** | NGUYEN VAN A |
| **Issue Date** | 07/15 |
| **OTP Code** | 123456 |

**Test Flow:**
1. Tạo đơn hàng với VNPay payment
2. Redirect đến VNPay sandbox page
3. Nhập thông tin thẻ test ở trên
4. Xác nhận OTP: `123456`
5. Hệ thống callback & update order status

#### **WebSocket Testing**

**Kết nối WebSocket STOMP:**
```javascript
const socket = new SockJS('http://localhost:8080/ws/tracking');
const stompClient = Stomp.over(socket);

stompClient.connect({}, () => {
  // Subscribe to drone location updates
  stompClient.subscribe('/topic/drone/{droneId}', (message) => {
    const location = JSON.parse(message.body);
    console.log('Drone location:', location);
  });
});
```

### 📚 Tài Liệu Tham Khảo

- 📖 [MongoDB Schemas](./MONGODB_SCHEMAS.md) - Chi tiết database schema (Prisma-style)
- 🚁 [Drone Delivery System](./DELIVERY_DRONE_COMPLETE_SUMMARY.md) - Hệ thống giao hàng drone
- 📍 [Redis Location Service](./LOCATION_REDIS_INTEGRATION.md) - Tích hợp Redis tracking
- 🔐 [Role-Based Access Control](./ROLE_BASED_PURCHASE_RESTRICTIONS.md) - Phân quyền RBAC
- 💳 [VNPay Integration](./PAYMENT_FLOW_SEQUENCE.puml) - Sequence diagram thanh toán

### 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### 📝 License

This project is licensed under the MIT License.

### 👥 Team

- **Backend Developer**: [Your Name]
- **Frontend Developer**: [Your Name]
- **DevOps**: [Your Name]

### 📧 Contact

- **Email**: your.email@example.com
- **GitHub**: [TrungWolford](https://github.com/TrungWolford)

---

⭐ **Nếu project hữu ích, hãy star repository này!** ⭐
