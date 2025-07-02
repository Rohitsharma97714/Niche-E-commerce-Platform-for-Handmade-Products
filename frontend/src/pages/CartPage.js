import React, { useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import '../styles/CartPage.css';
import { toast } from 'react-toastify';

const CartPage = () => {
  const { cartItems, setCartItems, removeFromCart } = useCart();
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState({
    name: '',
    mobile: '',
    pincode: '',
    state: '',
    city: '',
    address: '',
    paymentMode: '',
  });

  const rawUser = JSON.parse(localStorage.getItem('user')) || {};
  const user = { ...rawUser, _id: rawUser._id || rawUser.id };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const increaseQuantity = (id) => {
    const updated = cartItems.map(item =>
      item._id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const decreaseQuantity = (id) => {
    const updated = cartItems.map(item =>
      item._id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
    );
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const saveOrder = async (paymentStatus) => {
    try {
      await axios.post('http://localhost:5000/api/orders', {
        userId: user._id,
        items: cartItems.map(item => ({
          productId: item._id,
          quantity: item.quantity,
          artisan: item.artisan, // ✅ INCLUDE artisan
        })),
        total: totalPrice,
        address: deliveryDetails.address,
        paymentStatus,
      });

      toast.success(`Order placed successfully (${paymentStatus})`);
      setCartItems([]);
      localStorage.removeItem('cart');
      setShowDeliveryForm(false);
    } catch (err) {
      toast.error('Failed to save order');
      console.error(err);
    }
  };

  const handlePayment = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/payment/order', {
        amount: totalPrice * 100,
      });

      const { order } = res.data;

      const options = {
        key: 'rzp_test_LOiqgNY2f5M6Kw',
        amount: order.amount,
        currency: 'INR',
        name: 'Desi-Etsy',
        description: 'Order Payment',
        order_id: order.id,
        handler: async function (response) {
          await saveOrder('Paid');
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: { color: '#cc5200' },
        modal: {
          ondismiss: function () {
            toast.warning('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error("❌ Payment Failed: " + response.error.description);
      });

      rzp.open();
    } catch (error) {
      toast.error('Payment initiation failed');
      console.error('Payment Error:', error);
    }
  };

  const handleFinalSubmit = async () => {
    const { name, mobile, address, paymentMode, pincode, state, city } = deliveryDetails;

    if (!name || !mobile || !address || !pincode || !state || !city) {
      toast.error('Please fill in all delivery details');
      return;
    }

    if (!user || !user._id) {
      toast.error('You must be logged in to place an order');
      return;
    }

    const orderPayload = {
      userId: user._id,
      items: cartItems.map(item => ({
        productId: item._id,
        quantity: item.quantity,
        artisan: item.artisan, // ✅ INCLUDE artisan
      })),
      total: totalPrice,
      address,
      paymentStatus: paymentMode === 'cod' ? 'Pending' : 'Paid',
    };

    if (paymentMode === 'cod') {
      try {
        await axios.post('http://localhost:5000/api/orders', orderPayload);
        toast.success('Order placed successfully (Cash on Delivery)');
        setCartItems([]);
        localStorage.removeItem('cart');
        setShowDeliveryForm(false);
      } catch (err) {
        toast.error('Failed to place order');
      }
    } else {
      handlePayment();
    }
  };

  return (
    <div className="cart-page">
      <h2>Your Cart 🛒</h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="cart-layout">
          <div className="cart-items-section">
            {!showDeliveryForm ? (
              <ul className="cart-list">
                {cartItems.map((item, index) => (
                  <li className="cart-item" key={index}>
                    <img src={item.image} alt={item.title} />
                    <div className="cart-item-details">
                      <h4>{item.title}</h4>
                      <p>Price: ₹{item.price}</p>
                      <div className="quantity-controls">
                        <button onClick={() => decreaseQuantity(item._id)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => increaseQuantity(item._id)}>+</button>
                      </div>
                      <button className="remove-btn" onClick={() => removeFromCart(item._id)}>Remove</button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="delivery-form">
                <h3>Delivery Address 🏠</h3>
                <input type="text" placeholder="Full Name" value={deliveryDetails.name} onChange={e => setDeliveryDetails({ ...deliveryDetails, name: e.target.value })} />
                <input type="tel" placeholder="Mobile Number" value={deliveryDetails.mobile} onChange={e => setDeliveryDetails({ ...deliveryDetails, mobile: e.target.value })} />
                <input type="text" placeholder="Pincode" value={deliveryDetails.pincode} onChange={e => setDeliveryDetails({ ...deliveryDetails, pincode: e.target.value })} />
                <input type="text" placeholder="State" value={deliveryDetails.state} onChange={e => setDeliveryDetails({ ...deliveryDetails, state: e.target.value })} />
                <input type="text" placeholder="City" value={deliveryDetails.city} onChange={e => setDeliveryDetails({ ...deliveryDetails, city: e.target.value })} />
                <textarea placeholder="Flat / Area / Landmark" rows="3" value={deliveryDetails.address} onChange={e => setDeliveryDetails({ ...deliveryDetails, address: e.target.value })}></textarea>
                <select value={deliveryDetails.paymentMode} onChange={e => setDeliveryDetails({ ...deliveryDetails, paymentMode: e.target.value })}>
                  <option value="">Select Payment Mode</option>
                  <option value="cod">Cash on Delivery</option>
                  <option value="upi">Razorpay</option>
                </select>
                <button className="confirm-btn" onClick={handleFinalSubmit}>Confirm Order</button>
              </div>
            )}
          </div>

          <div className="checkout-summary">
            <h3>Order Summary</h3>
            <p>Total Items: {totalItems}</p>
            <p>Total Price: ₹{totalPrice}</p>

            {!showDeliveryForm && (
              <button className="checkout-btn" onClick={() => setShowDeliveryForm(true)}>
                Place Order
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
