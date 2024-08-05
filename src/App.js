// src/App.js
import React from 'react';
import Header from './components/Header';
import Banner from './components/Banner';
import ProductList from './components/ProductList';
import './App.css';

const App = () => {
  return (
    <div className="App">
      <Header />
      <Banner />
      <ProductList />
    </div>
  );
};

export default App;
