const express = require('express');
const { loginAdmin } = require('../controllers/authController');
const router = express.Router();

// Login admin uniquement
router.post('/admin/login', loginAdmin);

module.exports = router;
