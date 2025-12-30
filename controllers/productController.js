const Product = require('../models/Product');
const Order = require('../models/Order');

// =======================
// BEST SELLERS
// =======================
exports.getBestSellers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 12;

    const top = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product_id', totalSold: { $sum: '$items.quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
    ]);

    const ids = top.map(t => t._id);
    if (!ids.length) return res.json([]);

    const products = await Product.find({ _id: { $in: ids } });
    res.json(products);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =======================
// CREATE PRODUCT
// =======================
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      colors,
      sizes,
      stock,
      is_new,
      is_featured
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'Nom et prix obligatoires' });
    }

    const parsedColors = colors ? JSON.parse(colors).map(c => ({
      name: c,
      code: c.startsWith('#') ? c : '#000000'
    })) : [];

    const parsedSizes = sizes ? JSON.parse(sizes) : [];

    const images = (req.files || []).map(file => ({
      url: file.path, // ✅ URL CLOUDINARY
      alt: name
    }));

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      colors: parsedColors,
      sizes: parsedSizes,
      stock: Number(stock) || 0,
      is_new: is_new === 'true',
      is_featured: is_featured === 'true',
      images
    });

    res.status(201).json(product);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// =======================
// GET ALL PRODUCTS
// =======================
exports.getAllProducts = async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
};

// =======================
// GET PRODUCT BY ID
// =======================
exports.getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
  res.json(product);
};

// =======================
// UPDATE PRODUCT
// =======================
exports.updateProduct = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.colors) {
      updates.colors = JSON.parse(updates.colors).map(c => ({
        name: c,
        code: c.startsWith('#') ? c : '#000000'
      }));
    }

    if (updates.sizes) {
      updates.sizes = JSON.parse(updates.sizes);
    }

    if (req.files?.length) {
      updates.images = req.files.map(file => ({
        url: file.path, // ✅ CLOUDINARY
        alt: updates.name || 'Product'
      }));
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json(product);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =======================
// DELETE PRODUCT
// =======================
exports.deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Produit supprimé' });
};
