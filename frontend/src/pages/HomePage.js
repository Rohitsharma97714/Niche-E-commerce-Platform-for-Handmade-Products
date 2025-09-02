import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
  FiMenu, FiX, FiHome, FiInfo, FiShoppingCart, 
  FiUser, FiPackage, FiKey, FiLogOut, FiHeart, 
  FiSearch, FiChevronDown, FiStar, FiTruck 
} from 'react-icons/fi';
import bannerImg from '../assets/Banner-img.jpg';
import { useWishlist } from '../context/WishlistContext';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [visibleProducts, setVisibleProducts] = useState(12); // Start with 12 products
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();

  const dropdownRef = useRef();
  const mobileMenuRef = useRef();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || null;

  const filteredProducts = products.filter(p => {
    const matchesTitle = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    return matchesTitle && matchesCategory;
  });

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  // Scroll to top on component mount (page refresh)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/products`);
        // Add mock ratings if not present
        const productsWithRatings = res.data.map(product => ({
          ...product,
          rating: product.rating || Math.floor(Math.random() * 2) + 4, // 4-5 stars
          reviews: product.reviews || Math.floor(Math.random() * 50) + 10 // 10-60 reviews
        }));
        setProducts(productsWithRatings);
      } catch (err) {
        toast.error('Failed to load products');
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.success('Logged out successfully ✅');
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleCategoryClick = (cat) => {
    navigate(`/category/${cat}`);
    setMobileMenuOpen(false);
  };

  const isInWishlist = (productId) => wishlistItems.some(p => p._id === productId);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pt-16 md:pt-24">
      {/* Header */}
      <header className={`fixed top-0 left-0 w-full z-50 bg-white shadow-md transition-all duration-300 ${isScrolled ? 'py-2 shadow-lg' : 'py-3 md:py-4'} px-4 md:px-6 flex justify-between items-center`}>
        <Link
          to="/"
          className="text-xl md:text-2xl font-bold text-orange-600 hover:underline"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="relative w-48">
            <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-md text-gray-700 hover:text-orange-600 focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

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
                  className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                >
                  <Link 
                    to="/orders" 
                    className="block px-4 py-3 hover:bg-orange-50 flex items-center gap-2"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FiPackage /> My Orders
                  </Link>
                  <Link 
                    to="/update-password" 
                    className="block px-4 py-3 hover:bg-orange-50 flex items-center gap-2"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FiKey /> Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 hover:bg-orange-50 flex items-center gap-2"
                  >
                    <FiLogOut /> Logout
                  </button>
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
          className={`fixed top-0 right-0 h-auto max-h-screen overflow-y-auto w-1/2 max-w-xs bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <span className="font-bold text-orange-600">Menu</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <FiX size={20} />
              </button>
            </div>
            
            {/* Mobile Search and Category */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative mb-3">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search handmade treasures..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat, index) => (
                    <option key={index} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <Link 
                to="/" 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600"
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
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600 text-left"
              >
                <FiInfo className="flex-shrink-0" />
                <span>About Us</span>
              </button>

              <Link 
                to="/cart" 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiShoppingCart className="flex-shrink-0" />
                <span>Cart</span>
              </Link>

              <Link 
                to="/wishlist" 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiHeart className="flex-shrink-0" />
                <span>Wishlist</span>
              </Link>

              {user ? (
                <>
                  <div className="pt-2 mt-2 border-t border-gray-100">
                    <div className="flex items-center gap-3 p-3 text-gray-500">
                      <FiUser className="flex-shrink-0" />
                      <span className="truncate">{user.name}</span>
                    </div>
                  </div>
                  
                  <Link 
                    to="/orders" 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiPackage className="flex-shrink-0" />
                    <span>My Orders</span>
                  </Link>
                  
                  <Link 
                    to="/update-password" 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiKey className="flex-shrink-0" />
                    <span>Settings</span>
                  </Link>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600 text-left"
                  >
                    <FiLogOut className="flex-shrink-0" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600"
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
      <div className="relative bg-cover bg-center h-60 md:h-96 overflow-hidden">
        <div 
          className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-white text-center"
          style={{ 
            backgroundImage: `url(${bannerImg})`,
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover'
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="px-4"
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-2">Not Just Handmade. Heartmade.</h2>
            <p className="mb-6 max-w-md text-lg">Explore art you can feel — straight from the hands of India's finest creators. 🧵🎨</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/cart')} 
              className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-lg text-white font-medium"
            >
              Shop Now
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-12 bg-gradient-to-b from-white to-gray-50">
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
                className="bg-white border-2 border-orange-100 rounded-xl px-6 py-3 shadow-md transition-all duration-300 hover:bg-orange-50 hover:border-orange-200 hover:shadow-lg"
              >
                <span className="font-medium text-orange-700">{cat}</span>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-4 py-12 max-w-7xl mx-auto">
        <h3 className="text-2xl font-bold mb-8 text-center">✨ Handpicked For You</h3>
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.slice(0, visibleProducts).map((p, index) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                to={`/product/${p._id}`}
                className="group bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block relative"
              >
                {/* Wishlist Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    isInWishlist(p._id) ? removeFromWishlist(p._id) : addToWishlist(p);
                    toast.success(isInWishlist(p._id) ? 'Removed from wishlist' : 'Added to wishlist');
                  }}
                  className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                  aria-label={isInWishlist(p._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <FiHeart
                    className={`w-5 h-5 ${isInWishlist(p._id) ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                  />
                </button>

                {/* Product Image */}
                <div className="relative h-60 overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {p.rating >= 4.5 && (
                    <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                      🌟 Best Seller
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h4 className="font-semibold text-lg mb-1 group-hover:text-orange-600 transition-colors">
                    {p.title}
                  </h4>
                  <p className="text-sm text-gray-500 mb-2">{p.category}</p>
                  
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(p.rating || 4) ? 'fill-current' : ''}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">({p.reviews || 24})</span>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <span className="text-orange-600 font-bold text-lg">₹{p.price}</span>
                    <span className="text-xs text-gray-500 flex items-center">
                      <FiTruck className="mr-1" /> Free delivery
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filteredProducts.length > 12 && (
          <div className="flex justify-center mt-10">
            {visibleProducts <= 12 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setVisibleProducts(filteredProducts.length)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                See All Products
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setVisibleProducts(12)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Show Less
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-orange-50 py-16 px-4">
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
                className="bg-white p-6 rounded-xl shadow-sm text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
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
              <p>📞 +91 9876543210</p>
              <p>📍 Bangalore, India</p>
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
                  <path d="M22.46 6c-.77.35-1.6.58-2.47.69a4.3 4.3 极市 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 11.1 9.03c0 .34.04.67.1.99A12.13 12.13 0 0 1 3.1 5.1a4.28 4.28 0 0 0 1.32 5.71c-.7-.02-1.36-.21-1.94-.53v.05a4.28 4.28 0 0 0 3.43 4.19c-.33.09-.68.14-1.04.14-.25 0-.5-.02-.74-.07a4.29 4.29 0 0 0 4 2.98A8.6 8.6 0 0 1 2 19.54a12.13 极市 0 0 0 6.56 1.92c7.88 0 极市 12.2-6.53 12.2-12.2 0-.19 0-.39-.01-.58A8.72 8.72 0 0 0 24 4.59a8.5 8.5 0 0 1-2.54.70z"/>
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
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="极市 0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </motion.button>
    </div>
  );
};

export default HomePage;