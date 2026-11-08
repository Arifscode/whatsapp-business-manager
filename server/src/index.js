require('dotenv').config();
const express = require('express');
const cors = require('cors');
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Public routes (no auth required) ───────────────────────────────────────
app.use('/api/health', require('./routes/health'));
app.use('/api/auth', require('./routes/auth'));

// Public order submission — customers use this without logging in
app.use('/api/orders/public', require('./routes/orders').publicRouter);

// ─── Protected routes (JWT required) ────────────────────────────────────────
app.use('/api/products',   auth, require('./routes/products'));
app.use('/api/orders',     auth, require('./routes/orders').protectedRouter);
app.use('/api/packaging',  auth, require('./routes/packaging'));
app.use('/api/dispatch',   auth, require('./routes/dispatch'));
app.use('/api/financials', auth, require('./routes/financials'));
app.use('/api/expenses',   auth, require('./routes/expenses'));
app.use('/api/upload',     auth, require('./routes/upload'));

// ─── 404 handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Error handler ──────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ─── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`   Public order form API: /api/orders/public`);
  console.log(`   Protected API requires Bearer token`);
});

module.exports = app;
