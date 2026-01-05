const Product = require('../models/Product');
const Order = require('../models/Order');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

const safeJSON = (value, fallback = []) => {
  try {
    if (!value) return fallback;
    if (Array.isArray(value)) return value;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

// =======================
// MULTER (MEMORY)
// =======================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});
exports.uploadImages = upload.array('images', 5);

// =======================
// UTILS
// =======================
const normalizeColors = (colors) => {
  if (!colors) return [];

  let arr = [];
  try {
    arr = typeof colors === 'string' ? JSON.parse(colors) : colors;
  } catch {
    return [];
  }

  return arr
    .filter(Boolean)
    .map(c => {
      if (typeof c === 'string') {
        return {
          name: c,
          code: c.startsWith('#') ? c : '#000000'
        };
      }
      if (typeof c === 'object') {
        return {
          name: c.name || 'Color',
          code: typeof c.code === 'string' && c.code.startsWith('#')
            ? c.code
            : '#000000'
        };
      }
      return null;
    })
    .filter(Boolean);
};

const normalizeSizes = (sizes) => {
  if (!sizes) return [];
  try {
    return typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
  } catch {
    return [];
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

    const images = [];
    for (const file of req.files || []) {
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        { folder: 'products' }
      );
      images.push({ url: result.secure_url, alt: name });
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category: category || 'unisexe',
      colors: normalizeColors(colors),
      sizes: normalizeSizes(sizes),
      stock: Number(stock) || 0,
      is_new: is_new === 'true' || is_new === true,
      is_featured: is_featured === 'true' || is_featured === true,
      images
    });

    res.status(201).json(product);
  } catch (err) {
    console.error('CREATE PRODUCT ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};

// =======================
// UPDATE PRODUCT
// =======================
exports.updateProduct = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.colors) {
      updates.colors = normalizeColors(updates.colors);
    }

    if (updates.sizes) {
      updates.sizes = normalizeSizes(updates.sizes);
    }

    if (req.files?.length) {
      updates.images = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
          { folder: 'products' }
        );
        updates.images.push({
          url: result.secure_url,
          alt: updates.name || 'Product'
        });
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json(product);
  } catch (err) {
    console.error('UPDATE PRODUCT ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};

// =======================
// GETTERS
// =======================
exports.getAllProducts = async (_, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
};

exports.getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
  res.json(product);
};

exports.getBestSellers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const top = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product_id', totalSold: { $sum: '$items.quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: limit }
    ]);
    const ids = top.map(t => t._id);
    const products = await Product.find({ _id: { $in: ids } });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Produit supprimé' });
};
