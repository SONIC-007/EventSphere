const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

// Run this after an array of express-validator checks in a route
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg)
      .join(', ');
    return next(new AppError(message, 400));
  }
  next();
};

module.exports = validate;
