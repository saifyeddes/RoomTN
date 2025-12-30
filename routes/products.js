const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');

// PUBLIC
router.get('/', productController.getAllProducts);
router.get('/best', productController.getBestSellers);
router.get('/:id', productController.getProductById);

// ADMIN (CRUD)
router.post(
  '/',
  auth,
  upload.array('images', 5), // ✅ CLOUDINARY
  productController.createProduct
);

router.put(
  '/:id',
  auth,
  upload.array('images', 5),
  productController.updateProduct
);

router.delete(
  '/:id',
  auth,
  productController.deleteProduct
);

module.exports = router;
