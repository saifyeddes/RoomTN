// Import des modules
const express = require('express');
const cors = require('cors');

// Création de l'application Express
const app = express();

// Configuration CORS
const corsOptions = {
  origin: [
    'https://roomtn.netlify.app',  // Votre frontend en production
    'http://localhost:5173'        // Pour le développement local
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Appliquez la configuration CORS
app.use(cors(corsOptions));

// Gestion des requêtes OPTIONS (pré-vol)
app.options('*', cors(corsOptions));

// Exemple de route
app.get('/', (req, res) => {
  res.send('Serveur opérationnel');
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
