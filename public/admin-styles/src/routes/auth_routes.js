const express = require('express');
const router = express.Router();
const authController = require('../controller/auth_controller');
const authenticateToken = require('../routes/auth_routes');

// Login route
router.post('/login', authController.login);

// Protected route
router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Protected route accessed successfully' });
});

module.exports = router;
