# FastFood Delivery - Hệ Thống Giao Hàng Đồ Ăn Nhanh 🍕🚁

## 📋 Mô Tả Dự Án

**FastFood Delivery** là một nền tảng giao hàng đồ ăn nhanh hiện đại, cho phép khách hàng order từ các nhà hàng yêu thích, thanh toán an toàn qua VNPay hoặc COD, và theo dõi giao hàng real-time bằng drone.

### ✨ Tính Năng Chính

- 🔐 **Xác thực người dùng** - Đăng nhập với số điện thoại & mật khẩu
- 🍽️ **Quản lý nhà hàng & thực đơn** - Các chủ nhà hàng có thể tạo/sửa/xóa món ăn
- 🛒 **Giỏ hàng & Đặt hàng** - Khách hàng có thể browse, thêm vào giỏ và đặt hàng
- 💳 **Thanh toán** - Hỗ trợ 2 phương thức:
  - COD (Thanh toán khi nhận)
  - VNPay (Thanh toán online an toàn với HMAC-SHA512)
- 🚁 **Quản lý Drone** - Tạo, sửa, xóa drone, quản lý pin & trạng thái
- 📍 **Theo dõi real-time** - WebSocket STOMP cho phép khách hàng xem vị trí drone trên bản đồ
- ⭐ **Đánh giá & Bình luận** - Khách hàng có thể đánh giá sau khi nhận hàng

### 🏗️ Kiến Trúc

**5 Lớp (5-Layer Architecture):**
1. **Payment Processing** - Xử lý thanh toán VNPay & COD
2. **Admin Management** - Quản lý drone, thực đơn, người dùng
3. **Backend Services** - 8 microservices độc lập (Auth, Cart, Order, Payment, MenuItem, Rating, Restaurant, Drone)
4. **Database Layer** - MongoDB với 11 collections
5. **External Services** - Cloudinary (lưu ảnh), GPS API, VNPay

### 🛠️ Tech Stack

**Backend:**
- Spring Boot 3.5.5
- Java 17
- MongoDB (NoSQL)
- Redis (caching & real-time location)
- WebSocket STOMP (real-time tracking)
- Maven

**Frontend:**
- React 19 + TypeScript
- Tailwind CSS
- Radix UI (Component Library)
- Redux Toolkit (State Management)
- Vite (Build Tool)

**External Services:**
- VNPay (Payment Gateway - Sandbox)
- Cloudinary (Image CDN)
- Google Maps API (Bản đồ & định vị)

### 📁 Cấu Trúc Project

```
FastFood-Delivery/
├── server/                 # Spring Boot Backend
│   ├── src/main/java/
│   │   └── com/FastFoodDelivery/
│   │       ├── controller/   # 11 REST Controllers
│   │       ├── service/      # 8 Business Services
│   │       ├── entity/       # MongoDB Entities
│   │       ├── repository/   # Data Access Layer
│   │       └── config/       # Configuration
│   └── pom.xml             # Maven Dependencies
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # React Components
│   │   ├── pages/          # 3 Giao Diện (Customer, Restaurant, Admin)
│   │   ├── services/       # API Services
│   │   └── store/          # Redux Store
│   └── package.json
├── API_SWAGGER.yaml        # Swagger/OpenAPI Documentation
├── MONGODB_SCHEMA.md       # Database Schema
├── DRONE_TRACKING_FLOW.puml    # Drone Flow Diagram
├── MENU_MANAGEMENT_FLOW.puml   # Menu Flow Diagram
├── PAYMENT_FLOW_SEQUENCE.puml  # Payment Flow Diagram
└── OPERATIONAL_FLOW.puml       # Architecture Diagram
```

### 📊 Database Schema (MongoDB)

**11 Collections:**
- `users` - Người dùng (khách hàng, chủ nhà hàng, admin)
- `roles` - Vai trò (CUSTOMER, RESTAURANT_OWNER, ADMIN)
- `restaurants` - Nhà hàng
- `menuitems` - Thực đơn
- `categories` - Danh mục món ăn
- `carts` - Giỏ hàng
- `orders` - Đơn hàng
- `payments` - Lịch sử thanh toán
- `ratings` - Đánh giá & bình luận
- `drones` - Máy bay không người lái
- `locations` - Vị trí drone real-time (TTL: 30 ngày)

### 🔌 API Endpoints (40+ Endpoints)

Được tổ chức thành **10 nhóm:**

| Nhóm | Số Endpoints | Chức Năng |
|------|------|---------|
| Authentication | 1 | Đăng nhập |
| Users | 5 | Quản lý người dùng |
| Roles | 3 | Quản lý vai trò |
| Restaurants | 6 | Quản lý nhà hàng |
| Menu Items | 6 | Quản lý thực đơn |
| Carts | 8 | Quản lý giỏ hàng |
| Orders | 6 | Quản lý đơn hàng |
| Payments | 2 | Thanh toán |
| Drones | 7 | Quản lý drone |
| Locations | 2 | Vị trí real-time |
| WebSocket Test | 2 | Test WebSocket |
| **TOTAL** | **48** | - |

📖 [Xem đầy đủ tại API_SWAGGER.yaml](./API_SWAGGER.yaml)

### 🚀 Tính Năng Nổi Bật

#### 1️⃣ Thanh Toán An Toàn (VNPay)
- ✅ HMAC-SHA512 hash validation
- ✅ Idempotent payment processing (tránh duplicate transaction)
- ✅ Atomic transaction (@Transactional)
- ✅ Unique vnpTxnRef per order (UUID)

#### 2️⃣ Theo Dõi Real-time (WebSocket)
- 🔗 STOMP Protocol qua `/ws/tracking`
- 📡 Subscribe `/topic/drone/{droneId}` để nhận update vị trí
- ⚡ Cập nhật liên tục từ backend
- 📍 Hiển thị trên Google Maps

#### 3️⃣ Quản Lý Drone Thông Minh
- 🚁 CRUD operations
- 🔋 Kiểm tra pin trước khi giao (>= 20%)
- 📊 Thống kê số lần giao hàng
- ⚠️ Cảnh báo trạng thái (IDLE, DELIVERING, CHARGING)

### 🔄 Quy Trình Chính

**Quy Trình Đặt Hàng:**
```
1. Khách hàng browse thực đơn
2. Thêm vào giỏ hàng
3. Đặt hàng
4. Chọn phương thức thanh toán (COD/VNPay)
5. Nhà hàng confirm đơn
6. Gán drone giao (kiểm tra pin)
7. Khách hàng theo dõi real-time trên bản đồ
8. Drone giao hàng
9. Khách hàng đánh giá
```

### 📋 Hướng Dẫn Setup

**Yêu Cầu:**
- Java 17+
- Node.js 18+
- MongoDB
- Redis

**Backend:**
```bash
cd server
mvn clean compile
mvn spring-boot:run
# API chạy tại: http://localhost:8080
```

**Frontend:**
```bash
cd client
npm install
npm run dev
# UI chạy tại: http://localhost:5173
```

### 🧪 Test API

Sử dụng Swagger UI:
```
http://localhost:8080/swagger-ui.html
```

hoặc Upload file `API_SWAGGER.yaml` vào [Swagger Editor](https://editor.swagger.io/)

## Bank info for VNPay sandbox payment
<table>
  <tr>
    <td>Bank</td>
    <td>NCB</td>
  </tr>
  <tr>
    <td>Card number</td>
    <td>9704198526191432198</td>
  </tr>
  <tr>
    <td>Owner name</td>
    <td>NGUYEN VAN A</td>
  </tr>
  <tr>
    <td>Issue date</td>
    <td>07/15</td>
  </tr>
  <tr>
    <td>OTP</td>
    <td>123456</td>
  </tr>
</table>
