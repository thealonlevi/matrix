import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const itemExists = prevItems.find(item => item.product_id === product.product_id);
      if (itemExists) {
        return prevItems.map(item =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        );
      } else {
        return [...prevItems, product];
      }
    });
  };

  const removeFromCart = (product_id) => {
    setCartItems(prevItems => prevItems.filter(item => item.product_id !== product_id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Updated function to update the quantity of a specific cart item
  const updateCartItem = (product_id, newQuantity) => {
    setCartItems((prevItems) =>
      newQuantity > 0
        ? prevItems.map((item) =>
            item.product_id === product_id ? { ...item, quantity: newQuantity } : item
          )
        : prevItems.filter(item => item.product_id !== product_id) // Remove item if quantity is zero
    );
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, updateCartItem }}>
      {children}
    </CartContext.Provider>
  );
};
