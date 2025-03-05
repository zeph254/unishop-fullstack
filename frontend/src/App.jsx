import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NoPage from "./pages/NoPage";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Shop from "./pages/Shop";
import OrderSuccess from "./components/OrderSuccess";
import AdminDashboard from "./pages/AdminDashboard";
import { useUser } from "./context/UserContext";
import Product from "./pages/Product";
import Invoice from "./components/Invoice";
import EditProductPage from './pages/EditProductPage';
import BestSellingProducts from './pages/BestSellingProducts';
import RevenueAnalytics from './pages/RevenueAnalytics';
import CustomerPurchaseTrends from './pages/CustomerPurchaseTrends';



function ProtectedRoute({ children }) {
  const { user, isAuthenticated } = useUser();

  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/login" />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signin" element={<SignIn />} />
          <Route path="profile" element={<Profile />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="account" element={<Account />} />
          <Route path="orders" element={<Orders />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="*" element={<NoPage />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="cart" element={<Cart />} />
          <Route path="/product" element={<ProtectedRoute><Product /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/best-selling" element={<BestSellingProducts />} />
        <Route path="/admin/revenue" element={<RevenueAnalytics />} />
        <Route path="/admin/customer-trends" element={<CustomerPurchaseTrends />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/account/orders/:orderId/invoice" element={<Invoice />} />
        <Route path="/edit-product/:productId" element={<EditProductPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App; // ✅ Make sure this is present
