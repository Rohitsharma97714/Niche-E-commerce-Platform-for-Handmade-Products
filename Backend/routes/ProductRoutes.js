const express = require('express');
const Product = require('../models/Product');
const User = require('../models/User'); // ✅ Added to check artisan approval
const router = express.Router();

// ✅ Create a new product (only if artisan is approved)
router.post('/', async (req, res) => {
  const { title, description, price, image, category, artisanId } = req.body;

  try {
    const artisan = await User.findById(artisanId);

    if (!artisan) {
      return res.status(404).json({ message: 'Artisan not found' });
    }

    // ✅ Corrected logic: Only allow if artisan is approved
    if (artisan.role === 'artisan' && !artisan.isApproved) {
      return res.status(403).json({ message: 'Your artisan profile is not approved yet.' });
    }

    const product = new Product({ title, description, price, image, category, artisanId });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('[Product POST Error]', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});


// ✅ Get all approved products (for customers)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ isApproved: true });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get products by artisan ID
router.get('/artisan/:artisanId', async (req, res) => {
  try {
    const products = await Product.find({ artisanId: req.params.artisanId });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all unapproved products (for admin)
router.get('/unapproved', async (req, res) => {
  try {
    const products = await Product.find({ isApproved: false }).populate('artisanId', 'name email');
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Approve or reject a product (admin)
router.patch('/approve/:id', async (req, res) => {
  const { isApproved } = req.body;
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    );
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update product (artisan only)
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete product (artisan only)
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get product by ID (⚠️ placed last to avoid conflicts)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
