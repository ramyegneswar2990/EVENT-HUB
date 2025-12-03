const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { protect, admin } = require('../middleware/auth');

// Validation rules
const eventValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category')
    .isIn(['concert', 'conference', 'workshop', 'sports', 'theater', 'other'])
    .withMessage('Invalid category'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').trim().notEmpty().withMessage('Time is required'),
  body('venue').trim().notEmpty().withMessage('Venue is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('totalTickets')
    .isInt({ min: 1 })
    .withMessage('Total tickets must be at least 1'),
  body('availableTickets')
    .isInt({ min: 0 })
    .withMessage('Available tickets cannot be negative'),
];

router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/', protect, admin, eventValidation, createEvent);
router.put('/:id', protect, admin, eventValidation, updateEvent);
router.delete('/:id', protect, admin, deleteEvent);

module.exports = router;

