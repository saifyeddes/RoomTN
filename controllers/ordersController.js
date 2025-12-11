const Order = require('../models/Order');
const PDFDocument = require('pdfkit');

// POST /api/orders
exports.create = async (req, res) => {
  try {
    const {
      user_email,
      user_full_name,
      items,
      shipping_address,
      phone,
    } = req.body;

    if (!user_email || !user_full_name || !shipping_address || !phone) {
      return res.status(400).json({ message: 'Champs requis manquants (nom, email, téléphone, adresse)' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Aucun article dans la commande' });
    }

    for (const it of items) {
      if (!it || !it.product_id || !it.name) {
        return res.status(400).json({ message: 'Article invalide: product_id et name requis' });
      }
      if (Number.isNaN(Number(it.price)) || Number.isNaN(Number(it.quantity))) {
        return res.status(400).json({ message: 'Article invalide: price et quantity doivent être numériques' });
      }
    }

    const total_amount = items.reduce((sum, it) => sum + (Number(it.price) * Number(it.quantity)), 0);

    const order = await Order.create({
      user_email,
      user_full_name,
      items: items.map(it => ({
        product_id: it.product_id,
        name: it.name,
        size: (it.size && String(it.size).trim()) ? it.size : 'Standard',
        color: (it.color && String(it.color).trim()) ? it.color : 'N/A',
        quantity: Number(it.quantity) || 1,
        price: Number(it.price) || 0,
      })),
      total_amount,
      shipping_address,
      phone,
      status: 'pending',
    });

    res.status(201).json(order);
  } catch (err) {
    console.error('orders.create error', err);
    const msg = err?.message || 'Erreur du serveur';
    res.status(500).json({ message: msg });
  }
};

// GET /api/orders
exports.list = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('orders.list error', err);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// POST /api/orders/:id/approve
exports.approve = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndUpdate(
      id,
      { status: 'approved' },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Commande introuvable' });
    res.json(order);
  } catch (err) {
    console.error('orders.approve error', err);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// POST /api/orders/:id/reject
exports.reject = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndUpdate(
      id,
      { status: 'rejected' },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Commande introuvable' });
    res.json(order);
  } catch (err) {
    console.error('orders.reject error', err);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// GET /api/orders/:id/pdf
exports.pdf = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Commande introuvable' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=order_${order._id}.pdf`);

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    doc.fontSize(20).text('Facture / Commande', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Commande: ${order._id}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
    doc.text(`Client: ${order.user_full_name} <${order.user_email}>`);
    doc.text(`Téléphone: ${order.phone}`);
    doc.text(`Adresse: ${order.shipping_address}`);
    doc.text(`Statut: ${order.status}`);
    doc.moveDown();

    doc.fontSize(14).text('Articles:');
    doc.moveDown(0.5);
    order.items.forEach((it, idx) => {
      doc.fontSize(12).text(
        `${idx + 1}. ${it.name} - Taille: ${it.size}, Couleur: ${it.color}, Qté: ${it.quantity}, Prix: ${it.price.toFixed(3)} TND`
      );
    });
    doc.moveDown();
    doc.fontSize(14).text(`Total: ${order.total_amount.toFixed(3)} TND`, { align: 'right' });

    doc.end();
  } catch (err) {
    console.error('orders.pdf error', err);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// DELETE /api/orders/:id
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return res.status(404).json({ message: 'Commande introuvable' });
    }
    res.json({ message: 'Commande supprimée avec succès' });
  } catch (err) {
    console.error('orders.delete error', err);
    res.status(500).json({ message: 'Erreur lors de la suppression de la commande' });
  }
};
