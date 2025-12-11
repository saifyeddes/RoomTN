const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/adminUserController');

// Protect all admin user routes
router.use(auth);

// List admins
router.get('/', ctrl.listAdmins);

// Create admin (admin or super_admin). Admin-created is pending approval.
router.post('/', ctrl.createAdmin);

// Update admin (limited for admin, extended for super_admin)
router.put('/:id', ctrl.updateAdmin);

// Approve admin (super_admin only)
router.post('/:id/approve', ctrl.approveAdmin);

// Delete admin (super_admin only via controller check)
router.delete('/:id', ctrl.deleteAdmin);

module.exports = router;
