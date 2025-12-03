const Event = require('../models/Event');
const { validationResult } = require('express-validator');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
      ];
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: events,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Private/Admin
exports.createEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Add user to req.body
    req.body.createdBy = req.user.id;

    const event = await Event.create(req.body);

    // Send email notifications to all users about the new event
    const User = require('../models/User');
    const sendEmail = require('../utils/sendEmail');

    try {
      // Get all users (excluding admin)
      const users = await User.find({ role: { $ne: 'admin' } });

      // Send email to each user
      const emailPromises = users.map(user =>
        sendEmail({
          email: user.email,
          subject: `New Event: ${event.title}`,
          message: `
            <h2>New Event Added!</h2>
            <p>Dear ${user.name},</p>
            <p>A new event has been added to our platform:</p>
            <h3>${event.title}</h3>
            <p>${event.description}</p>
            <p><strong>Event Details:</strong></p>
            <ul>
              <li>Date: ${new Date(event.date).toLocaleDateString()}</li>
              <li>Time: ${event.time}</li>
              <li>Venue: ${event.venue}</li>
              <li>Location: ${event.location}</li>
              <li>Price: $${event.price} per ticket</li>
              <li>Available Tickets: ${event.availableTickets}</li>
            </ul>
            <p>Visit our website to book your tickets now!</p>
          `,
        })
      );

      // Send all emails (don't wait for completion to avoid blocking the response)
      Promise.all(emailPromises).catch(err => {
        console.error('Some emails failed to send:', err);
      });

      console.log(`New event created. Sending notifications to ${users.length} users.`);
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Make sure user is event creator or admin
    if (
      event.createdBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Make sure user is event creator or admin
    if (
      event.createdBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
