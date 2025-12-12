require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "roomtn"
    });

    console.log('Connecté à MongoDB');

    let admin = await User.findOne({ email: 'admin@room.tn' });

    if (admin) {
      admin.role = 'super_admin';
      admin.isApproved = true;

      // Si tu veux réinitialiser le mot de passe à "admin@room.tn"
      admin.password = 'admin@room.tn'; // sera hashé automatiquement par pre-save
      await admin.save();

      console.log('Admin existant mis à jour : rôle super_admin et mot de passe hashé.');
    } else {
      const newAdmin = new User({
        email: 'admin@room.tn',
        password: 'admin@room.tn',
        full_name: 'Super Administrateur',
        role: 'super_admin',
        isApproved: true
      });
      await newAdmin.save();
      console.log('Admin créé avec succès.');
    }

  } catch (error) {
    console.error('Erreur lors de la création/mise à jour de l\'admin :', error);
  }
};

createAdmin();
