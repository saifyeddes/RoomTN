const jwt = require('jsonwebtoken');

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ IDENTIFIANTS HARDCODÉS
    if (email !== 'admin@room.tn' || password !== 'admin@room.tn') {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // ✅ TOKEN SIMPLE
    const token = jwt.sign(
      { email: 'admin@room.tn', role: 'admin' },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      token,
      user: {
        email: 'admin@room.tn'
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};
