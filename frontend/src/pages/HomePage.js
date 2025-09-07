import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { FiSun, FiMoon, FiMenu, FiX, FiHome, FiInfo, FiShoppingCart, FiUser, FiPackage, FiHeart, FiSearch, FiChevronDown, FiStar, FiTruck } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import bannerImg from '../assets/Banner-img.jpg';
import videoSrc from '../assets/desi-craft.mp4';
import { useWishlist } from '../context/WishlistContext';

// Optimized Product Card Component
const ProductCard = React.memo(({ product, isInWishlist, onWishlistToggle, onCategoryClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  // Preload first few images
  useEffect(() => {
    if (product.image && !imageLoaded) {
      const img = new Image();
      img.src = product.image;
      img.onload = handleImageLoad;
      img.onerror = handleImageError;
    }
  }, [product.image, handleImageLoad, handleImageError, imageLoaded]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-shrink-0 w-64"
    >
      <Link
        to={`/product/${product._id}?discount=${product.discountPercentage}`}
        className="group bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block relative"
      >
        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onWishlistToggle(product);
          }}
          className="absolute top-3 right-3 z-10 p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <FiHeart
            className={`w-5 h-5 ${isInWishlist ? 'text-red-500 fill-current' : 'text-gray-400'}`}
          />
        </button>

        {/* Product Image with lazy loading */}
        <div className="relative h-48 overflow-hidden">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse bg-gray-300 dark:bg-gray-600 w-full h-full rounded"></div>
            </div>
          )}
          {!imageError ? (
            <img
              src={product.image}
              alt={product.title}
              className={`w-full h-full object-contain transition-all duration-500 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 h-full">
              <svg className="w-8 h-8 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">Image unavailable</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h4 className="font-semibold text-lg mb-1 group-hover:text-orange-600 transition-colors line-clamp-2">
            {product.title}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{product.category}</p>

          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(product.rating || 4) ? 'fill-current' : ''}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({product.reviews || 24})</span>
          </div>

          <div className="flex justify-between items-center mt-3">
            {product.discountPercentage > 0 ? (
              <div className="flex flex-col">
                <span className="text-gray-500 dark:text-gray-400 line-through text-sm">₹{product.price}</span>
                <span className="text-red-600 font-bold text-lg">
                  ₹{Math.round(product.price * (1 - product.discountPercentage / 100))}
                </span>
              </div>
            ) : (
              <span className="text-orange-600 font-bold text-lg">₹{product.price}</span>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <FiTruck className="mr-1" /> Free delivery
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

const HomePage = ({ darkMode, toggleDarkMode }) => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();
  const dropdownRef = useRef();
  const mobileMenuRef = useRef();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || null;

  // ✅ Products fetch
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/products`);
        const productsWithAttributes = res.data.map(product => ({
          ...product,
          rating: product.rating || Math.floor(Math.random() * 2) + 4,
          reviews: product.reviews || Math.floor(Math.random() * 50) + 10,
          isTopSeller: Math.random() > 0.7, // 30% chance
          discountPercentage: Math.random() > 0.6 ? Math.floor(Math.random() * 30) + 10 : 0, // 40% chance of discount
          isNewArrival: Math.random() > 0.8 // 20% chance
        }));
        setProducts(productsWithAttributes);
      } catch (err) {
        toast.error('Failed to load products');
      }
    };
    fetchFeatured();
  }, []);

  // ✅ Scroll and menu handlers
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) setMobileMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // ✅ Debounced search for better performance
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ✅ Memoized filtering and calculations for performance
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesTitle = p.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
      return matchesTitle && matchesCategory;
    });
  }, [products, debouncedSearchTerm, selectedCategory]);

  const categories = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))], [products]);

  const isInWishlist = useCallback((id) => wishlistItems.some(p => p._id === id), [wishlistItems]);

  // ✅ Optimized wishlist toggle handler
  const handleWishlistToggle = useCallback((product) => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist');
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist]);



  const handleCategoryClick = (cat) => {
    navigate(`/category/${cat}`);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 pt-16 md:pt-24">
      {/* Header */}
      <header className={`fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-800 dark:text-gray-100 shadow-md transition-all duration-300 ${isScrolled ? 'py-2 shadow-lg' : 'py-3 md:py-4'} px-4 md:px-6 flex justify-between items-center`}>
        <Link
          to="/"
          className="text-xl md:text-2xl font-bold text-orange-600 hover:underline"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} // Scroll to top on click
        >
          Desi-Etsy 🧵
        </Link>


        
        {/* Search and Category in Header */}
        <div className="hidden md:flex flex-1 max-w-xl mx-6 items-center gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search handmade treasures..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setTimeout(() => {
                  document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>
          <div className="relative w-48">
            <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setTimeout(() => {
                  document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="appearance-none pl-4 pr-10 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            >
              <option value="">All Categories</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 focus:outline-none"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <FiSun size={24} /> : <FiMoon size={24} />}
          </button>
        </div>

        {/* Mobile Header Controls */}
        <div className="md:hidden flex items-center gap-2">
          {/* Mobile Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 focus:outline-none"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>

          {/* Mobile menu button */}
          <button
            className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-orange-600 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="hover:text-orange-600 transition-colors flex items-center gap-1"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <FiHome /> Home
          </Link>

          <button
            onClick={() => document.getElementById('about-us')?.scrollIntoView({ behavior: 'smooth' })}
            className="hover:text-orange-600 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <FiInfo /> About
          </button>

          <Link to="/cart" className="hover:text-orange-600 transition-colors flex items-center gap-1">
            <FiShoppingCart /> Cart
          </Link>

          <Link to="/wishlist" className="hover:text-orange-600 transition-colors flex items-center gap-1">
            <FiHeart /> Wishlist
          </Link>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="hover:text-orange-600 transition-colors flex items-center gap-1"
              >
                <FiUser /> {user.name} <FiChevronDown className="text-xs" />
              </button>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
                >
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{user.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-3 hover:bg-orange-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FiUser /> Profile
                  </Link>
                </motion.div>
              )}
            </div>
          ) : (
            <Link to="/login" className="hover:text-orange-600 transition-colors flex items-center gap-1">
              <FiUser /> Login
            </Link>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div 
          ref={mobileMenuRef}
          className={`fixed top-0 right-0 h-auto max-h-screen overflow-y-auto w-1/2 max-w-xs bg-white dark:bg-gray-800 dark:text-gray-100 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="font-bold text-orange-600">Menu</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>
            
            {/* Mobile Search and Category */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative mb-3">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search handmade treasures..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                />
              </div>
              <div className="relative mb-3">
                <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat, index) => (
                    <option key={index} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              {/* Mobile Dark Mode Toggle */}
              <div className="flex justify-center">
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? <FiSun size={20} className="text-orange-500" /> : <FiMoon size={20} className="text-blue-500" />}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <Link 
                to="/" 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <FiHome className="flex-shrink-0" />
                <span>Home</span>
              </Link>

              <button
                onClick={() => {
                  document.getElementById('about-us')?.scrollIntoView({ behavior: 'smooth' });
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-left"
              >
                <FiInfo className="flex-shrink-0" />
                <span>About Us</span>
              </button>

              <Link 
                to="/cart" 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiShoppingCart className="flex-shrink-0" />
                <span>Cart</span>
              </Link>

              <Link 
                to="/wishlist" 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiHeart className="flex-shrink-0" />
                <span>Wishlist</span>
              </Link>

              {user ? (
                <>
                  <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="p-3 text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-3">
                        <FiUser className="flex-shrink-0" />
                        <span className="truncate font-semibold">{user.name}</span>
                      </div>
                      <p className="text-sm mt-1">{user.email}</p>
                    </div>
                  </div>
                  
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiUser className="flex-shrink-0" />
                    <span>Profile</span>
                  </Link>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiUser className="flex-shrink-0" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </header>

      {/* Banner */}
      <div className="relative w-screen min-h-[400px] md:h-[450px] flex flex-col md:flex-row" style={{ backgroundImage: `url(${bannerImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {/* Left Half - Video */}
        <div className="w-full md:w-1/2 relative h-64 md:h-auto">
          <video
            src={videoSrc}
            autoPlay
            muted
            loop
            className="w-full h-full object-cover"
          />
        </div>
        {/* Right Half - Who We Are */}
        <div className="w-full md:w-1/2 relative flex flex-col justify-center items-center text-center px-2 md:px-4 py-4 md:py-0 overflow-visible" style={{ backgroundImage: `url(${bannerImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="overflow-visible relative z-10"
          >
            <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-orange-600 dark:text-orange-400">Who We Are</h2>
            <p className="mb-3 md:mb-4 text-sm md:text-base text-gray-100 max-w-sm mx-auto">
              Celebrating India's rich heritage of craftsmanship by connecting talented artisans with customers nationwide. Every product is crafted with love by skilled Indian creators. Celebrate handmade and heartmade products.
            </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/cart')}
        className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-lg text-white font-semibold text-sm md:text-base shadow-lg block mx-auto"
      >
        Shop Now
      </motion.button>
          </motion.div>
+          <div className="absolute inset-0 bg-black opacity-40 rounded-r-lg z-0" />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-12 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-900">
        <h3 className="text-2xl font-bold mb-8 text-center">🧵 Discover Categories</h3>
        <div className="flex flex-wrap gap-4 justify-center max-w-4xl mx-auto">
          {categories.map((cat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={() => handleCategoryClick(cat)}
                className="bg-white dark:bg-gray-800 border-2 border-orange-100 dark:border-gray-700 rounded-xl px-6 py-3 shadow-md transition-all duration-300 hover:bg-orange-50 dark:hover:bg-gray-700 hover:border-orange-200 hover:shadow-lg"
              >
                <span className="font-medium text-orange-700">{cat}</span>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Special Product Sections */}
      <div className="px-4 py-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto space-y-12">

          {/* Top Sellers */}
          {products.filter(p => p.isTopSeller).length > 0 && (
            <div>
              <h3 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
                <span className="text-orange-600">🏆</span> Top Sellers
              </h3>
              <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
                {products.filter(p => p.isTopSeller).slice(0, 8).map((p, index) => (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="relative">
                      {/* Top Seller Badge */}
                      <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded z-20">
                        🏆 Top Seller
                      </span>

                      <ProductCard
                        product={p}
                        isInWishlist={isInWishlist(p._id)}
                        onWishlistToggle={handleWishlistToggle}
                        onCategoryClick={handleCategoryClick}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Discounted Products */}
          {products.filter(p => p.discountPercentage > 0).length > 0 && (
            <div>
              <h3 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
                <span className="text-red-600">💰</span> Special Discounts
              </h3>
              <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
                {products.filter(p => p.discountPercentage > 0).slice(0, 8).map((p, index) => (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="relative">
                      {/* Discount Badge */}
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-20">
                        {p.discountPercentage}% OFF
                      </span>

                      <ProductCard
                        product={p}
                        isInWishlist={isInWishlist(p._id)}
                        onWishlistToggle={handleWishlistToggle}
                        onCategoryClick={handleCategoryClick}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* New Arrivals */}
          {products.filter(p => p.isNewArrival).length > 0 && (
            <div>
              <h3 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
                <span className="text-green-600">✨</span> New Arrivals
              </h3>
              <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
                {products.filter(p => p.isNewArrival).slice(0, 8).map((p, index) => (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="relative">
                      {/* New Arrival Badge */}
                      <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded z-20">
                        ✨ New
                      </span>

                      <ProductCard
                        product={p}
                        isInWishlist={isInWishlist(p._id)}
                        onWishlistToggle={handleWishlistToggle}
                        onCategoryClick={handleCategoryClick}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <div id="product-grid" className="px-4 py-12 max-w-7xl mx-auto">
        <h3 className="text-2xl font-bold mb-8 text-center">✨ Handpicked For You</h3>
        <div className="flex space-x-6 overflow-x-auto scrollbar-hide py-2">
          {filteredProducts.map((p, index) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="relative">
                {/* Product Badges */}
                {p.rating >= 4.5 && (
                  <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded z-20">
                    🌟 Best Seller
                  </span>
                )}
                {p.discountPercentage > 0 && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-20">
                    {p.discountPercentage}% OFF
                  </span>
                )}
                {p.isTopSeller && !p.discountPercentage && p.rating < 4.5 && (
                  <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded z-20">
                    🏆 Top Seller
                  </span>
                )}
                {p.isNewArrival && !p.discountPercentage && !p.isTopSeller && (
                  <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded z-20">
                    ✨ New
                  </span>
                )}

                <ProductCard
                  product={p}
                  isInWishlist={isInWishlist(p._id)}
                  onWishlistToggle={handleWishlistToggle}
                  onCategoryClick={handleCategoryClick}
                />
              </div>
            </motion.div>
          ))}
        </div>


      </div>

      {/* Features Section */}
      <div className="bg-orange-50 dark:bg-gray-900 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold mb-12 text-center">Why Choose Desi-Etsy?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🖌️',
                title: 'Authentic Handmade',
                description: 'Every product is crafted with love by skilled Indian artisans'
              },
              {
                icon: '🚚',
                title: 'Fast Delivery',
                description: 'Get your orders delivered quickly with our reliable partners'
              },
              {
                icon: '💯',
                title: 'Quality Guarantee',
                description: 'We ensure every product meets our high quality standards'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div id="about-us">
            <h4 className="text-lg font-semibold mb-4">About Desi-Etsy</h4>
            <p className="text-sm text-gray-400 mb-4">
              Celebrating India's rich heritage of craftsmanship by connecting talented artisans with customers nationwide.
            </p>
            <p className="italic text-orange-300">Handmade. Heartmade. Just for you.</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link 
                  to="/" 
                  className="hover:text-orange-400 transition-colors flex items-center gap-2"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <FiHome size={14} /> Home
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-orange-400 transition-colors flex items-center gap-2">
                  <FiShoppingCart size={14} /> Cart
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-orange-400 transition-colors flex items-center gap-2">
                  <FiHeart size={14} /> Wishlist
                </Link>
              </li>
              <li>
                <Link 
                  to={user ? "/orders" : "/login"} 
                  className="hover:text-orange-400 transition-colors flex items-center gap-2"
                >
                  <FiPackage size={14} /> My Orders
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Information</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link to="/" className="hover:text-orange-400 transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-orange-400 transition-colors">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-orange-400 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <a 
                  href="https://github.com/Rohitsharma97714/Niche-E-commerce-Platform-for-Handmade-Products" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-orange-400 transition-colors flex items-center gap-2"
                >
                  <FiStar size={14} /> GitHub Repo
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="text-sm text-gray-300 space-y-2">
              <p>📧 support@desietsy.com</p>
              <p>📞 +91-9771408819</p>
              <p>📍 Odisha, India</p>
            </div>
            <div className="flex gap-4 mt-4">
              <button className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12a10 10 0 1 0-11.5 9.95v-7.05h-2.1v-2.9h2.1V9.5c0-2.07 1.23-3.22 3.13-3.22.91 0 1.86.16 1.86.16v2.05h-1.05c-1.03 0-1.35.64-1.35 1.3v1.56h2.3l-.37 2.9h-1.93v7.05A10 10 0 0 0 22 12"/>
                </svg>
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <circle cx="17.5" cy="6.5" r="1.5"/>
                </svg>
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.47.69a4.3 4.3 0 0 1 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 11.1 9.03c0 .34.04.67.1.99A12.13 12.13 0 0 1 3.1 5.1a4.28 4.28 0 0 0 1.32 5.71c-.7-.02-1.36-.21-1.94-.53v.05a4.28 4.28 0 0 0 3.43 4.19c-.33.09-.68.14-1.04.14-.25 0-.5-.02-.74-.07a4.29 4.29 0 0 0 4 2.98A8.6 8.6 0 0 1 2 19.54a12.13 12.13 0 0 0 6.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19 0-.39-.01-.58A8.72 8.72 0 0 0 24 4.59a8.5 8.5 0 0 1-2.54.70z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-500 text-xs mt-12 pt-6 border-t border-gray-800">
          <p>© {new Date().getFullYear()} Desi-Etsy. All rights reserved.</p>
        </div>
      </footer>

      {/* Back to Top Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: isScrolled ? 1 : 0 }}
        className="fixed bottom-6 right-6 bg-orange-600 text-white p-3 rounded-full shadow-lg z-40"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Back to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </motion.button>
    </div>
  );
};

export default HomePage;
