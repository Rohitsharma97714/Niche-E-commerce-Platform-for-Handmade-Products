import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import ArtisanDashboard from './pages/ArtisanDashboard';
import AdminDashboard from './pages/AdminDashboard';
import HomePage from './pages/HomePage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import CategoryPage from './pages/CategoryPage';
import MyOrdersPage from './pages/MyOrdersPage';
import ProfilePage from './pages/ProfilePage';

import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsConditionsPage from './pages/TermsConditionsPage';
import WishlistPage from './pages/WishlistPage';
import NavBar from './components/NavBar';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  // ✅ Axios interceptor for token invalidation
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401 && error.response.data.message === 'Token invalidated due to server restart') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // ✅ Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const isDark = savedTheme === 'dark';
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  // ✅ Toggle theme
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    // Removed direct class toggle here to handle in useEffect
  };

  // Sync dark class on document.documentElement with darkMode state
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <WishlistProvider>
      <CartProvider>
        <Router>
          <ToastContainer position="top-right" autoClose={3000} />
          <Routes>
            {/* HomePage — No NavBar */}
            <Route path="/" element={<HomePage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />

            {/* Routes with NavBar */}
            <Route path="/product/:id" element={<><NavBar darkMode={darkMode} toggleDarkMode={toggleDarkMode} /><ProductDetailsPage /></>} />
            <Route path="/login" element={<><NavBar darkMode={darkMode} toggleDarkMode={toggleDarkMode} /><LoginPage /></>} />
            <Route path="/register" element={<><NavBar darkMode={darkMode} toggleDarkMode={toggleDarkMode} /><RegisterPage /></>} />
            <Route path="/category/:categoryName" element={<><NavBar darkMode={darkMode} toggleDarkMode={toggleDarkMode} /><CategoryPage /></>} />
            <Route path="/orders" element={<><NavBar darkMode={darkMode} toggleDarkMode={toggleDarkMode} /><MyOrdersPage darkMode={darkMode} /></>} />
            <Route path="/forgot-password" element={<><NavBar darkMode={darkMode} toggleDarkMode={toggleDarkMode} /><ForgotPasswordPage /></>} />
            <Route path="/update-password" element={<><NavBar darkMode={darkMode} toggleDarkMode={toggleDarkMode} /><UpdatePasswordPage darkMode={darkMode} /></>} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/privacy" element={<><NavBar darkMode={darkMode} toggleDarkMode={toggleDarkMode} /><PrivacyPolicyPage darkMode={darkMode} /></>} />
            <Route path="/terms" element={<><NavBar darkMode={darkMode} toggleDarkMode={toggleDarkMode} /><TermsConditionsPage darkMode={darkMode} /></>} />
            <Route path="/wishlist" element={<><NavBar darkMode={darkMode} toggleDarkMode={toggleDarkMode} /><WishlistPage /></>} />
            <Route path="/profile" element={<><NavBar darkMode={darkMode} toggleDarkMode={toggleDarkMode} /><ProfilePage darkMode={darkMode} /></>} />

            {/* Protected route: Customer/Artisan/Admin can access cart */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute allowedRoles={['customer', 'artisan', 'admin']}>
                  <>
                    <NavBar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                    <CartPage />
                  </>
                </ProtectedRoute>
              }
            />

            {/* Admin only */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <>
                    <NavBar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                    <AdminDashboard darkMode={darkMode} />
                  </>
                </ProtectedRoute>
              }
            />

            {/* Artisan only */}
            <Route
              path="/artisan/dashboard"
              element={
                <ProtectedRoute allowedRoles={['artisan']}>
                  <>
                    <NavBar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                    <ArtisanDashboard darkMode={darkMode} />
                  </>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </CartProvider>
    </WishlistProvider>
  );
}

export default App;
