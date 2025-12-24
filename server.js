const express = require('express');
const cors = require('cors');

const app = express();

// ✅ OBLIGATOIRE
app.use(express.json());

// ✅ CORS
app.use(cors({
  origin: [
    'https://tnroom.netlify.app',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


// ✅ ROUTES
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// ✅ TEST
app.get('/', (req, res) => {
  res.send('Backend RoomTN OK');
});

// ✅ START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
