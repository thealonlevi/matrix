// src/App.js

import React, { useState, useEffect, createContext, useContext } from 'react';
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
import CartPage from './components/cart/CartPage';
import { CartProvider } from './components/cart/CartContext';
import Notification, { showNotification } from './components/admin-dashboard/utils/Notification';
import './App.css';
import { fetchUserAttributes, signOut } from 'aws-amplify/auth';

// Create a context for managing notifications
export const NotificationContext = createContext();

// Hook to use notifications anywhere in the app
export const useNotification = () => useContext(NotificationContext);

async function currentAuthenticatedUser() {
  try {
    const user = await fetchUserAttributes();
    const { email } = user;
    console.log(`The email: ${email}`);
    return { email, isGuest: false };
  } catch (err) {
    console.log(err);
    return { email: null, isGuest: true };
  }
}

const AppContent = () => {
  const [user, setUser] = useState({ email: null, isGuest: true });
  const location = useLocation();
  const { notification, setNotification } = useNotification(); // Access notification context

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
      setUser({ email: null, isGuest: true });
      showNotification('Logged out successfully', 'success'); // Set notification
    } catch (error) {
      console.log('Error signing out: ', error);
      showNotification('Error signing out', 'error'); // Set notification
    }
  };

  return (
    <div className="App">
      <Header user={user} handleLogout={handleLogout} />
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
        {/* Wrap all admin routes under AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="products" element={<ManageProducts />} />
          <Route path="createproduct" element={<CreateProductForm />} />
          <Route path="creategroup" element={<CreateGroupForm />} />
          <Route path="modifyproduct/:productId" element={<ModifyProductForm />} />
          <Route path="modifyproduct/:groupId/:productId" element={<ModifyProductForm />} /> {/* Support for group/productId format */}
          <Route path="modifystock/:productId" element={<ModifyStockForm />} />
          <Route path="orders" element={<AdminOrders />} /> {/* Route for Admin Orders */}
          <Route path="/admin/orders/:orderId" element={<OrderDetails />} />
        </Route>
      </Routes>
      <Notification /> {/* Always render the Notification component */}
    </div>
  );
};

const App = () => {
  const [notification, setNotification] = useState(null); // State for global notifications

  return (
    <NotificationContext.Provider value={{ notification, setNotification }}>
      <Router>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </Router>
    </NotificationContext.Provider>
  );
};

export default App;
