const express = require('express');
const { loginAdmin } = require('../controllers/authController');
const router = express.Router();

// ✅ LOGIN ADMIN
router.post('/admin/login', loginAdmin);

module.exports = router;
