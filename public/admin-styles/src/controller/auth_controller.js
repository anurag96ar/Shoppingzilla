const jwt = require('jsonwebtoken');
const secretKey = 'your-secret-key';

// Login controller
const login = (req, res) => {
  // Perform authentication logic here
  const { username, password } = req.body;

  // Check if username and password are valid
  // Replace this with your own authentication logic
  if (username === 'admin' && password === 'password') {
    // Generate a token
    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });

    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
};

module.exports = {
  login,
};
