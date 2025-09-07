import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleShopNow = (item) => {
    if (!user) {
      toast.info('Please login to shop');
      navigate('/login');
      return;
    }

    const alreadyInCart = cartItems.some(ci => ci._id === item._id);
    if (!alreadyInCart) {
      addToCart({ ...item, quantity: 1 });
      toast.success('Added to cart');
    }

    removeFromWishlist(item._id);
    navigate('/cart');
  };

  const handleRemoveFromWishlist = (itemId) => {
    removeFromWishlist(itemId);
    toast.success('Removed from wishlist');
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto mt-10 text-center text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-8">
          <h2 className="text-2xl font-bold mb-4">Your Wishlist is Empty 💔</h2>
          <button onClick={() => navigate('/')} className="text-blue-600 dark:text-blue-400 hover:underline">
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <h2 className="text-3xl font-bold mb-6">My Wishlist ❤️</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map(item => (
          <div
            key={item._id}
            className="border rounded-lg p-4 shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-transform duration-200 hover:scale-[1.01]"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-48 object-contain mb-4 cursor-pointer bg-white dark:bg-gray-700"
              onClick={() => handleShopNow(item)} // ✅ add to cart and go to cart
            />
            <h3
              className="text-xl font-semibold cursor-pointer"
              onClick={() => handleShopNow(item)} // ✅ add to cart and go to cart
            >
              {item.title}
            </h3>
            <p className="text-indigo-600 dark:text-indigo-400">{item.category}</p>
            {item.discountPercentage > 0 ? (
              <div className="my-2">
                <span className="text-gray-500 dark:text-gray-400 line-through text-sm">₹{item.originalPrice}</span>
                <span className="text-red-600 font-bold text-lg ml-2">₹{item.price}</span>
                <span className="text-green-600 text-sm font-medium ml-1">({item.discountPercentage}% OFF)</span>
              </div>
            ) : (
              <p className="text-gray-800 dark:text-gray-100 font-bold my-2">₹{item.price}</p>
            )}

            <div className="flex justify-between mt-4">
              <button
                onClick={() => handleShopNow(item)}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Shop Now 🛒
              </button>
              <button
                onClick={() => handleRemoveFromWishlist(item._id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default WishlistPage;
