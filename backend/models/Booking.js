const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  tickets: {
    type: Number,
    required: [true, 'Please specify number of tickets'],
    min: 1,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  bookingType: {
    type: String,
    enum: ['regular', 'complimentary', 'vip'],
    default: 'regular',
  },
  paymentIntentId: {
    type: String,
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  reminderSent: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Booking', bookingSchema);

