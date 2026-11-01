const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const hash = process.env.OPERATOR_PASSWORD_HASH;
    if (!hash) {
      // Dev mode: accept 'admin' as password if no hash set
      if (password !== 'admin') {
        return res.status(401).json({ error: 'Invalid password' });
      }
    } else {
      const valid = await bcrypt.compare(password, hash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid password' });
      }
    }

    const token = jwt.sign(
      { role: 'operator' },
      process.env.JWT_SECRET || 'dev-secret-change-in-production',
      { expiresIn: '30d' }
    );

    res.json({ token, message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/verify
router.post('/verify', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false });
  }
  try {
    const token = auth.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-in-production');
    res.json({ valid: true });
  } catch {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;
