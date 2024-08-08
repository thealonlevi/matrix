// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Banner from './components/Banner';
import ProductList from './components/ProductList';
import SignUpForm from './components/SignUpForm';
import SignInForm from './components/SignInForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
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
              {user.isGuest ? (
                <div>
                  <Link to="/login">Login</Link> | <Link to="/register">Sign Up</Link>
                </div>
              ) : (
                <div>
                  <span>Welcome, {user.email}</span> | <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </>
          }
        />
        <Route path="/register" element={<SignUpForm />} />
        <Route path="/login" element={<SignInForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/cart" element={<div>Cart Page</div>} />
        <Route path="/reviews" element={<div>Reviews Page</div>} />
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
