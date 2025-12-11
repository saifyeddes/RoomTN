const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Récupérer le token du header Authorization
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Aucun token fourni' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier le rôle admin ou super_admin
    if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    // Si l'utilisateur n'est pas approuvé (pourrait arriver si on encode isApproved dans le token)
    if (decoded.role === 'admin' && decoded.isApproved === false) {
      return res.status(403).json({ message: "Compte admin en attente d'approbation" });
    }
    
    // Ajouter les informations de l'utilisateur à la requête
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};
