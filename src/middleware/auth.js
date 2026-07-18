const jwt = require('jsonwebtoken');
const { AppError, catchAsync } = require('./errorHandler');
const User = require('../models/User');

// Verifies the access token and attaches the user to req.user
const protect = catchAsync(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authenticated. Please log in.', 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError('Invalid or expired token.', 401));
  }

  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    return next(new AppError('User belonging to this token no longer exists.', 401));
  }

  req.user = user;
  next();
});

module.exports = { protect };
