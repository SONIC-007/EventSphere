const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');
const {
  createEvent,
  getEvents,
  getEventStats,
  getEventById,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');

const router = express.Router();

router.get('/', getEvents); // public
router.get('/stats', getEventStats); // public stats
router.get('/:id', getEventById); // public

router.post(
  '/',
  protect,
  restrictTo('organizer', 'admin'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('orgId').isMongoId().withMessage('Valid orgId is required'),
    body('venue').notEmpty().withMessage('Venue is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('registrationDeadline').isISO8601().withMessage('Valid registration deadline is required'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  ],
  validate,
  createEvent
);

router.patch('/:id', protect, restrictTo('organizer', 'admin'), updateEvent);
router.delete('/:id', protect, restrictTo('organizer', 'admin'), deleteEvent);

module.exports = router;
