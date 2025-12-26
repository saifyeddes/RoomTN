const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');
const Order = require('../models/Order');

// Configuration de multer pour le téléchargement d'images
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, webp)'));
  }
 }).array('images', 5); // Jusqu'à 5 images par produit

// Middleware pour gérer le téléchargement des images
exports.uploadImages = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};



// Meilleures ventes basées sur les commandes (somme des quantités)
exports.getBestSellers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 12;
    // Agréger les commandes pour compter les ventes par product_id
    const top = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product_id', totalSold: { $sum: '$items.quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
    ]);

    const ids = top.map(t => t._id);
    if (ids.length === 0) {
      return res.json([]);
    }

    // Récupérer les produits correspondants
    const products = await Product.find({ _id: { $in: ids } });
    // Ordonner comme l'agrégation
    const orderMap = new Map(top.map(t => [String(t._id), t.totalSold]));
    const sorted = products
      .map(p => ({ p, sold: orderMap.get(String(p._id)) || 0 }))
      .sort((a, b) => b.sold - a.sold)
      .map(x => x.p);

    res.json(sorted);
  } catch (error) {
    console.error('Erreur lors de la récupération des best sellers:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des best sellers' });
  }
};

// Créer un nouveau produit
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

    const parsedColors = colors
      ? JSON.parse(colors).map(c => ({
          name: c,
          code: c.startsWith('#') ? c : '#000000'
        }))
      : [];

    const parsedSizes = sizes ? JSON.parse(sizes) : [];

    const images = (req.files || []).map(file => ({
      url: `/uploads/${file.filename}`,
      alt: name
    }));

    const product = new Product({
      name,
      description: description || '',
      price: Number(price),
      category: ['homme', 'femme', 'unisexe'].includes(category)
        ? category
        : 'unisexe',
      colors: parsedColors,
      sizes: parsedSizes,
      stock: Number(stock) || 0,
      is_new: is_new === 'true',
      is_featured: is_featured === 'true',
      images
    });

    await product.save();
    res.status(201).json(product);

  } catch (err) {
    console.error('CREATE PRODUCT ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};



// Récupérer tous les produits
exports.getAllProducts = async (req, res) => {
  try {
    const { category, featured, new: isNew } = req.query;
    const query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (featured === 'true') {
      query.is_featured = true;
    }
    
    if (isNew === 'true') {
      query.is_new = true;
    }
    
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des produits' });
  }
};

// Récupérer un produit par ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }
    res.json(product);
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du produit' });
  }
};

// Mettre à jour un produit
exports.updateProduct = async (req, res) => {
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

    const updates = {};

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = Number(price);
    if (category !== undefined) updates.category = category;
    if (stock !== undefined) updates.stock = Number(stock);
    if (is_new !== undefined) updates.is_new = is_new === 'true' || is_new === true;
    if (is_featured !== undefined) updates.is_featured = is_featured === 'true' || is_featured === true;

    // ✅ COLORS (safe)
    if (colors) {
      const parsedColors =
        typeof colors === 'string'
          ? JSON.parse(colors).map(c => ({
              name: c,
              code: c.startsWith('#') ? c : '#000000'
            }))
          : colors;

      updates.colors = parsedColors;
    }

    // ✅ SIZES (safe)
    if (sizes) {
      updates.sizes =
        typeof sizes === 'string'
          ? JSON.parse(sizes)
          : sizes;
    }

    // ✅ IMAGES (optionnel)
    if (req.files && req.files.length > 0) {
      updates.images = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        alt: name || 'Product image'
      }));
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    res.json(product);

  } catch (error) {
    console.error('UPDATE PRODUCT ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};


// Supprimer un produit
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }
    
    // Supprimer les images associées
    if (product.images && product.images.length > 0) {
      product.images.forEach(image => {
        const imagePath = path.join(__dirname, '..', image.url);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }
    
    res.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du produit' });
  }
};
