# Backend Startup Guide

## ✅ Backend Setup Complete!

All backend logic has been implemented and verified. Here's what's ready:

### 📁 Project Structure
```
backend/
├── config/
│   └── db.js              ✓ MongoDB connection
├── controllers/
│   ├── authController.js   ✓ Authentication logic
│   ├── eventController.js  ✓ Event CRUD operations
│   ├── bookingController.js ✓ Booking management
│   └── paymentController.js ✓ Payment processing
├── middleware/
│   ├── auth.js            ✓ JWT authentication
│   └── errorHandler.js    ✓ Error handling
├── models/
│   ├── User.js            ✓ User schema
│   ├── Event.js           ✓ Event schema
│   └── Booking.js         ✓ Booking schema
├── routes/
│   ├── auth.js            ✓ Auth routes
│   ├── events.js          ✓ Event routes
│   ├── bookings.js        ✓ Booking routes
│   └── payments.js        ✓ Payment routes
├── utils/
│   └── sendEmail.js       ✓ Email utility
├── server.js              ✓ Express server
└── package.json           ✓ Dependencies
```

## 🚀 Starting the Server

### 1. Install Dependencies (if not done)
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Make sure your `.env` file has:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:3000
```

### 3. Start MongoDB
**For Local MongoDB:**
```bash
# Make sure MongoDB service is running
# Windows: Check Services or run mongod
```

**For MongoDB Atlas:**
- Ensure your IP is whitelisted
- Verify connection string is correct
- Check network access settings

### 4. Start the Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

### 5. Verify Server is Running
Open browser or use curl:
```
http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Events
- `GET /api/events` - Get all events (Public)
- `GET /api/events/:id` - Get single event (Public)
- `POST /api/events` - Create event (Admin)
- `PUT /api/events/:id` - Update event (Admin)
- `DELETE /api/events/:id` - Delete event (Admin)

### Bookings
- `GET /api/bookings` - Get all bookings (Protected)
- `GET /api/bookings/:id` - Get single booking (Protected)
- `POST /api/bookings` - Create booking (Protected)
- `PUT /api/bookings/:id` - Update booking (Protected)
- `DELETE /api/bookings/:id` - Delete booking (Protected)

### Payments
- `POST /api/payments/create-intent` - Create payment intent (Protected)
- `POST /api/payments/confirm` - Confirm payment (Protected)
- `POST /api/payments/send-reminder` - Send reminder (Admin)

See `API_DOCUMENTATION.md` for detailed API documentation.

## 🔧 Troubleshooting

### MongoDB Connection Issues

**Error: "MongoDB Connection Error"**
1. Check if MongoDB is running:
   ```bash
   # Windows: Check Services
   services.msc
   # Look for MongoDB service
   ```

2. Verify MONGODB_URI in `.env`:
   - Local: `mongodb://localhost:27017/eventmanagement`
   - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

3. For MongoDB Atlas:
   - Whitelist your IP address
   - Verify username/password
   - Check network access settings

**Error: SSL/TLS Issues**
- For local MongoDB, SSL is not required
- For Atlas, SSL is handled automatically
- If issues persist, check firewall/network settings

### Port Already in Use

**Error: "Port 5000 already in use"**
1. Change PORT in `.env` file
2. Or stop the process using port 5000:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

### JWT Token Issues

**Error: "Not authorized"**
- Ensure JWT_SECRET is set in `.env`
- Check token is included in Authorization header:
  ```
  Authorization: Bearer <token>
  ```

### Stripe Payment Issues

**Error: "Stripe is not configured"**
- Add STRIPE_SECRET_KEY to `.env`
- Get keys from: https://dashboard.stripe.com/test/apikeys
- Use test keys for development

### Email Issues

**Emails not sending:**
- Email is optional - app will work without it
- For Gmail, use App Password (not regular password)
- Check EMAIL_USER and EMAIL_PASS in `.env`

## ✅ Testing the APIs

### Using cURL

**Health Check:**
```bash
curl http://localhost:5000/api/health
```

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Get Events:**
```bash
curl http://localhost:5000/api/events
```

### Using Postman
1. Import the API endpoints
2. Set base URL: `http://localhost:5000/api`
3. For protected routes, add token in Authorization header

## 🎯 Next Steps

1. ✅ Start MongoDB (local or Atlas)
2. ✅ Configure `.env` file
3. ✅ Start backend server: `npm run dev`
4. ✅ Test health endpoint
5. ✅ Start frontend: `cd ../frontend && npm start`
6. ✅ Test full application flow

## 📝 Notes

- All routes are properly configured
- Error handling is implemented
- Authentication middleware is working
- Payment integration ready (needs Stripe keys)
- Email notifications ready (needs email config)
- All models have proper validation
- Database indexes are handled by Mongoose

**Your backend is ready to use!** 🚀

