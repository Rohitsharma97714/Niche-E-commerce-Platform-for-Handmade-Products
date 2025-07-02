import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ArtisanOrdersPage.css';
import { toast } from 'react-toastify';

const ArtisanOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));
  const artisanId = user?._id;

  const statusOptions = [
    'Placed',
    'Processing',
    'Shipped',
    'Out for Delivery',
    'Delivered'
  ];

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/orders/artisan/${artisanId}`);
      setOrders(res.data);
    } catch (err) {
      toast.error("Failed to load artisan orders");
      console.error(err);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: newStatus });
      toast.success("Order status updated");
      fetchOrders();
    } catch (err) {
      toast.error("Failed to update status");
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.role === 'artisan') {
      fetchOrders();
    }
  }, []);

  return (
    <div className="artisan-order-page">
      <h2>🧾 Manage Your Orders</h2>

      {orders.length === 0 ? (
        <p>No orders found for your products.</p>
      ) : (
        orders.map(order => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <span><strong>Order ID:</strong> {order._id}</span>
              <span><strong>Customer:</strong> {order.user?.name || 'Unknown'}</span>
            </div>

            <p><strong>Status:</strong></p>
            <select
              className="order-status-select"
              value={order.status}
              onChange={(e) => updateStatus(order._id, e.target.value)}
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <ul className="order-items">
              {order.items
                .filter(item => item.artisan === artisanId)
                .map((item, index) => (
                  <li key={index} className="order-item">
                    <img src={item.productId?.image} alt="Product" />
                    <span>{item.productId?.title || 'Unnamed Product'} × {item.quantity}</span>
                  </li>
                ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default ArtisanOrdersPage;
