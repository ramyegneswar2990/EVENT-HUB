const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createPaymentIntent,
  confirmPayment,
  sendReminder,
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/auth');

// Validation rules
const paymentValidation = [
  body('bookingId')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isMongoId()
    .withMessage('Invalid booking ID'),
];

router.use(protect);

router.post('/create-intent', paymentValidation, createPaymentIntent);
router.post('/confirm', paymentValidation, confirmPayment);
router.post('/send-reminder', admin, paymentValidation, sendReminder);

module.exports = router;

