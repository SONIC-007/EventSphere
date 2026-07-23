/**
 * CSRF Protection Middleware
 * Protects state-changing API endpoints from Cross-Site Request Forgery.
 */
const csrfProtection = (req, res, next) => {
  // Safe HTTP methods do not modify server state
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Require Authorization header or X-Requested-With custom header for state-changing requests
  const hasAuthHeader = req.headers['authorization'];
  const hasCustomHeader = req.headers['x-requested-with'];
  
  if (!hasAuthHeader && !hasCustomHeader && req.headers['origin']) {
    const origin = req.headers['origin'];
    const host = req.headers['host'];
    if (origin && !origin.includes(host)) {
      return res.status(403).json({
        status: 'error',
        message: 'CSRF validation failed: Invalid cross-origin request',
      });
    }
  }

  next();
};

module.exports = csrfProtection;
