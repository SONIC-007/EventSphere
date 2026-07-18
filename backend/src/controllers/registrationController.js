const { catchAsync } = require('../middleware/errorHandler');
const sendResponse = require('../utils/response');
const registrationService = require('../services/registrationService');

const register = catchAsync(async (req, res) => {
  const registration = await registrationService.registerForEvent(
    req.user._id,
    req.params.eventId
  );
  const message =
    registration.status === 'waitlisted'
      ? 'Event is full - you have been waitlisted'
      : 'Registered successfully';
  sendResponse(res, 201, true, { registration }, message);
});

const cancel = catchAsync(async (req, res) => {
  const registration = await registrationService.cancelRegistration(
    req.user._id,
    req.params.eventId
  );
  sendResponse(res, 200, true, { registration }, 'Registration cancelled');
});

const getEventRegistrations = catchAsync(async (req, res) => {
  const registrations = await registrationService.getEventRegistrations(
    req.params.eventId,
    req.query
  );
  sendResponse(res, 200, true, { registrations }, 'Registrations fetched');
});

const getMyRegistrations = catchAsync(async (req, res) => {
  const registrations = await registrationService.getMyRegistrations(req.user._id);
  sendResponse(res, 200, true, { registrations }, 'Your registrations fetched');
});

const markAttendance = catchAsync(async (req, res) => {
  const registration = await registrationService.markAttendance(
    req.params.eventId,
    req.params.userId
  );
  sendResponse(res, 200, true, { registration }, 'Attendance marked');
});

module.exports = { register, cancel, getEventRegistrations, getMyRegistrations, markAttendance };
