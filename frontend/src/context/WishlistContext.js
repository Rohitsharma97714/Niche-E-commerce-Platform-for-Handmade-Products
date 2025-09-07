import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('wishlist')) || [];
    setWishlistItems(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToWishlist = (item) => {
    if (!wishlistItems.some(p => p._id === item._id)) {
      // ✅ Preserve discount information when adding to wishlist
      const wishlistItem = {
        ...item,
        originalPrice: item.originalPrice || item.price,
        discountPercentage: item.discountPercentage || 0,
        // Calculate discounted price if discount exists
        price: item.discountPercentage > 0 ?
          Math.round((item.originalPrice || item.price) * (1 - item.discountPercentage / 100)) :
          (item.price || item.originalPrice)
      };
      setWishlistItems([...wishlistItems, wishlistItem]);
    }
  };

  const removeFromWishlist = (id) => {
    setWishlistItems(wishlistItems.filter(p => p._id !== id));
  };

  const isInWishlist = (id) => wishlistItems.some(p => p._id === id);

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
