const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, isApproved: user.isApproved },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Autoriser admin et super_admin; bloquer admin non approuvé
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    if (user.role === 'admin' && user.isApproved === false) {
      return res.status(403).json({ message: "Compte admin en attente d'approbation" });
    }

    // Générer le token JWT
    const token = generateToken(user);

    // Renvoyer la réponse
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
    console.error('Erreur de connexion:', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

exports.getCurrentUser = (req, res) => {
  res.json(req.user);
};
