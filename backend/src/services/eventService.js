const Event = require('../models/Event');
const Organization = require('../models/Organization');
const Registration = require('../models/Registration');
const { AppError } = require('../middleware/errorHandler');

const createEvent = async (data, userId) => {
  const org = await Organization.findById(data.orgId);
  if (!org) throw new AppError('Organization not found.', 404);

  const event = await Event.create({ ...data, createdBy: userId });
  return event;
};

const getEvents = async (filters) => {
  const query = {};
  if (filters.category) query.category = filters.category;
  if (filters.status) query.status = filters.status;
  else query.status = 'published'; // public browsing defaults to published only
  if (filters.orgId) query.orgId = filters.orgId;
  if (filters.createdBy) query.createdBy = filters.createdBy;
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { venue: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const [events, total] = await Promise.all([
    Event.find(query).sort({ date: 1 }).skip(skip).limit(limit).populate('orgId', 'name'),
    Event.countDocuments(query),
  ]);

  return { events, total, page, pages: Math.ceil(total / limit) };
};

const getEventStats = async () => {
  const [totalEvents, totalOrgs, totalRegistrations] = await Promise.all([
    Event.countDocuments({ status: 'published' }),
    Organization.countDocuments(),
    Registration.countDocuments({ status: { $ne: 'cancelled' } }),
  ]);
  return { totalEvents, totalOrgs, totalRegistrations };
};

const getEventById = async (id) => {
  const event = await Event.findById(id).populate('orgId', 'name').populate('createdBy', 'name email');
  if (!event) throw new AppError('Event not found.', 404);
  return event;
};

const updateEvent = async (id, updates, requestingUser) => {
  const event = await Event.findById(id);
  if (!event) throw new AppError('Event not found.', 404);

  // Organizer can only edit events they created; admin can edit any
  if (requestingUser.role !== 'admin' && String(event.createdBy) !== String(requestingUser._id)) {
    throw new AppError('You can only edit your own events.', 403);
  }

  Object.assign(event, updates);
  await event.save();
  return event;
};

const deleteEvent = async (id, requestingUser) => {
  const event = await Event.findById(id);
  if (!event) throw new AppError('Event not found.', 404);

  if (requestingUser.role !== 'admin' && String(event.createdBy) !== String(requestingUser._id)) {
    throw new AppError('You can only delete your own events.', 403);
  }

  await event.deleteOne();
};

module.exports = { createEvent, getEvents, getEventStats, getEventById, updateEvent, deleteEvent };

