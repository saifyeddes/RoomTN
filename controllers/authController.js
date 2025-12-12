const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, isApproved: user.isApproved },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    // Autoriser uniquement admin et super_admin
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
    }

    // Vérifier si admin approuvé
    if (user.role === 'admin' && !user.isApproved) {
      return res.status(403).json({ message: "Compte admin en attente d'approbation" });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        isApproved: user.isApproved
      }
    });

  } catch (error) {
    console.error('Erreur login admin:', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};


exports.getCurrentUser = (req, res) => {
  res.json(req.user);
};
