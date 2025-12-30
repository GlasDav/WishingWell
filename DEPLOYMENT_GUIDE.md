# 🚀 Deploy Your Wishing Well for FREE

You have **3 great free options** to host your site and get a shareable link:

## Option 1: Render (Easiest - Recommended) ✅

**Why**: Free tier, automatic HTTPS, easy setup, perfect for Node.js

### Steps:

1. **Push your code to GitHub**
   ```powershell
   git init
   git add .
   git commit -m "Initial commit - Wishing Well"
   git branch -M main
   # Create a new repo on github.com, then:
   git remote add origin https://github.com/YOUR-USERNAME/wishing-well.git
   git push -u origin main
   ```

2. **Sign up at [render.com](https://render.com)**
   - Use your GitHub account to sign in

3. **Create a new Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Settings:
     - **Name**: `wishing-well` (or anything you want)
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free

4. **Add Environment Variables**
   - Click "Environment" tab
   - Add these from your `.env` file:
     ```
     STRIPE_SECRET_KEY=sk_test_...
     STRIPE_PUBLISHABLE_KEY=pk_test_...
     STRIPE_WEBHOOK_SECRET=whsec_... (if you have it)
     COUPLE_BSB=182-182
     COUPLE_ACCOUNT=020189007
     COUPLE_ACCOUNT_NAME=David Glasser & Danielle Beth Herman
     ```

5. **Deploy!**
   - Click "Create Web Service"
   - Wait 2-3 minutes
   - You'll get a URL like: `https://wishing-well-abc123.onrender.com`

6. **Update frontend URL**
   - Once deployed, edit `public/script.js` line 103
   - Change: `http://localhost:3000` → `https://your-app-name.onrender.com`
   - Commit and push (Render will auto-redeploy)

---

## Option 2: Railway (Also Easy)

**Why**: Modern, fast, generous free tier

### Steps:

1. **Push to GitHub** (same as above)

2. **Sign up at [railway.app](https://railway.app)**

3. **New Project → Deploy from GitHub**
   - Select your repository
   - Railway auto-detects Node.js

4. **Add Environment Variables**
   - Settings → Variables
   - Add all your `.env` values

5. **Generate Domain**
   - Settings → Generate Domain
   - You'll get: `https://wishing-well.up.railway.app`

6. **Update frontend** (same as Render)

---

## Option 3: Vercel (Most Popular)

**Why**: Free, fast CDN, popular for front-end

**Note**: Requires converting the backend to serverless functions (more technical)

### Quick Alternative for Vercel:
Deploy backend to Render (free) and frontend to Vercel:
- Backend endpoint: `https://wishing-well.onrender.com`
- Frontend: `https://wishing-well.vercel.app`

---

## After Deployment

### ✅ Update Script.js
In `public/script.js`, change line 103:
```javascript
// OLD:
const response = await fetch('http://localhost:3000/create-payment-intent', {

// NEW (replace with your actual deployed URL):
const response = await fetch('https://your-app-name.onrender.com/create-payment-intent', {
```

### ✅ Set up Stripe Webhooks (Optional but Recommended)
1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Add endpoint: `https://your-app-name.onrender.com/webhook`
3. Select event: `payment_intent.succeeded`
4. Copy webhook secret and add to environment variables

### ✅ Test the Deployed Site
- Visit your deployed URL
- Test with card: `4242 4242 4242 4242`
- Check Stripe Dashboard for payment

---

## Free Tier Limits

| Platform | Free Tier Details |
|----------|-------------------|
| **Render** | 750 hours/month, sleeps after 15 min inactivity (wakes in ~30 sec) |
| **Railway** | $5 credit/month (enough for small sites) |
| **Vercel** | Unlimited for frontend, 100GB bandwidth |

**Recommendation**: Start with **Render** - it's the easiest and perfect for this use case!

---

## Quick Start (Render)

If you don't have GitHub yet, here's the fastest path:

```powershell
# 1. Initialize git
git init
git add .
git commit -m "Wishing Well site"

# 2. Create GitHub repo at github.com
# 3. Connect and push
git remote add origin https://github.com/YOUR-USERNAME/wishing-well.git
git push -u origin main

# 4. Go to render.com and deploy!
```

**Total time: ~10 minutes** ⚡

Your site will be live at a URL you can share with wedding guests!
