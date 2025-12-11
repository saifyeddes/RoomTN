const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/ordersController');

// Public: create order from storefront
router.post('/', ctrl.create);

// Protected: list/manage orders and PDF
router.use(auth);
router.get('/', ctrl.list);
router.post('/:id/approve', ctrl.approve);
router.post('/:id/reject', ctrl.reject);
router.get('/:id/pdf', ctrl.pdf);
router.delete('/:id', ctrl.delete);

module.exports = router;
