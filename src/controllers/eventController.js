const { catchAsync } = require('../middleware/errorHandler');
const sendResponse = require('../utils/response');
const eventService = require('../services/eventService');

const createEvent = catchAsync(async (req, res) => {
  const event = await eventService.createEvent(req.body, req.user._id);
  sendResponse(res, 201, true, { event }, 'Event created');
});

const getEvents = catchAsync(async (req, res) => {
  const result = await eventService.getEvents(req.query);
  sendResponse(res, 200, true, result, 'Events fetched');
});

const getEventById = catchAsync(async (req, res) => {
  const event = await eventService.getEventById(req.params.id);
  sendResponse(res, 200, true, { event }, 'Event fetched');
});

const updateEvent = catchAsync(async (req, res) => {
  const event = await eventService.updateEvent(req.params.id, req.body, req.user);
  sendResponse(res, 200, true, { event }, 'Event updated');
});

const deleteEvent = catchAsync(async (req, res) => {
  await eventService.deleteEvent(req.params.id, req.user);
  sendResponse(res, 200, true, null, 'Event deleted');
});

module.exports = { createEvent, getEvents, getEventById, updateEvent, deleteEvent };
