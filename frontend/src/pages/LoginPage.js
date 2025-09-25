import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../index.css'; // Tailwind / global styles
import GoogleRoleSelection from '../components/GoogleRoleSelection';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
        email,
        password,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem(
        'user',
        JSON.stringify({ ...res.data.user, _id: res.data.user._id || res.data.user.id })
      );

      toast.success('Login successful!');

      setTimeout(() => {
        const role = res.data.user.role;
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'artisan') navigate('/artisan/dashboard');
        else navigate('/');
      }, 1000);
    } catch (err) {
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };





  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const user = urlParams.get('user');
    const error = urlParams.get('error');

    if (error) {
      toast.error(`Google authentication failed: ${error}`);
      // Clear the URL parameters to prevent re-processing
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (token && user) {
      try {
        localStorage.setItem('token', token);
        localStorage.setItem('user', decodeURIComponent(user));
        toast.success('Google login successful!');
        const userObj = JSON.parse(decodeURIComponent(user));
        const role = userObj.role;
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'artisan') navigate('/artisan/dashboard');
        else navigate('/');
        // Clear the URL parameters to prevent re-processing
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.error('Error processing Google callback:', err);
        toast.error('Error processing authentication response');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-pink-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-orange-600 dark:text-orange-400 mb-2">Welcome Back 👋</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Please login to continue</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-2.5 cursor-pointer text-lg"
              role="button"
              aria-label="Toggle Password Visibility"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setShowPassword((prev) => !prev)}
            >
              {showPassword ? '🙈' : '👁️'}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <Link to="/forgot-password" className="text-orange-600 dark:text-orange-400 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold transition ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6">
          <GoogleRoleSelection onRoleSelect={(role) => {
            // Role selection is handled within the component
            console.log('Selected role:', role);
          }} />
        </div>

        <p className="text-sm text-center mt-6 text-gray-600 dark:text-gray-400">
          New user?{' '}
          <Link to="/register" className="text-orange-600 dark:text-orange-400 hover:underline">
            Register here
          </Link>
        </p>
      </div>

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default LoginPage;
