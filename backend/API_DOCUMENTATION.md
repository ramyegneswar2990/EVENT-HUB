# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_token>
```

---

## Auth Endpoints

### Register User
**POST** `/api/auth/register`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user" // optional, defaults to "user"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Login User
**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Get Current User
**GET** `/api/auth/me` (Protected)

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

## Event Endpoints

### Get All Events
**GET** `/api/events`

**Query Parameters:**
- `category` - Filter by category (concert, conference, workshop, sports, theater, other)
- `search` - Search in title, description, venue
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Example:**
```
GET /api/events?category=concert&search=music&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "total": 20,
  "page": 1,
  "pages": 2,
  "data": [...]
}
```

### Get Single Event
**GET** `/api/events/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "event_id",
    "title": "Concert Name",
    "description": "Event description",
    "category": "concert",
    "date": "2024-12-25T00:00:00.000Z",
    "time": "19:00",
    "venue": "Concert Hall",
    "location": "New York",
    "price": 50,
    "totalTickets": 100,
    "availableTickets": 75,
    "image": "https://...",
    "createdBy": {...}
  }
}
```

### Create Event (Admin Only)
**POST** `/api/events` (Protected, Admin)

**Body:**
```json
{
  "title": "Event Title",
  "description": "Event description",
  "category": "concert",
  "date": "2024-12-25",
  "time": "19:00",
  "venue": "Venue Name",
  "location": "City, State",
  "price": 50,
  "totalTickets": 100,
  "availableTickets": 100,
  "image": "https://image-url.com/image.jpg"
}
```

### Update Event (Admin Only)
**PUT** `/api/events/:id` (Protected, Admin)

### Delete Event (Admin Only)
**DELETE** `/api/events/:id` (Protected, Admin)

---

## Booking Endpoints

### Get All Bookings
**GET** `/api/bookings` (Protected)
- Regular users see only their bookings
- Admins see all bookings

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [...]
}
```

### Get Single Booking
**GET** `/api/bookings/:id` (Protected)

### Create Booking
**POST** `/api/bookings` (Protected)

**Body:**
```json
{
  "eventId": "event_id",
  "tickets": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "booking_id",
    "user": "user_id",
    "event": "event_id",
    "tickets": 2,
    "totalAmount": 100,
    "paymentStatus": "pending",
    "bookingDate": "2024-01-15T10:00:00.000Z"
  }
}
```

### Update Booking
**PUT** `/api/bookings/:id` (Protected)

### Delete Booking
**DELETE** `/api/bookings/:id` (Protected)

---

## Payment Endpoints

### Create Payment Intent
**POST** `/api/payments/create-intent` (Protected)

**Body:**
```json
{
  "bookingId": "booking_id"
}
```

**Response:**
```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx",
  "booking": {...}
}
```

### Confirm Payment
**POST** `/api/payments/confirm` (Protected)

**Body:**
```json
{
  "bookingId": "booking_id",
  "paymentIntentId": "pi_xxx"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment confirmed",
  "data": {...}
}
```

### Send Reminder (Admin Only)
**POST** `/api/payments/send-reminder` (Protected, Admin)

**Body:**
```json
{
  "bookingId": "booking_id"
}
```

---

## Health Check

### Server Status
**GET** `/api/health`

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "message": "Error message here"
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## Notes

1. All dates should be in ISO 8601 format
2. JWT tokens expire in 7 days (configurable via JWT_EXPIRE)
3. Payment processing uses Stripe (test mode for development)
4. Email notifications require email configuration in .env
5. Admin routes require user role to be "admin"

