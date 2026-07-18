const express = require('express');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');
const {
  register,
  cancel,
  getEventRegistrations,
  getMyRegistrations,
  markAttendance,
} = require('../controllers/registrationController');

const router = express.Router();

router.post('/:eventId/register', protect, register);
router.patch('/:eventId/cancel', protect, cancel);
router.get('/me', protect, getMyRegistrations);

// Organizer/admin views registrations for one of their events
router.get('/:eventId', protect, restrictTo('organizer', 'admin'), getEventRegistrations);
router.patch(
  '/:eventId/attendance/:userId',
  protect,
  restrictTo('organizer', 'admin'),
  markAttendance
);

module.exports = router;
