const { catchAsync } = require('../middleware/errorHandler');
const sendResponse = require('../utils/response');
const feedbackService = require('../services/feedbackService');

const submitFeedback = catchAsync(async (req, res) => {
  const feedback = await feedbackService.submitFeedback(
    req.user._id,
    req.params.eventId,
    req.body
  );
  sendResponse(res, 201, true, { feedback }, 'Feedback submitted');
});

const getEventFeedback = catchAsync(async (req, res) => {
  const result = await feedbackService.getEventFeedback(req.params.eventId);
  sendResponse(res, 200, true, result, 'Feedback fetched');
});

module.exports = { submitFeedback, getEventFeedback };
