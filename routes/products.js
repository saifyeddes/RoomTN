const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');

// Routes publiques
router.get('/', productController.getAllProducts);
router.get('/best', productController.getBestSellers);
router.get('/:id', productController.getProductById);

// Routes protégées (admin)
router.post('/', auth, productController.uploadImages, productController.createProduct);
router.put('/:id', auth, productController.uploadImages, productController.updateProduct);
router.delete('/:id', auth, productController.deleteProduct);

module.exports = router;
