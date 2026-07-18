const { catchAsync } = require('../middleware/errorHandler');
const sendResponse = require('../utils/response');
const authService = require('../services/authService');

const signup = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.signup(req.body);
  sendResponse(
    res,
    201,
    true,
    {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    },
    'Signup successful'
  );
});

const login = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  sendResponse(
    res,
    200,
    true,
    {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    },
    'Login successful'
  );
});

const getMe = catchAsync(async (req, res) => {
  sendResponse(res, 200, true, { user: req.user }, 'Current user fetched');
});

module.exports = { signup, login, getMe };
