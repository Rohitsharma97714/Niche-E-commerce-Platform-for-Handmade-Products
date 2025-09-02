import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext'; // ✅ Import wishlist context
import { FiHeart, FiArrowLeft, FiHome } from 'react-icons/fi'; // ✅ Optional icons

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;
  const user = JSON.parse(localStorage.getItem('user'));
  const isPrivilegedUser = user?.role === 'artisan' || user?.role === 'admin';
  const isCustomer = user?.role === 'customer';
  const showBackButton = currentPath !== '/' && currentPath !== '/home';

  const { wishlistItems } = useWishlist(); // ✅ Get wishlist data

  const handleBack = () => {
    if (currentPath === '/login' && isPrivilegedUser) {
      localStorage.removeItem('user');
      navigate('/');
    } else {
      navigate(-1);
    }
  };

  const handleHome = () => {
    if (isPrivilegedUser) {
      localStorage.removeItem('user');
    }
    navigate('/');
  };

  const goToWishlist = () => {
    navigate('/wishlist');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md px-4 py-3 flex items-center justify-between">
      {/* Left: Back Button */}
      {showBackButton ? (
        <button
          onClick={handleBack}
          className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
        >
          <FiArrowLeft /> Back
        </button>
      ) : (
        <div />
      )}

      {/* Right: Home + Wishlist */}
      <div className="flex items-center gap-4 ml-auto">
        <button
          onClick={handleHome}
          className="text-green-600 hover:text-green-800 font-medium flex items-center gap-1"
        >
          <FiHome /> Home
        </button>

        {isCustomer && (
          <button
            onClick={goToWishlist}
            className="relative text-pink-600 hover:text-pink-800 font-medium flex items-center gap-1"
          >
            <FiHeart /> Wishlist
            {/* Optional Wishlist Count Badge */}
            {wishlistItems.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;