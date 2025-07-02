import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ArtisanDashboard.css';
import { toast } from 'react-toastify';

const ArtisanDashboard = () => {
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

  //const artisanId = '684bd1139b419c567ba4f4fa'; // Replace with dynamic login later
  const user = JSON.parse(localStorage.getItem('user'));
  const artisanId = user?._id; 

  const fetchProducts = async () => {
    const res = await axios.get(`http://localhost:5000/api/products/artisan/${artisanId}`);
    setProducts(res.data);
  };

const fetchOrders = async () => {
  const res = await axios.get(`http://localhost:5000/api/orders/artisan/${artisanId}`);
  console.log("Fetched orders:", res.data); // 👀 Check this
  setOrders(res.data);
};

  useEffect(() => {
    if (user?.role === 'artisan') {
      fetchProducts();
      fetchOrders();
    }
  }, []);



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
        await axios.put(`http://localhost:5000/api/products/${form._id}`, productData);
        toast.success('Product updated successfully ✅');
      } else {
        await axios.post('http://localhost:5000/api/products', productData);
        toast.success('Product added successfully ✅');
      }

      setForm({ title: '', description: '', price: '', image: '', category: '', _id: '' });
      fetchProducts();
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(error.response.data.message || 'You are not approved to add products');
      } else {
        toast.error('Something went wrong');
        console.error(error);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      toast.success('Product deleted successfully ❌');
      fetchProducts();
    } catch (error) {
      toast.error('Error deleting product');
      console.error(error);
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
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated');
      fetchOrders();
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
    <div className="artisan-dashboard">
      <h2>👨‍🎨 Artisan Dashboard</h2>

      {/* Product Form */}
      <form onSubmit={handleSubmit} className="product-form">
        <input name="title" placeholder="Product Title" value={form.title} onChange={handleChange} required />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
        <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required />
        <input name="image" placeholder="Image URL" value={form.image} onChange={handleChange} />
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
        <button type="submit">{form._id ? 'Update' : 'Add'} Product</button>
      </form>

      {/* Product List */}
      <h3>📦 My Products</h3>
      <ul className="product-list">
        {products.map(p => (
          <li key={p._id} className="product-item">
            <div>
              <strong>{p.title}</strong> — ₹{p.price} {p.isApproved ? '✅' : '❌'}
            </div>
            <div>
              <button onClick={() => handleEdit(p)}>Edit</button>
              <button onClick={() => handleDelete(p._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      {/* Orders */}
      <h3>📬 Orders to Manage</h3>
      <div className="order-list">
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          orders.map(order => (
            <div key={order._id} className="order-card">
              <p><strong>Order ID:</strong> {order._id}</p>
              <p><strong>Customer:</strong> {order.user?.name || 'Unknown'}</p>
              <p><strong>Total:</strong> ₹{order.total}</p>
              <p><strong>Status:</strong> {order.status}</p>

              <ul>
                {order.items
                  .filter(item => item.artisan === artisanId)
                  .map((item, idx) => (
                    <li key={idx}>
                      <img src={item.productId?.image} alt="" width="50" />
                      {item.productId?.title} × {item.quantity}
                    </li>
                  ))}
              </ul>

              {getNextStatus(order.status) && (
                <button onClick={() => handleStatusUpdate(order._id, getNextStatus(order.status))}>
                  Mark as {getNextStatus(order.status)}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ArtisanDashboard;
