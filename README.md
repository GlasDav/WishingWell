# 💝 Wishing Well - Wedding Gift Website

A beautiful, simple website for wedding guests to contribute gifts via card payment (Stripe) or bank transfer. Built with Node.js, Express, and vanilla JavaScript.

## ✨ Features

- **Card Payments** - Seamless Stripe integration for instant payments
- **Fee Coverage Option** - Guests can choose to cover processing fees (~2%)
- **Alternative Payment** - Display PayID/BSB for direct bank transfers (fee-free)
- **Guest Messages** - Guests can leave heartfelt messages for the couple
- **Beautiful Design** - Modern wedding-themed UI with soft pastels and smooth animations
- **Mobile Responsive** - Works perfectly on all devices
- **Simple Setup** - No database required, easy to deploy

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Stripe

1. Create a free account at [stripe.com/au](https://stripe.com/au)
2. Get your API keys from the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
3. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
4. Update `.env` with your Stripe keys:
   ```
   STRIPE_SECRET_KEY=sk_test_your_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   ```

### 3. Configure Payment Details

Update your `.env` file with your payment details:
```
COUPLE_PAYID=yourname@email.com
COUPLE_BSB=123-456
COUPLE_ACCOUNT=12345678
COUPLE_ACCOUNT_NAME=Bride & Groom Names
```

### 4. Update Frontend Stripe Key

Open `public/script.js` and replace the placeholder key on line 2:
```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_test_your_publishable_key_here';
```

### 5. Run the Server

```bash
npm start
```

Visit `http://localhost:3000` in your browser!

## 🧪 Testing Payments

Stripe provides test card numbers for testing:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Use any future expiry date, any 3-digit CVC, and any postal code.

View test payments in your [Stripe Dashboard](https://dashboard.stripe.com/test/payments).

## 📦 Project Structure

```
WishingWell/
├── public/
│   ├── index.html      # Main HTML page
│   ├── styles.css      # Wedding-themed styles
│   └── script.js       # Stripe integration & payment logic
├── server.js           # Express server & Stripe backend
├── package.json        # Dependencies
├── .env.example        # Environment variables template
└── README.md          # This file
```

## 🔒 Security Notes

- Never commit your `.env` file (it's in `.gitignore`)
- Use Stripe's **test mode** for development
- Enable Stripe **webhooks** for production to track payments
- Consider adding rate limiting for production use

## 🚢 Deployment Options

### Option 1: Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` and follow prompts
3. Add environment variables in Vercel dashboard

### Option 2: Heroku
1. Install Heroku CLI
2. `heroku create your-wishing-well`
3. Set config vars: `heroku config:set STRIPE_SECRET_KEY=sk_...`
4. `git push heroku main`

### Option 3: Netlify
1. Use Netlify Functions for the backend
2. Deploy frontend to Netlify
3. Add environment variables in Netlify dashboard

## 💡 Customization

### Change Colors
Edit CSS variables in `public/styles.css`:
```css
:root {
  --primary: #ff6b9d;      /* Main pink color */
  --secondary: #c9a0dc;    /* Purple accent */
  --accent: #ffd4a3;       /* Warm accent */
}
```

### Change Couple Names
Update the title and text in `public/index.html`:
```html
<h1>💝 John & Jane's Wishing Well</h1>
```

### Adjust Fee Calculation
The Stripe fee for Australia is 1.75% + $0.30. If this changes, update the calculation in:
- `server.js` (line 32-37)
- `public/script.js` (line 64-67)

## 📧 Getting Payment Notifications

To receive email notifications when payments are made:

1. Set up a [Stripe webhook](https://dashboard.stripe.com/webhooks)
2. Point it to `https://yourdomain.com/webhook`
3. Add email sending logic in `server.js` (line 84)
4. Use services like SendGrid, Mailgun, or AWS SES

## ❓ FAQ

**Q: Do I need a business to use Stripe?**  
A: No! Individuals can use Stripe for personal payments.

**Q: What are the Stripe fees?**  
A: In Australia, Stripe charges 1.75% + $0.30 per transaction.

**Q: Can guests cover the fees?**  
A: Yes! There's a checkbox (checked by default) that adds the fee amount to their payment.

**Q: Is this secure?**  
A: Yes. Card details never touch your server - they go directly to Stripe via their secure Elements.

**Q: Can I use this for other events?**  
A: Absolutely! Just customize the text and colors.

## 📄 License

MIT - Feel free to use this for your wedding or any other event!

## 💕 Support

Made with love for couples around the world. Enjoy your special day! 🎉

---

**Need help?** Check the [Stripe documentation](https://stripe.com/docs) or create an issue.
