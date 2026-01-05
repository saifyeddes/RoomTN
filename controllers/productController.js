const Product = require('../models/Product');
const Order = require('../models/Order');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

/* =======================
   UTILS
======================= */
const safeJSON = (value, fallback = []) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

/* =======================
   MULTER (MEMORY)
======================= */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

exports.uploadImages = upload.array('images', 5);

/* =======================
   CREATE PRODUCT
======================= */
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description = '',
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

    const parsedColors = safeJSON(colors)
      .filter(c => typeof c === 'string' && c.trim())
      .map(c => ({
        name: c,
        code: c.startsWith('#') ? c : '#000000'
      }));

    const parsedSizes = safeJSON(sizes);

    const images = [];
    for (const file of req.files || []) {
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        { folder: 'products' }
      );

      images.push({
        url: result.secure_url,
        alt: name
      });
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category: category || 'unisexe',
      colors: parsedColors,
      sizes: parsedSizes,
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

/* =======================
   GET ALL PRODUCTS
======================= */
exports.getAllProducts = async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
};

/* =======================
   GET PRODUCT BY ID
======================= */
exports.getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
  res.json(product);
};

/* =======================
   UPDATE PRODUCT
======================= */
exports.updateProduct = async (req, res) => {
  try {
    const updates = {};

    const fields = [
      'name', 'description', 'category',
      'is_new', 'is_featured'
    ];

    fields.forEach(f => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    if (req.body.price !== undefined) updates.price = Number(req.body.price);
    if (req.body.stock !== undefined) updates.stock = Number(req.body.stock);

    if (req.body.colors) {
      updates.colors = safeJSON(req.body.colors)
        .filter(c => typeof c === 'string' && c.trim())
        .map(c => ({
          name: c,
          code: c.startsWith('#') ? c : '#000000'
        }));
    }

    if (req.body.sizes) {
      updates.sizes = safeJSON(req.body.sizes);
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

/* =======================
   DELETE PRODUCT
======================= */
exports.deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Produit supprimé' });
};
