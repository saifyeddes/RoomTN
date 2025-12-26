const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');

router.get('/', productController.getAllProducts);
router.get('/best', productController.getBestSellers);
router.get('/:id', productController.getProductById);

router.put('/:id', auth, productController.uploadImages, productController.updateProduct);
router.delete('/:id', auth, productController.deleteProduct);

module.exports = router;
