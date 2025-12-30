const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload'); // ✅ IMPORT MANQUANT

router.get('/', productController.getAllProducts);
router.get('/best', productController.getBestSellers);
router.get('/:id', productController.getProductById);

// ✅ CREATE
router.post(
  '/',
  auth,
  upload.array('images', 5),
  productController.createProduct
);

// ✅ UPDATE
router.put(
  '/:id',
  auth,
  upload.array('images', 5),
  productController.updateProduct
);

router.delete('/:id', auth, productController.deleteProduct);

module.exports = router;
