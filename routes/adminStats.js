const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/adminStatsController');

// protect
router.use(auth);

router.get('/', ctrl.getStats);

module.exports = router;
