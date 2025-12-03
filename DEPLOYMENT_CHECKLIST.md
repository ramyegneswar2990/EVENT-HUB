# Deployment Checklist

## Pre-Deployment

- [ ] All code committed to GitHub
- [ ] `.env` files are in `.gitignore`
- [ ] No sensitive data in codebase
- [ ] All dependencies in package.json

## MongoDB Atlas Setup

- [ ] MongoDB Atlas account created
- [ ] Free cluster created
- [ ] Database user created with password saved
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string copied and saved

## Backend Deployment (Render)

- [ ] Render account created
- [ ] Backend service created
- [ ] Root directory set to `backend`
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Environment variables added:
  - [ ] NODE_ENV
  - [ ] MONGODB_URI
  - [ ] JWT_SECRET
  - [ ] PAYPAL_CLIENT_ID
  - [ ] PAYPAL_CLIENT_SECRET
  - [ ] PAYPAL_MODE
  - [ ] EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
  - [ ] FRONTEND_URL (update after frontend deployment)
- [ ] Service deployed successfully
- [ ] Backend URL copied

## Frontend Deployment (Vercel)

- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Root directory set to `frontend`
- [ ] Framework preset: Create React App
- [ ] Environment variables added:
  - [ ] REACT_APP_API_URL
  - [ ] REACT_APP_PAYPAL_CLIENT_ID
- [ ] Project deployed successfully
- [ ] Frontend URL copied

## Post-Deployment Configuration

- [ ] Updated FRONTEND_URL in Render backend
- [ ] Backend service redeployed
- [ ] Tested backend API endpoint
- [ ] Tested frontend loading
- [ ] Tested user registration
- [ ] Tested user login
- [ ] Tested admin login (admin@gmail.com)
- [ ] Tested event browsing
- [ ] Tested event booking flow
- [ ] Tested payment integration
- [ ] Tested email notifications

## Production Configuration

- [ ] PayPal switched to live mode (optional)
- [ ] Gmail app password configured
- [ ] CORS configured for production URL
- [ ] All environment variables secured

## Documentation

- [ ] Deployment URLs added to README
- [ ] GitHub repository updated
- [ ] DEPLOYMENT_GUIDE.md reviewed

## Monitoring

- [ ] Render logs checked for errors
- [ ] Vercel deployment logs reviewed
- [ ] MongoDB Atlas connection verified
- [ ] Test end-to-end flow

---

## Your Deployment URLs

**Frontend**: ______________________________________

**Backend**: ______________________________________

**Database**: MongoDB Atlas (Cloud Hosted)

---

## Notes

- Render free tier sleeps after 15 minutes of inactivity
- First request after sleep may take 30-60 seconds
- Keep your environment variables secure
- Monitor your free tier limits

---

**Status**: 
- [ ] Deployment in Progress
- [ ] Deployment Complete
- [ ] Production Ready
