import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../index.css';

// ArtisanProfile Component
const ArtisanProfile = ({ user }) => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef();

  const toggleDropdown = () => setOpenDropdown(prev => !prev);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleUpdatePassword = () => {
    window.location.href = '/update-password';
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex justify-end mb-6">
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="inline-flex items-center justify-center w-full rounded-md bg-white border border-gray-300 shadow-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          👤 {user?.name}
          <svg
            className="-mr-1 ml-2 h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.586l3.71-4.356a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {openDropdown && (
          <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              <button
                onClick={handleUpdatePassword}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                🔐 Update Password
              </button>
              <button
                onClick={handleLogout}
                className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ArtisanDashboard Component
const ArtisanDashboard = ({ darkMode }) => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    image: '',
    category: '',
    _id: ''
  });

  const user = JSON.parse(localStorage.getItem('user'));
  const artisanId = user?._id;

  useEffect(() => {
    if (user?.role === 'artisan') {
      const fetchProducts = async () => {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/products/artisan/${artisanId}`);
        setProducts(res.data);
      };

      const fetchOrders = async () => {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/orders/artisan/${artisanId}`);
        setOrders(res.data);
      };

      fetchProducts();
      fetchOrders();
    }
  }, [artisanId, user?.role]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const productData = {
      title: form.title,
      description: form.description,
      price: Number(form.price),
      image: form.image,
      category: form.category,
      artisanId
    };

    try {
      if (form._id) {
        await axios.put(`${process.env.REACT_APP_API_URL}/products/${form._id}`, productData);
        toast.success('Product updated successfully ✅');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/products`, productData);
        toast.success('Product added successfully ✅');
      }
      setForm({ title: '', description: '', price: '', image: '', category: '', _id: '' });

      // Refresh products
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/products/artisan/${artisanId}`);
      setProducts(res.data);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(error.response.data.message || 'You are not approved to add products');
      } else {
        toast.error('Something went wrong');
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/products/${id}`);
      toast.success('Product deleted successfully ❌');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/products/artisan/${artisanId}`);
      setProducts(res.data);
    } catch (error) {
      toast.error('Error deleting product');
    }
  };

  const handleEdit = (product) => {
    setForm({
      title: product.title,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
      _id: product._id
    });
    toast.info('Editing product...');
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/orders/artisan/${artisanId}`);
      setOrders(res.data);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const getNextStatus = (current) => {
    const flow = ['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
    const idx = flow.indexOf(current);
    return idx !== -1 && idx < flow.length - 1 ? flow[idx + 1] : null;
  };

  return (
    <div className={`min-h-screen w-full px-4 py-6 ${darkMode ? 'bg-gray-900 text-gray-100' : ''}`}>
      <h2 className="text-3xl font-bold text-center mb-2">👨‍🎨 Artisan Dashboard</h2>

      <ArtisanProfile user={user} />

      {/* Product Form */}
      <form onSubmit={handleSubmit} className={`shadow-lg rounded-xl p-8 mb-10 space-y-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-orange-50 to-blue-50 border-orange-100'}`}>
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          {form._id ? '✏️ Edit Product' : '➕ Add New Product'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className={`block mb-1 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>📝 Product Title</label>
            <input
              id="title"
              name="title"
              placeholder="e.g. Handcrafted Vase"
              value={form.title}
              onChange={handleChange}
              required
              className={`input input-bordered w-full focus:ring-2 focus:ring-orange-400 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
            />
          </div>
          <div>
            <label htmlFor="price" className={`block mb-1 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>💰 Price (₹)</label>
            <input
              id="price"
              name="price"
              type="number"
              placeholder="e.g. 499"
              value={form.price}
              onChange={handleChange}
              required
              className={`input input-bordered w-full focus:ring-2 focus:ring-orange-400 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
            />
          </div>
          <div>
            <label htmlFor="category" className={`block mb-1 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>🏷️ Category</label>
            <input
              id="category"
              name="category"
              placeholder="e.g. Home Decor"
              value={form.category}
              onChange={handleChange}
              className={`input input-bordered w-full focus:ring-2 focus:ring-orange-400 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
            />
          </div>
          <div>
            <label htmlFor="image" className={`block mb-1 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>🖼️ Image URL</label>
            <input
              id="image"
              name="image"
              placeholder="Paste image URL"
              value={form.image}
              onChange={handleChange}
              className={`input input-bordered w-full focus:ring-2 focus:ring-orange-400 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
            />
          </div>
        </div>
        <div>
          <label htmlFor="description" className={`block mb-1 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>📝 Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="Describe your product..."
            value={form.description}
            onChange={handleChange}
            required
            className={`textarea textarea-bordered w-full mt-2 focus:ring-2 focus:ring-orange-400 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
            rows={3}
          />
        </div>
        <button
          type="submit"
          className="bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white px-8 py-2 rounded-lg font-semibold shadow transition"
        >
          {form._id ? 'Update Product' : 'Add Product'}
        </button>
      </form>

      {/* Product List */}
      <h3 className="text-xl font-semibold mb-4">📦 My Products</h3>
      <ul className="space-y-3 mb-10">
        {products.map(p => (
          <li key={p._id} className={`shadow-md p-4 rounded flex justify-between items-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div>
              <p className="font-semibold">{p.title}</p>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>₹{p.price} {p.isApproved ? '✅' : '❌'}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(p)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded">Edit</button>
              <button onClick={() => handleDelete(p._id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Delete</button>
            </div>
          </li>
        ))}
      </ul>

      {/* Orders */}
      <h3 className="text-xl font-semibold mb-4">📬 Orders to Manage</h3>
      <div className="space-y-6">
        {orders.length === 0 ? (
          <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No orders found.</p>
        ) : (
          orders.map(order => (
            <div key={order._id} className={`shadow-md rounded p-4 space-y-2 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <p><strong>Order ID:</strong> {order._id}</p>
              <p><strong>Customer:</strong> {order.user?.name || 'Unknown'}</p>
              <p><strong>Total:</strong> ₹{order.total}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <ul className="pl-4 list-disc">
                {order.items.filter(item => item.artisan === artisanId).map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <img src={item.productId?.image} alt="" className="w-12 h-12 object-cover rounded" />
                    {item.productId?.title} × {item.quantity}
                  </li>
                ))}
              </ul>
              {getNextStatus(order.status) && (
                <button
                  onClick={() => handleStatusUpdate(order._id, getNextStatus(order.status))}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded mt-2"
                >
                  Mark as {getNextStatus(order.status)}
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default ArtisanDashboard;
