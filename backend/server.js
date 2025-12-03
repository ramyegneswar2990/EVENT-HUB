const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const seedAdmin = require('./utils/seedAdmin');
const seedEvents = require('./utils/seedEvents');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '.env') });

// Check critical env variables
if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI is missing in .env');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('Error: JWT_SECRET is missing in .env');
  process.exit(1);
}
if (!process.env.PAYPAL_CLIENT_ID) {
  console.error('Error: PAYPAL_CLIENT_ID is missing in .env');
  process.exit(1);
}
if (!process.env.PAYPAL_CLIENT_SECRET) {
  console.error('Error: PAYPAL_CLIENT_SECRET is missing in .env');
  process.exit(1);
}

// Connect to MongoDB
connectDB();

// Seed admin and sample events after DB is connected
mongoose.connection.once('open', async () => {
  console.log('MongoDB connected');
  await seedAdmin();
  await seedEvents();
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`PAYPAL_CLIENT_ID loaded: ${process.env.PAYPAL_CLIENT_ID ? 'Yes' : 'No'}`);
});
