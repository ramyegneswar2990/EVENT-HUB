const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { validationResult } = require('express-validator');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res, next) => {
  try {
    let query = {};

    // If user is not admin, only show their bookings
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .populate('event')
      .sort({ bookingDate: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('event');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Make sure user is booking owner or admin
    if (
      booking.user._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventId, tickets } = req.body;

    // Get event
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check availability
    if (event.availableTickets < tickets) {
      return res.status(400).json({
        message: `Only ${event.availableTickets} tickets available`,
      });
    }

    // Calculate total amount
    const totalAmount = event.price * tickets;

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      event: eventId,
      tickets,
      totalAmount,
      paymentStatus: 'pending',
    });

    // Send pending payment email
    const user = await require('../models/User').findById(req.user.id);
    const sendEmail = require('../utils/sendEmail');

    try {
      await sendEmail({
        email: user.email,
        subject: 'Complete Your Booking Payment',
        message: `
          <h2>Booking Created - Payment Pending</h2>
          <p>Dear ${user.name},</p>
          <p>You have successfully reserved tickets for <strong>${event.title}</strong>.</p>
          <p><strong>To confirm your booking, please complete the payment.</strong></p>
          <p><strong>Details:</strong></p>
          <ul>
            <li>Event: ${event.title}</li>
            <li>Date: ${new Date(event.date).toLocaleDateString()}</li>
            <li>Tickets: ${tickets}</li>
            <li>Total Amount: $${totalAmount}</li>
          </ul>
          <p>Please return to the application to complete your payment.</p>
        `,
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Make sure user is booking owner or admin
    if (
      booking.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('user', 'name email')
      .populate('event');

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Make sure user is booking owner or admin
    if (
      booking.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // If payment completed, refund tickets
    if (booking.paymentStatus === 'completed') {
      const event = await Event.findById(booking.event);
      event.availableTickets += booking.tickets;
      await event.save();
    }

    await booking.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Booking deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Create complimentary booking (Admin only - for VIPs, no payment required)
// @route   POST /api/bookings/admin/complimentary
// @access  Private/Admin
exports.createComplimentaryBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventId, tickets, userEmail, bookingType = 'complimentary' } = req.body;

    // Get event
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check availability
    if (event.availableTickets < tickets) {
      return res.status(400).json({
        message: `Only ${event.availableTickets} tickets available`,
      });
    }

    // Find user by email
    const User = require('../models/User');
    let user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({
        message: 'User not found. Please ask them to register first.'
      });
    }

    // Calculate total amount (even though it's complimentary, we record the value)
    const totalAmount = event.price * tickets;

    // Create complimentary booking
    const booking = await Booking.create({
      user: user._id,
      event: eventId,
      tickets,
      totalAmount,
      paymentStatus: 'completed', // Complimentary bookings are auto-approved
      bookingType: bookingType, // 'complimentary' or 'vip'
    });

    // Update event availability
    await event.updateAvailability(tickets);

    // Send confirmation email
    const sendEmail = require('../utils/sendEmail');

    try {
      await sendEmail({
        email: user.email,
        subject: 'VIP/Complimentary Booking Confirmed',
        message: `
          <h2>Complimentary Booking Confirmed!</h2>
          <p>Dear ${user.name},</p>
          <p>You have been granted complimentary/VIP access to <strong>${event.title}</strong>.</p>
          <p><strong>Details:</strong></p>
          <ul>
            <li>Event: ${event.title}</li>
            <li>Date: ${new Date(event.date).toLocaleDateString()}</li>
            <li>Time: ${event.time}</li>
            <li>Venue: ${event.venue}</li>
            <li>Location: ${event.location}</li>
            <li>Tickets: ${tickets}</li>
            <li>Type: ${bookingType.toUpperCase()}</li>
          </ul>
          <p>No payment is required. See you at the event!</p>
        `,
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Complimentary booking created successfully',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
