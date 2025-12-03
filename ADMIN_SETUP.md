# Admin Account Setup

## Admin Credentials

**Email:** `admin@gmail.com`  
**Password:** `admin123`  
**Role:** `admin`

## How It Works

### Automatic Admin Creation
- The admin user is **automatically created** when the backend server starts
- The admin account is created only if it doesn't already exist
- If the admin exists, the system ensures it has the correct role

### Login Flow
1. **Admin Login:**
   - Login with `admin@gmail.com` / `admin123`
   - Automatically redirected to `/admin` dashboard
   - Can access all admin features

2. **Regular User Login:**
   - Login with any other credentials
   - Redirected to `/events` page
   - Can only access user features

### Security Features

1. **Admin Registration Blocked:**
   - Cannot register with `admin@gmail.com`
   - Cannot assign `admin` role during registration
   - Only one admin account exists

2. **Admin Dashboard Protection:**
   - `/admin` route is protected by `AdminRoute` component
   - Only users with `role: 'admin'` can access
   - Regular users are redirected to home page

3. **Backend Protection:**
   - Admin-only routes use `admin` middleware
   - Returns 403 Forbidden for non-admin users

## Admin Dashboard Features

The admin dashboard (`/admin`) includes:

1. **Event Management:**
   - Create new events
   - Edit existing events
   - Delete events
   - View all events

2. **Booking Management:**
   - View all bookings from all users
   - See booking details
   - Send event reminders to users

3. **User Management:**
   - View user information (through bookings)

## Testing Admin Access

1. **Start the backend:**
   ```bash
   cd backend
   npm run dev
   ```
   You should see: `✓ Admin user created successfully` or `✓ Admin user already exists`

2. **Start the frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Login as Admin:**
   - Go to login page
   - Enter: `admin@gmail.com`
   - Enter: `admin123`
   - Click Login
   - You'll be redirected to `/admin` dashboard

4. **Verify Admin Features:**
   - You should see "Admin" link in navbar
   - You can create/edit/delete events
   - You can view all bookings
   - You can send reminders

## Notes

- The admin account is created automatically - no manual setup needed
- The admin password is hardcoded for simplicity
- In production, consider changing the admin password after first login
- Only one admin account exists in the system
- The admin email is reserved and cannot be used for regular registration

