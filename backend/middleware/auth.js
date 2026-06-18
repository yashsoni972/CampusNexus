const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Token is invalid. User not found.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated. Contact admin.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please login again.' });
    }
    return res.status(500).json({ message: 'Server error during authentication.' });
  }
};

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`
      });
    }
    next();
  };
};

// Check if user owns the resource or is admin/faculty
const ownerOrAdmin = (resourceUserField = 'submittedBy') => {
  return (req, res, next) => {
    const resource = req.resource;
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    const isOwner = resource[resourceUserField]?.toString() === req.user._id.toString();
    const isAdminOrFaculty = ['admin', 'faculty'].includes(req.user.role);

    if (!isOwner && !isAdminOrFaculty) {
      return res.status(403).json({ message: 'Access denied. You can only access your own resources.' });
    }
    next();
  };
};

module.exports = { protect, authorize, ownerOrAdmin };
