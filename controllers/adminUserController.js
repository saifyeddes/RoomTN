const User = require('../models/User');

// List admins (visible to admin and super_admin)
exports.listAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: ['admin', 'super_admin'] } })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(admins);
  } catch (err) {
    console.error('listAdmins error', err);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Create admin (admin can create pending approval; super_admin creates approved)
exports.createAdmin = async (req, res) => {
  try {
    const { email, password, full_name, role } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Prevent creating another super_admin unless requester is super_admin
    let newRole = 'admin';
    let isApproved = false;
    if (req.user.role === 'super_admin') {
      newRole = role === 'super_admin' ? 'super_admin' : 'admin';
      isApproved = true;
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }

    const user = new User({ email, password, full_name, role: newRole, isApproved });
    await user.save();

    const { password: _pw, ...safe } = user.toObject();
    res.status(201).json(safe);
  } catch (err) {
    console.error('createAdmin error', err);
    if (err.name === 'ValidationError') {
      const firstKey = Object.keys(err.errors)[0];
      const msg = err.errors[firstKey]?.message || 'Données invalides';
      return res.status(400).json({ message: msg });
    }
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Update admin (admins can update limited fields; only super_admin can change role)
exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, full_name, role } = req.body;

    const update = {};
    if (email) update.email = email;
    if (full_name) update.full_name = full_name;

    // Only super_admin can change role or approval
    if (req.user.role === 'super_admin') {
      if (role) update.role = role === 'super_admin' ? 'super_admin' : 'admin';
      if (typeof req.body.isApproved === 'boolean') update.isApproved = req.body.isApproved;
    }

    const user = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    res.json(user);
  } catch (err) {
    console.error('updateAdmin error', err);
    if (err.name === 'ValidationError') {
      const firstKey = Object.keys(err.errors)[0];
      const msg = err.errors[firstKey]?.message || 'Données invalides';
      return res.status(400).json({ message: msg });
    }
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Approve admin (super_admin only)
exports.approveAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Autorisation requise: super_admin' });
    }
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { isApproved: true }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json(user);
  } catch (err) {
    console.error('approveAdmin error', err);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

// Delete admin (super_admin only; protect core super admin email)
exports.deleteAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Autorisation requise: super_admin' });
    }
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    // Prevent deleting the primary super admin account
    if (user.email === 'admin@room.tn' && user.role === 'super_admin') {
      return res.status(400).json({ message: 'Impossible de supprimer le super admin principal' });
    }

    await User.deleteOne({ _id: id });
    res.json({ message: 'Administrateur supprimé' });
  } catch (err) {
    console.error('deleteAdmin error', err);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};
