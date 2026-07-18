const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { submitFeedback, getEventFeedback } = require('../controllers/feedbackController');

const router = express.Router();

router.post(
  '/:eventId',
  protect,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isLength({ max: 1000 }).withMessage('Comment too long'),
  ],
  validate,
  submitFeedback
);

router.get('/:eventId', getEventFeedback); // public - so anyone can see event ratings

module.exports = router;
