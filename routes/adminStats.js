const express = require('express');
const router = express.Router();

router.get('/admin/stats', async (req, res) => {
  res.json({
    ordersCount: 0,
    productsCount: 0,
    totalRevenue: 0,
  });
});

module.exports = router;
