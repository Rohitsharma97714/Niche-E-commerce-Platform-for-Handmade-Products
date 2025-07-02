import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // ✅ Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // ✅ Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // ✅ Add to cart (with quantity handling)
  const addToCart = (product) => {
  setCartItems(prev => {
    const existing = prev.find(item => item._id === product._id);
    if (existing) {
      return prev.map(item =>
        item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
      );
    }
    // ✅ include artisan in cart item
    return [...prev, { ...product, quantity: 1, artisan: product.artisan }];
  });
};

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item._id !== id));
  };

  return (
    <CartContext.Provider value={{ cartItems, setCartItems, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};
