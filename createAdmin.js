const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');

    const admin = await User.create({
      email: 'admin@room.tn',
      password: 'admin@room.tn',
      full_name: 'Admin RoomTN'
    });

    console.log('ADMIN CRÉÉ AVEC SUCCÈS');
    console.log(admin.email);

    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
