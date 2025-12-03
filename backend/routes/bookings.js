const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

// Validation rules
const bookingValidation = [
  body('eventId')
    .notEmpty()
    .withMessage('Event ID is required')
    .isMongoId()
    .withMessage('Invalid event ID'),
  body('tickets')
    .isInt({ min: 1 })
    .withMessage('Tickets must be at least 1'),
];

const complimentaryBookingValidation = [
  ...bookingValidation,
  body('userEmail')
    .isEmail()
    .withMessage('Valid email is required'),
];

router.use(protect);

router.get('/', getBookings);
router.get('/:id', getBooking);
router.post('/', bookingValidation, createBooking);
router.post('/admin/complimentary', authorize('admin'), complimentaryBookingValidation, require('../controllers/bookingController').createComplimentaryBooking);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);

module.exports = router;

