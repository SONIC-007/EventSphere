const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const { errorHandler, AppError } = require('./middleware/errorHandler');
const sendResponse = require('./utils/response');

const authRoutes = require('./routes/authRoutes');
const orgRoutes = require('./routes/orgRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

const app = express();

const publicAuthPaths = new Set(['/api/auth/signup', '/api/auth/login']);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// CSRF Protection Middleware
const csrfProtection = csurf({ cookie: { httpOnly: true, sameSite: 'strict' }, value: (req) => req.headers['x-csrf-token'] || req.headers['authorization'] });

app.use((req, res, next) => {
  if (
    ['GET', 'HEAD', 'OPTIONS'].includes(req.method) ||
    req.headers['authorization'] ||
    publicAuthPaths.has(req.path)
  ) {
    return next();
  }
  csrfProtection(req, res, next);
});



// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', '..', 'Frontend')));

app.get('/api/health', (req, res) => {
  sendResponse(res, 200, true, { status: 'ok' }, 'Server is healthy');
});

app.use('/api/auth', authRoutes);
app.use('/api/organizations', orgRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/feedback', feedbackRoutes);

// Any request that didn't match a route above
app.all('/{*splat}', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorHandler); // must be last

module.exports = app;
