const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an event title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['concert', 'conference', 'workshop', 'sports', 'theater', 'other'],
  },
  date: {
    type: Date,
    required: [true, 'Please add an event date'],
  },
  time: {
    type: String,
    required: [true, 'Please add an event time'],
  },
  venue: {
    type: String,
    required: [true, 'Please add a venue'],
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: 0,
  },
  totalTickets: {
    type: Number,
    required: [true, 'Please add total tickets'],
    min: 1,
  },
  availableTickets: {
    type: Number,
    required: [true, 'Please add available tickets'],
    min: 0,
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/400x300',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Update available tickets when bookings are made
eventSchema.methods.updateAvailability = async function (ticketsBooked) {
  this.availableTickets -= ticketsBooked;
  if (this.availableTickets < 0) {
    this.availableTickets = 0;
  }
  await this.save();
};

module.exports = mongoose.model('Event', eventSchema);

