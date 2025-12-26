const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// =======================
// 🔌 MONGODB CONNECTION
// =======================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connecté');
  })
  .catch((err) => {
    console.error('❌ MongoDB connexion échouée:', err);
  });

// =======================
// 🧱 MIDDLEWARES
// =======================
app.use(express.json());

app.use(cors({
  origin: [
    'https://tnroom.netlify.app',
    'http://localhost:5173',
  ],
  credentials: true,
}));

// =======================
// 📂 STATIC FILES
// =======================
app.use('/uploads', express.static('uploads'));

// =======================
// 🚏 ROUTES
// =======================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api', require('./routes/adminStats'));

// =======================
// 🧪 TEST
// =======================
app.get('/', (req, res) => {
  res.send('Backend RoomTN OK');
});

// =======================
// 🚀 START SERVER
// =======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
