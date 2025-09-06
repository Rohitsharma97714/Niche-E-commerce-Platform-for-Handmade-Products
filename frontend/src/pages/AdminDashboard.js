import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import '../index.css';

const AdminDashboard = ({ darkMode }) => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [unapprovedArtisans, setUnapprovedArtisans] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchUnapprovedProducts();
    fetchUnapprovedArtisans();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setShowDropdown(false);
    navigate('/');
  };

  const handleUpdatePassword = () => {
    setShowDropdown(false);
    navigate('/update-password');
  };

  const fetchUnapprovedProducts = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/products/unapproved`);
      setProducts(res.data);
    } catch (err) {
      toast.error('Failed to fetch products');
    }
  };

  const fetchUnapprovedArtisans = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/admin/unapproved-artisans`);
      setUnapprovedArtisans(res.data);
    } catch (err) {
      toast.error('Failed to fetch artisans');
    }
  };

  const handleApproveProduct = async (id) => {
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/products/approve/${id}`, { isApproved: true });
      toast.success('Product approved ✅');
      fetchUnapprovedProducts();
    } catch (err) {
      toast.error('Error approving product');
    }
  };

  const handleRejectProduct = async (id) => {
    if (window.confirm('Are you sure you want to reject this product?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/products/${id}`);
        toast.error('Product rejected ❌');
        fetchUnapprovedProducts();
      } catch (err) {
        toast.error('Error rejecting product');
      }
    }
  };

  const handleApproveArtisan = async (id) => {
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/admin/approve-artisan/${id}`);
      toast.success('Artisan approved ✅');
      fetchUnapprovedArtisans();
    } catch (err) {
      toast.error('Error approving artisan');
    }
  };

  const handleRejectArtisan = async (id) => {
    if (window.confirm('Are you sure you want to reject this artisan?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/admin/reject-artisan/${id}`);
        toast.error('Artisan rejected ❌');
        fetchUnapprovedArtisans();
      } catch (err) {
        toast.error('Error rejecting artisan');
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-800 dark:text-gray-100">
      {/* Profile Dropdown */}
      <div className="absolute top-6 right-6" ref={dropdownRef}>
        <div className="relative inline-block text-left">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium px-4 py-2 rounded shadow"
          >
            {user?.name || 'Admin'} ▼
          </button>
          {showDropdown && (
            <div className={`absolute right-0 mt-2 w-44 border rounded shadow-lg z-50 ${
              darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}>
              <button
                onClick={handleUpdatePassword}
                className={`block w-full text-left px-4 py-2 ${
                  darkMode
                    ? 'text-gray-200 hover:bg-gray-700'
                    : 'text-gray-800 hover:bg-gray-100'
                }`}
              >
                Update Password
              </button>
              <button
                onClick={handleLogout}
                className={`block w-full text-left px-4 py-2 ${
                  darkMode
                    ? 'text-gray-200 hover:bg-gray-700'
                    : 'text-gray-800 hover:bg-gray-100'
                }`}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Header */}
      <h2 className="text-3xl font-bold text-orange-600 mb-2">🛠️ Admin Dashboard</h2>
      <p className="mb-6 text-gray-600">Review and manage artisan products and accounts</p>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded font-medium ${
            activeTab === 'products'
              ? 'bg-orange-600 text-white'
              : 'bg-white border border-orange-300 text-orange-600'
          }`}
          onClick={() => setActiveTab('products')}
        >
          📦 Product Requests{' '}
          <span className="ml-1 bg-white text-orange-600 font-bold px-2 py-0.5 rounded-full">
            {products.length}
          </span>
        </button>
        <button
          className={`px-4 py-2 rounded font-medium ${
            activeTab === 'artisans'
              ? 'bg-orange-600 text-white'
              : 'bg-white border border-orange-300 text-orange-600'
          }`}
          onClick={() => setActiveTab('artisans')}
        >
          👥 Artisan Requests{' '}
          <span className="ml-1 bg-white text-orange-600 font-bold px-2 py-0.5 rounded-full">
            {unapprovedArtisans.length}
          </span>
        </button>
      </div>

      {/* Product Requests */}
      {activeTab === 'products' && (
        <div>
          <h3 className="text-xl font-semibold mb-4">📦 Pending Product Approvals</h3>
          {products.length === 0 ? (
            <p className="text-gray-500">No pending products 🚫</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p) => (
                <div key={p._id} className="bg-white shadow rounded p-4">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-48 object-cover rounded mb-3"
                  />
                  <h4 className="font-semibold">{p.title}</h4>
                  <p className="text-sm text-gray-600">Category: {p.category}</p>
                  <p className="text-sm text-gray-600">Price: ₹{p.price}</p>
                  <p className="text-sm text-gray-600 mb-2">
                    Artisan: {p.artisanId?.name || 'Unknown'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveProduct(p._id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Approve ✅
                    </button>
                    <button
                      onClick={() => handleRejectProduct(p._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Reject ❌
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Artisan Requests */}
      {activeTab === 'artisans' && (
        <div>
          <h3 className="text-xl font-semibold mb-4">👥 Pending Artisan Approvals</h3>
          {unapprovedArtisans.length === 0 ? (
            <p className="text-gray-500">No pending artisans 🚫</p>
          ) : (
            <ul className="space-y-4">
              {unapprovedArtisans.map((user) => (
                <li
                  key={user._id}
                  className="bg-white shadow rounded flex justify-between items-center p-4"
                >
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveArtisan(user._id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Approve ✅
                    </button>
                    <button
                      onClick={() => handleRejectArtisan(user._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Reject ❌
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default AdminDashboard;
