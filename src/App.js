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
import ModifyStockForm from './components/admin-dashboard/ModifyStockForm'; // Import ModifyStockForm
import './App.css';
import { fetchUserAttributes, signOut } from 'aws-amplify/auth';

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
    } catch (error) {
      console.log('Error signing out: ', error);
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
        <Route path="/cart" element={<div>Cart Page</div>} />
        <Route path="/reviews" element={<div>Reviews Page</div>} />
        
        {/* Wrap all admin routes under AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="products" element={<ManageProducts />} />
          <Route path="createproduct" element={<CreateProductForm />} />
          <Route path="modifyproduct/:productId" element={<ModifyProductForm />} />
          <Route path="modifystock/:productId" element={<ModifyStockForm />} />
        </Route>
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
