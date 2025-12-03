const paypal = require('@paypal/checkout-server-sdk');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const sendEmail = require('../utils/sendEmail');

// Configure PayPal environment
const getPayPalClient = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'PayPal is not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env'
    );
  }

  const environment =
    process.env.NODE_ENV === 'production'
      ? new paypal.core.LiveEnvironment(clientId, clientSecret)
      : new paypal.core.SandboxEnvironment(clientId, clientSecret);

  return new paypal.core.PayPalHttpClient(environment);
};

// @desc    Create PayPal order for a booking
// @route   POST /api/payments/create-intent
// @access  Private
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('user', 'email name')
      .populate('event');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking
    if (booking.user._id.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Check if already paid
    if (booking.paymentStatus === 'completed') {
      return res.status(400).json({ message: 'Booking already paid' });
    }

    // Check availability again
    const event = await Event.findById(booking.event._id);
    if (event.availableTickets < booking.tickets) {
      return res.status(400).json({
        message: `Only ${event.availableTickets} tickets available`,
      });
    }

    const client = getPayPalClient();

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      application_context: {
        brand_name: 'Event Management System',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.FRONTEND_URL}/payment/success?bookingId=${bookingId}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel?bookingId=${bookingId}`,
      },
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: booking.totalAmount.toFixed(2),
          },
          description: `Booking for ${event.title}`,
        },
      ],
    });

    const order = await client.execute(request);

    // Extract the approval URL from the response
    const approvalUrl = order.result.links.find(
      (link) => link.rel === 'approve'
    ).href;

    res.status(200).json({
      success: true,
      orderId: order.result.id,
      approvalUrl: approvalUrl,
      booking,
    });
  } catch (error) {
    console.error('PayPal create order error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Capture PayPal order
// @route   POST /api/payments/confirm
// @access  Private
exports.confirmPayment = async (req, res, next) => {
  try {
    const { bookingId, paymentIntentId } = req.body; // paymentIntentId will be PayPal orderId

    const booking = await Booking.findById(bookingId)
      .populate('user', 'email name')
      .populate('event');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const client = getPayPalClient();

    const request = new paypal.orders.OrdersCaptureRequest(paymentIntentId);
    request.requestBody({});

    const capture = await client.execute(request);

    if (
      !capture.result ||
      (capture.result.status !== 'COMPLETED' &&
        capture.result.status !== 'APPROVED')
    ) {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    // Update booking
    booking.paymentStatus = 'completed';
    booking.paymentIntentId = paymentIntentId; // store PayPal order ID
    await booking.save();

    // Update event availability
    const event = await Event.findById(booking.event._id);
    await event.updateAvailability(booking.tickets);

    // Send confirmation email
    try {
      await sendEmail({
        email: booking.user.email,
        subject: 'Booking Confirmation',
        message: `
          <h2>Booking Confirmed!</h2>
          <p>Dear ${booking.user.name},</p>
          <p>Your booking for <strong>${event.title}</strong> has been confirmed.</p>
          <p><strong>Details:</strong></p>
          <ul>
            <li>Event: ${event.title}</li>
            <li>Date: ${new Date(event.date).toLocaleDateString()}</li>
            <li>Time: ${event.time}</li>
            <li>Venue: ${event.venue}</li>
            <li>Tickets: ${booking.tickets}</li>
            <li>Total Amount: $${booking.totalAmount}</li>
          </ul>
          <p>Thank you for your booking!</p>
        `,
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Payment confirmed',
      data: booking,
    });
  } catch (error) {
    console.error('PayPal capture error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send event reminder
// @route   POST /api/payments/send-reminder
// @access  Private/Admin
exports.sendReminder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('user', 'email name')
      .populate('event');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.paymentStatus !== 'completed') {
      return res.status(400).json({ message: 'Booking not paid' });
    }

    if (booking.reminderSent) {
      return res.status(400).json({ message: 'Reminder already sent' });
    }

    const event = booking.event;

    // Send reminder email
    await sendEmail({
      email: booking.user.email,
      subject: 'Event Reminder',
      message: `
        <h2>Event Reminder</h2>
        <p>Dear ${booking.user.name},</p>
        <p>This is a reminder that your event is coming up!</p>
        <p><strong>Event Details:</strong></p>
        <ul>
          <li>Event: ${event.title}</li>
          <li>Date: ${new Date(event.date).toLocaleDateString()}</li>
          <li>Time: ${event.time}</li>
          <li>Venue: ${event.venue}</li>
          <li>Location: ${event.location}</li>
          <li>Tickets: ${booking.tickets}</li>
        </ul>
        <p>We look forward to seeing you there!</p>
      `,
    });

    booking.reminderSent = true;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Reminder sent',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
