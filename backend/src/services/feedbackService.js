const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { AppError } = require('../middleware/errorHandler');

const submitFeedback = async (userId, eventId, { rating, comment }) => {
  const event = await Event.findById(eventId);
  if (!event) throw new AppError('Event not found.', 404);

  if (new Date() < event.date) {
    throw new AppError('Feedback can only be submitted after the event has taken place.', 400);
  }

  const registration = await Registration.findOne({ userId, eventId });
  if (!registration || registration.status !== 'attended') {
    throw new AppError('Only participants marked as attended can leave feedback.', 403);
  }

  const existing = await Feedback.findOne({ userId, eventId });
  if (existing) throw new AppError('You have already submitted feedback for this event.', 409);

  const feedback = await Feedback.create({ userId, eventId, rating, comment });
  return feedback;
};

const getEventFeedback = async (eventId) => {
  const feedback = await Feedback.find({ eventId }).populate('userId', 'name');

  const avgResult = await Feedback.aggregate([
    { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
    { $group: { _id: '$eventId', averageRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  return {
    feedback,
    averageRating: avgResult[0]?.averageRating || null,
    count: avgResult[0]?.count || 0,
  };
};

module.exports = { submitFeedback, getEventFeedback };
