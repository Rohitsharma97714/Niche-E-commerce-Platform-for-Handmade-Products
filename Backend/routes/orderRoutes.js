const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// ✅ Create Order
router.post('/', async (req, res) => {
  const { userId, items, total, address, paymentStatus } = req.body;
  console.log('🛒 Order incoming:', { userId, items, total, address, paymentStatus });

  try {
    const populatedItems = await Promise.all(items.map(async item => {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      return {
        productId: item.productId,
        quantity: item.quantity,
        artisan: product.artisanId // ✅ FIXED: get artisanId from product
      };
    }));

    const order = new Order({
      user: userId,
      items: populatedItems,
      total,
      address,
      paymentStatus
    });

    await order.save();
    console.log('✅ Order saved:', order);
    res.status(201).json({ message: 'Order placed', order });
  } catch (err) {
    console.error("❌ Order Save Error:", err);
    res.status(500).json({ error: err.message || 'Order failed' });
  }
});

// ✅ Get orders for a specific user
router.get('/user/:id', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.id }).populate('items.productId');
    res.json(orders);
  } catch (err) {
    console.error("Fetch user orders error:", err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// ✅ Cancel order (if still pending)
router.put('/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    order.status = 'Cancelled';
    await order.save();

    res.json({ message: 'Order cancelled', order });
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ message: 'Failed to cancel order' });
  }
});

// ✅ Get orders for a specific artisan
router.get('/artisan/:artisanId', async (req, res) => {
  try {
    const orders = await Order.find({ 'items.artisan': req.params.artisanId })
      .populate('user')
      .populate('items.productId');
    res.json(orders);
  } catch (err) {
    console.error("Fetch artisan orders error:", err);
    res.status(500).json({ message: 'Failed to fetch artisan orders' });
  }
});

// ✅ Update order status (artisan action)
router.put('/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json({ message: 'Order status updated', order });
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

module.exports = router;
