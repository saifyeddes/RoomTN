const Order = require('../models/Order');
const Product = require('../models/Product');

exports.getStats = async (req, res) => {
  try {
    const [ordersCount, productsCount, revenueAgg] = await Promise.all([
      Order.countDocuments({}),
      Product.countDocuments({}),
      Order.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$total_amount' } } },
      ]),
    ]);

    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    res.json({
      ordersCount,
      productsCount,
      totalRevenue,
    });
  } catch (err) {
    console.error('adminStats.getStats error', err);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};
