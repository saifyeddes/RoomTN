const express = require('express');
const cors = require('cors');

const app = express();

// ✅ JSON
app.use(express.json());

// ✅ CORS
app.use(cors({
  origin: [
    'https://tnroom.netlify.app',
    'http://localhost:5173'
  ],
  credentials: true,
}));

// ✅ STATIC (images)
app.use('/uploads', express.static('uploads'));

// ✅ ROUTES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api', require('./routes/adminStats'));

// ✅ TEST
app.get('/', (req, res) => {
  res.send('Backend RoomTN OK');
});

// ✅ START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
