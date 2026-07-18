const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { AppError } = require('../middleware/errorHandler');

const registerForEvent = async (userId, eventId) => {
  const event = await Event.findById(eventId);
  if (!event) throw new AppError('Event not found.', 404);
  if (event.status !== 'published') throw new AppError('Event is not open for registration.', 400);
  if (new Date() > event.registrationDeadline) {
    throw new AppError('Registration deadline has passed.', 400);
  }

  // Prevent duplicate registration up front (the unique index is the real
  // guarantee, this just gives a cleaner error message than a raw 11000)
  const existing = await Registration.findOne({ userId, eventId });
  if (existing && existing.status !== 'cancelled') {
    throw new AppError('You are already registered for this event.', 409);
  }

  const registeredCount = await Registration.countDocuments({
    eventId,
    status: { $in: ['registered', 'attended'] },
  });

  const status = registeredCount < event.capacity ? 'registered' : 'waitlisted';

  // If they'd previously cancelled, flip that record instead of creating a new one
  if (existing) {
    existing.status = status;
    await existing.save();
    return existing;
  }

  const registration = await Registration.create({ userId, eventId, status });
  return registration;
};

const cancelRegistration = async (userId, eventId) => {
  const registration = await Registration.findOne({ userId, eventId });
  if (!registration) throw new AppError('Registration not found.', 404);

  registration.status = 'cancelled';
  await registration.save();

  // Promote the earliest waitlisted person into the freed spot
  const nextWaitlisted = await Registration.findOne({
    eventId,
    status: 'waitlisted',
  }).sort({ createdAt: 1 });

  if (nextWaitlisted) {
    nextWaitlisted.status = 'registered';
    await nextWaitlisted.save();
  }

  return registration;
};

const getEventRegistrations = async (eventId, filters = {}) => {
  const query = { eventId };
  if (filters.status) query.status = filters.status;
  return Registration.find(query).populate('userId', 'name email');
};

const getMyRegistrations = async (userId) => {
  return Registration.find({ userId }).populate('eventId');
};

const markAttendance = async (eventId, userId) => {
  const registration = await Registration.findOne({ eventId, userId });
  if (!registration) throw new AppError('Registration not found.', 404);
  if (registration.status !== 'registered') {
    throw new AppError('Only registered (non-waitlisted) users can be marked attended.', 400);
  }
  registration.status = 'attended';
  await registration.save();
  return registration;
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getEventRegistrations,
  getMyRegistrations,
  markAttendance,
};
