// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Banner from './components/Banner';
import ProductList from './components/ProductList';
import SignUpForm from './components/SignUpForm';
import SignInForm from './components/SignInForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import './App.css';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<><Banner /><ProductList /></>} />
          <Route path="/register" element={<SignUpForm />} />
          <Route path="/login" element={<SignInForm />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/cart" element={<div>Cart Page</div>} />
          <Route path="/reviews" element={<div>Reviews Page</div>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
