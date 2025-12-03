# 🚀 EventHub Deployment Guide

This guide will walk you through deploying your EventHub application to production using free hosting services.

## 📋 Deployment Stack

- **Frontend**: Vercel (Free tier)
- **Backend**: Render (Free tier)
- **Database**: MongoDB Atlas (Free tier)

---

## 🗄️ Step 1: Deploy MongoDB Database (MongoDB Atlas)

### 1.1 Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Verify your email

### 1.2 Create a Cluster

1. Click **"Build a Database"**
2. Choose **"M0 Free"** tier
3. Select your cloud provider and region (choose closest to your users)
4. Name your cluster (e.g., `eventhub-cluster`)
5. Click **"Create Cluster"**

### 1.3 Configure Database Access

1. Go to **Database Access** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **Password** authentication
4. Username: `eventhub-admin`
5. Generate a secure password (save it!)
6. Set privileges to **"Atlas Admin"**
7. Click **"Add User"**

### 1.4 Configure Network Access

1. Go to **Network Access** in the left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Add description: `All IPs for deployment`
5. Click **"Confirm"**

### 1.5 Get Connection String

1. Go to **Database** → Click **"Connect"**
2. Choose **"Connect your application"**
3. Copy the connection string
4. It will look like: `mongodb+srv://eventhub-admin:<password>@eventhub-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority`
5. Replace `<password>` with your actual password
6. Add database name: `mongodb+srv://eventhub-admin:YOUR_PASSWORD@eventhub-cluster.xxxxx.mongodb.net/eventmanagement?retryWrites=true&w=majority`

**Save this connection string! You'll need it for backend deployment.**

---

## 🔧 Step 2: Deploy Backend (Render)

### 2.1 Prepare Backend for Deployment

1. Ensure your backend has a `package.json` with proper start script
2. Make sure `server.js` uses `process.env.PORT || 5000`

### 2.2 Create Render Account

1. Go to [Render](https://render.com)
2. Sign up with GitHub (recommended)
3. Grant access to your repositories

### 2.3 Deploy Backend

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `EVENT-HUB`
3. Configure the service:
   - **Name**: `eventhub-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

4. Click **"Advanced"** and add Environment Variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://eventhub-admin:YOUR_PASSWORD@eventhub-cluster.xxxxx.mongodb.net/eventmanagement?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long_for_production
JWT_EXPIRE=7d
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=live
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=https://your-frontend-url.vercel.app
```

5. Click **"Create Web Service"**

6. Wait for deployment (5-10 minutes)

7. Once deployed, copy your backend URL:
   - Will be: `https://eventhub-backend.onrender.com`

**Important Notes:**
- Free tier sleeps after 15 mins of inactivity (first request may be slow)
- Generate a strong JWT_SECRET (use a password generator)
- Update FRONTEND_URL after deploying frontend

---

## 🎨 Step 3: Deploy Frontend (Vercel)

### 3.1 Update API Configuration

Before deploying, update the frontend to use environment variable:

The frontend already uses `REACT_APP_API_URL` from `.env`

### 3.2 Create Vercel Account

1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. Grant access to your repositories

### 3.3 Deploy Frontend

1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository: `EVENT-HUB`
3. Configure project:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

4. Add Environment Variables:
   - Click **"Environment Variables"**
   - Add:
     ```
     REACT_APP_API_URL=https://eventhub-backend.onrender.com/api
     REACT_APP_PAYPAL_CLIENT_ID=your_paypal_client_id
     ```

5. Click **"Deploy"**

6. Wait for deployment (2-5 minutes)

7. Your frontend will be live at:
   - `https://your-project-name.vercel.app`

### 3.4 Update Backend with Frontend URL

1. Go back to Render dashboard
2. Click on your backend service
3. Go to **"Environment"**
4. Update `FRONTEND_URL` with your Vercel URL:
   ```
   FRONTEND_URL=https://your-project-name.vercel.app
   ```
5. Save changes (service will redeploy)

---

## ✅ Step 4: Verify Deployment

### 4.1 Test Backend

1. Visit: `https://eventhub-backend.onrender.com/api/events`
2. You should see: `{"success":true,"count":0,"data":[]}`

### 4.2 Test Frontend

1. Visit your Vercel URL
2. Test registration and login
3. Try browsing events
4. Test the full booking flow

### 4.3 Test Admin Access

1. Login with: `admin@gmail.com` / `admin123`
2. Access admin dashboard
3. Create a test event

---

## 🔒 Step 5: Configure PayPal for Production

### 5.1 Switch to Live Mode

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Switch from Sandbox to Live
3. Create a Live App
4. Get your Live Client ID and Secret
5. Update environment variables in:
   - Render backend: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE=live`
   - Vercel frontend: `REACT_APP_PAYPAL_CLIENT_ID`

---

## 📧 Step 6: Configure Email for Production

### Gmail App Password

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification (enable if not enabled)
3. App passwords → Generate
4. Select **Mail** and **Other (Custom name)**: "EventHub"
5. Copy the 16-character password
6. Update `EMAIL_PASS` in Render backend environment variables

---

## 🎯 Your Deployed URLs

After completing all steps, you'll have:

- **Frontend**: `https://your-project-name.vercel.app`
- **Backend**: `https://eventhub-backend.onrender.com`
- **Database**: MongoDB Atlas (cloud hosted)

---

## 🔄 Making Updates

### Update Frontend
1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update frontend"
   git push
   ```
3. Vercel auto-deploys on push

### Update Backend
1. Make changes locally
2. Commit and push to GitHub
3. Render auto-deploys on push

---

## ⚠️ Important Notes

### Free Tier Limitations

**Render (Backend):**
- Sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- 750 hours/month free

**Vercel (Frontend):**
- 100GB bandwidth/month
- Unlimited deployments
- Auto SSL certificate

**MongoDB Atlas:**
- 512 MB storage
- Shared RAM
- No backups on free tier

### Production Best Practices

1. **Security:**
   - Use strong JWT secrets (32+ characters)
   - Never commit `.env` files
   - Enable CORS only for your frontend URL
   - Validate all inputs

2. **Performance:**
   - Use production build for frontend
   - Enable compression on backend
   - Optimize images and assets
   - Consider caching strategies

3. **Monitoring:**
   - Monitor Render logs for backend errors
   - Check Vercel analytics
   - Set up MongoDB Atlas alerts

---

## 🐛 Troubleshooting

### Backend not responding
- Check Render logs for errors
- Verify MongoDB connection string
- Ensure all environment variables are set

### Frontend can't connect to backend
- Verify REACT_APP_API_URL is correct
- Check CORS settings on backend
- Ensure backend is deployed and running

### Database connection failed
- Check MongoDB Atlas network access (allow all IPs)
- Verify connection string is correct
- Check database user permissions

### Payments not working
- Verify PayPal credentials
- Check PayPal mode (sandbox vs live)
- Review PayPal dashboard logs

---

## 📞 Need Help?

- **Render Support**: https://render.com/docs
- **Vercel Support**: https://vercel.com/docs
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas/

---

## 🎉 Congratulations!

Your EventHub application is now live and accessible worldwide!

**Share your project:**
- Add deployment links to your GitHub README
- Share on LinkedIn
- Add to your portfolio

---

**Note**: First deployment may take 10-15 minutes total. Be patient and follow each step carefully.
