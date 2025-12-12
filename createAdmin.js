require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const createAdmin = async () => {
  try {
    // Connexion à MongoDB sur la base "roomtn"
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "roomtn"
    });

    console.log('Connecté à MongoDB');

    // Chercher l'admin existant
    let admin = await User.findOne({ email: 'admin@room.tn' });

    if (admin) {
      // Mettre à jour le rôle et approuver
      admin.role = 'super_admin';
      admin.isApproved = true;

      // Si tu veux réinitialiser le mot de passe à "admin@room.tn" :
      admin.password = await bcrypt.hash('admin@room.tn', 10);

      await admin.save();
      console.log('Admin existant mis à jour : rôle super_admin et mot de passe hashé.');
    } else {
      // Créer l'admin si jamais il n'existe pas
      admin = new User({
        email: 'admin@room.tn',
        password: await bcrypt.hash('admin@room.tn', 10),
        full_name: 'Super Administrateur',
        role: 'super_admin',
        isApproved: true
      });
      await admin.save();
      console.log('Admin créé avec succès.');
    }

  } catch (error) {
    console.error('Erreur lors de la mise à jour/création de l\'admin :', error);
  }
};

createAdmin();
