const jwt = require('jsonwebtoken');

const requireSuperAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(403).json({ error: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!decoded.isSuperAdmin) {
      return res.status(403).json({ error: 'Access denied, superAdmin role required' });
    }

    // User has superAdmin access, proceed to next
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = requireSuperAdmin;
