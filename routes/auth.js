const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Route de connexion
router.post('/login', authController.login);

// Route protégée pour obtenir les informations de l'utilisateur connecté
router.get('/me', auth, authController.getCurrentUser);

module.exports = router;
