// src/App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Banner from './components/Banner';
import ProductList from './components/ProductList';
import SignUpForm from './components/userSystem/SignUpForm';
import SignInForm from './components/userSystem/SignInForm';
import ForgotPasswordForm from './components/userSystem/ForgotPasswordForm';
import AdminLayout from './components/admin-dashboard/AdminLayout';
import ManageProducts from './components/admin-dashboard/ManageProducts';
import CreateProductForm from './components/admin-dashboard/CreateProductForm';
import ModifyProductForm from './components/admin-dashboard/ModifyProductForm';
import ModifyStockForm from './components/admin-dashboard/ModifyStockForm';
import CreateGroupForm from './components/admin-dashboard/CreateGroupForm';
import AdminOrders from './components/admin-dashboard/AdminOrders';
import OrderDetails from './components/admin-dashboard/OrderDetails';
import ManageUsers from './components/admin-dashboard/ManageUsers';
import ManageStaff from './components/admin-dashboard/ManageStaff';
import CartPage from './components/cart/CartPage';
import { CartProvider } from './components/cart/CartContext';
import UserArea from './components/user-area/UserArea';
import UserOrders from './components/user-area/UserOrders';
import UserOrderDetails from './components/user-area/UserOrderDetails';
import { NotificationProvider, useNotification } from './components/admin-dashboard/utils/Notification';
import './App.css';
import { fetchUserAttributes, signOut } from 'aws-amplify/auth';
import SupportTicketSystem from './components/admin-dashboard/SupportTicketSystem';
import CreateTicket from './components/user-area/Create_Ticket';
import Statistics from './components/admin-dashboard/Statistics';
import CartWidget from './components/userSystem/CartWidget'; // Import CartWidget component
import Logs from './components/admin-dashboard/Logs';

// Function to get the current authenticated user
async function currentAuthenticatedUser() {
  try {
    const user = await fetchUserAttributes();
    const { email, sub: userId } = user; // Extract userId from Cognito
    console.log(`The email: ${email}, UserId: ${userId}`);
    return { email, userId, isGuest: false };
  } catch (err) {
    console.log(err);
    return { email: null, userId: null, isGuest: true };
  }
}

const AppContent = () => {
  const [user, setUser] = useState({ email: null, userId: null, isGuest: true });
  const location = useLocation();
  const { showNotification } = useNotification(); // Access notification context

  useEffect(() => {
    async function checkUser() {
      const userData = await currentAuthenticatedUser();
      setUser(userData);
    }

    checkUser();
  }, [location]);

  const handleLogout = async () => {
    try {
      await signOut();
      setUser({ email: null, userId: null, isGuest: true });
      showNotification('Logged out successfully', 'success'); // Show notification
    } catch (error) {
      console.log('Error signing out: ', error);
      showNotification('Error signing out', 'error'); // Show notification
    }
  };

  return (
    <div className="App">
      <Header user={user} handleLogout={handleLogout} />
      {/* Show CartWidget only on the "/" path */}
      {location.pathname === '/' && <CartWidget />} {/* Render CartWidget when path is "/" */}
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Banner />
              <ProductList />
            </>
          }
        />
        <Route path="/register" element={<SignUpForm />} />
        <Route path="/login" element={<SignInForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/reviews" element={<div>Reviews Page</div>} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="products" element={<ManageProducts />} />
          <Route path="createproduct" element={<CreateProductForm />} />
          <Route path="creategroup" element={<CreateGroupForm />} />
          <Route path="modifyproduct/:productId" element={<ModifyProductForm />} />
          <Route path="modifyproduct/:groupId/:productId" element={<ModifyProductForm />} />
          <Route path="modifystock/:productId" element={<ModifyStockForm />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:orderId" element={<OrderDetails />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="staff" element={<ManageStaff />} />
          <Route path="support-tickets" element={<SupportTicketSystem />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="logs" element={<Logs />} />
        </Route>

        {/* User Area routes */}
        <Route path="/user-area" element={<UserArea />} />
        <Route
          path="/user-area/orders"
          element={<UserOrders userEmail={user.email} userId={user.userId} />}
        />
        <Route
          path="/user-area/orders/:orderId"
          element={<UserOrderDetails />}
        />

        {/* New global route for Create Ticket */}
        <Route path="/Create_Ticket" element={<CreateTicket />} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <NotificationProvider> {/* Wrap the entire app with NotificationProvider */}
      <Router>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </Router>
    </NotificationProvider>
  );
};

export default App;
