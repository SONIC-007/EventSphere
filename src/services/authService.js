const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokens');

const signup = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already registered.', 409);

  // Only allow 'organizer' role at signup if you want open self-registration;
  // for stricter control you could force 'participant' here and have an
  // admin promote users to organizer separately.
  const user = await User.create({ name, email, password, role });

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  return { user, accessToken, refreshToken };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  return { user, accessToken, refreshToken };
};

module.exports = { signup, login };
