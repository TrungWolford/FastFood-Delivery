import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import Register from './pages/Mainpage/Register';
import ProfileCustomer from './pages/Customer/ProfileCustomer';
import HistoryReceipt from './pages/Customer/HistoryOrder';
import ProductPage from './pages/Customer/Product';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminRegister from './pages/Admin/AdminRegister';
import AdminProduct from './pages/Admin/AdminProduct';
import AdminAccounts from './pages/Admin/AdminAccounts';
import AdminCategory from './pages/Admin/AdminCategory';
import AdminOrder from './pages/Admin/AdminOrder';
import AdminShipping from './pages/Admin/AdminShipping';
import AdminDrones from './pages/Admin/AdminDrones';
import AdminRating from './pages/Admin/AdminRating';
import AdminRestaurantDetail from './pages/Admin/AdminRestaurantDetail';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import PaymentPage from './pages/Payment/PaymentPage';
import OrderSuccessPage from './pages/OrderSuccess/OrderSuccessPage';
import ErrorBoundary from './components/ErrorBoundary';
import LoginFastFood from './pages/FastFoodServer/LoginFastFood';
import FastFoodDashboard from './pages/FastFoodServer/FastFoodDashboard';
import FastFoodAccount from './pages/FastFoodServer/FastFoodAccount';
import FastFoodRole from './pages/FastFoodServer/FastFoodRole';
import FastFoodOrder from './pages/FastFoodServer/FastFoodOrder';
import FastFoodRestaurant from './pages/FastFoodServer/FastFoodRestaurant';
import FastFoodDrone from './pages/FastFoodServer/FastFoodDrone';
import PendingApproval from './pages/Restaurant/PendingApproval';
import MenuItemRestaurantDetail from './pages/MenuItemDetail/MenuItemRestaurantDetail';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/account/register" element={<Register />} />
      <Route path="/account/profile" element={<ProfileCustomer />} />
      <Route path="/customer/orders" element={<HistoryReceipt />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/order-success" element={<OrderSuccessPage />} />
      
      {/* Menu Item Detail Route */}
      <Route path="/menu-item/:menuItemId" element={<MenuItemRestaurantDetail />} />
      
      <Route
        path="/product"
        element={
          <ErrorBoundary>
            <ProductPage />
          </ErrorBoundary>
        }
      />
      <Route
        path="/product/search"
        element={
          <ErrorBoundary>
            <ProductPage />
          </ErrorBoundary>
        }
      />
      <Route
        path="/product/collection/:categoryName"
        element={
          <ErrorBoundary>
            <ProductPage />
          </ErrorBoundary>
        }
      />
      <Route
        path="/collection/:categoryName"
        element={
          <ErrorBoundary>
            <ProductPage />
          </ErrorBoundary>
        }
      />
      <Route
        path="/product/:productName"
        element={
          <ErrorBoundary>
            <ProductDetail />
          </ErrorBoundary>
        }
      />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/register" element={<AdminRegister />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/product" element={<AdminProduct />} />
      <Route path="/admin/products" element={<AdminProduct />} />
      <Route path="/admin/orders" element={<AdminOrder />} />
      <Route path="/admin/shippings" element={<AdminShipping />} />
      <Route path="/admin/drones" element={<AdminDrones />} />
      <Route path="/admin/ratings" element={<AdminRating />} />
      <Route path="/admin/accounts" element={<AdminAccounts />} />
      <Route path="/admin/categories" element={<AdminCategory />} />
      <Route path="/admin/restaurant-detail" element={<AdminRestaurantDetail />} />

      {/* Restaurant Routes */}
      <Route path="/restaurant/pending-approval" element={<PendingApproval />} />

      {/* FastFood Server Routes */}
      <Route path="/fastfood/login" element={<LoginFastFood />} />
      <Route path="/fastfood/dashboard" element={<FastFoodDashboard />} />
      <Route path="/fastfood/accounts" element={<FastFoodAccount />} />
      <Route path="/fastfood/roles" element={<FastFoodRole />} />
      <Route path="/fastfood/orders" element={<FastFoodOrder />} />
      <Route path="/fastfood/restaurants" element={<FastFoodRestaurant />} />
      <Route path="/fastfood/drones" element={<FastFoodDrone />} />

      {/* Redirect old auth routes to home */}
      <Route path="/auth/login" element={<Navigate to="/" replace />} />
      <Route path="/auth/register" element={<Navigate to="/account/register" replace />} />
      <Route path="/auth/logout" element={<Navigate to="/" replace />} />

      {/* Catch all unmatched routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
