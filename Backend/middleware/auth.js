const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access Denied: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Check if server key matches
    if (decoded.serverKey !== global.serverKey) {
      console.log('Token invalidated due to server restart for user:', decoded.id);
      return res.status(401).json({ message: 'Token invalidated due to server restart' });
    }
    req.user = decoded; // You’ll access this in routes like req.user._id
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(400).json({ message: 'Token validation error' });
  }
};

module.exports = protect ;
