require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Resend } = require('resend');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const resend = new Resend(process.env.RESEND_API_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(cors());

// Use JSON parser for all routes except webhook
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
});
app.use(express.static('public'));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create payment intent
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, guestName, guestEmail, guestMessage, coverFees } = req.body;

    // Validate amount
    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Calculate total amount including fees if guest is covering them
    let totalAmount = amount;
    if (coverFees) {
      // Stripe fee structure: 1.75% + $0.30 AUD
      // To calculate the amount needed so that after fees the couple receives 'amount':
      // Let x = total charge
      // amount = x - (x * 0.0175 + 0.30)
      // amount = x * 0.9825 - 0.30
      // x = (amount + 0.30) / 0.9825
      const exactAmount = (amount + 0.30) / 0.9825;
      // Round to nearest cent (not nearest dollar!)
      totalAmount = Math.round(exactAmount * 100) / 100;
    }

    // Convert to cents for Stripe
    const amountInCents = Math.round(totalAmount * 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'aud',
      metadata: {
        guestName: guestName || 'Anonymous',
        guestEmail: guestEmail || '',
        guestMessage: guestMessage || '',
        originalAmount: amount,
        feesCovered: coverFees
      },
      description: `Wedding gift from ${guestName || 'Anonymous'}`
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      totalAmount: totalAmount
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Webhook handler for payment confirmation
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    console.log('✅ Payment received!');
    console.log(`Guest: ${paymentIntent.metadata.guestName}`);
    console.log(`Amount: $${(paymentIntent.amount / 100).toFixed(2)} AUD`);
    console.log(`Message: ${paymentIntent.metadata.guestMessage}`);

    // Send email notifications
    try {
      const guestEmail = paymentIntent.metadata.guestEmail;
      const guestName = paymentIntent.metadata.guestName;
      const amount = (paymentIntent.amount / 100).toFixed(2);
      const guestMessage = paymentIntent.metadata.guestMessage;

      // Send confirmation email to guest (if they provided email)
      if (guestEmail) {
        await resend.emails.send({
          from: process.env.FROM_EMAIL || 'noreply@wishingwell.com',
          to: guestEmail,
          subject: 'Thank you for your wedding gift! 💝',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ff6b9d;">Thank you, ${guestName}!</h2>
              <p>Your generous wedding gift of <strong>$${amount} AUD</strong> has been received.</p>
              ${guestMessage ? `<p style="background: #f5f5f5; padding: 15px; border-radius: 8px; font-style: italic;">"${guestMessage}"</p>` : ''}
              <p>David and Danielle are so grateful for your love and support on their special day.</p>
              <p style="color: #6d5674; font-size: 14px; margin-top: 30px;">Made with 💕 for David & Danielle's wedding</p>
            </div>
          `
        });
        console.log(`📧 Confirmation email sent to ${guestEmail}`);
      }

      // Send notification email to couple
      if (process.env.COUPLE_EMAIL) {
        await resend.emails.send({
          from: process.env.FROM_EMAIL || 'noreply@wishingwell.com',
          to: process.env.COUPLE_EMAIL,
          subject: `New wedding gift received from ${guestName}! 🎉`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ff6b9d;">New Gift Received!</h2>
              <p><strong>From:</strong> ${guestName}</p>
              <p><strong>Amount:</strong> $${amount} AUD</p>
              ${guestMessage ? `<p><strong>Message:</strong></p><p style="background: #f5f5f5; padding: 15px; border-radius: 8px; font-style: italic;">"${guestMessage}"</p>` : ''}
              ${guestEmail ? `<p><strong>Email:</strong> ${guestEmail}</p>` : ''}
              <p style="margin-top: 20px;"><a href="https://dashboard.stripe.com/payments" style="background: #ff6b9d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View in Stripe Dashboard</a></p>
              <p style="color: #6d5674; font-size: 14px; margin-top: 30px;">💝 Your Wishing Well</p>
            </div>
          `
        });
        console.log(`📧 Notification email sent to couple`);
      }
    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      // Don't fail the webhook if email fails
    }
  }

  res.json({ received: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎉 Wishing Well server running on http://localhost:${PORT}`);
  console.log(`📝 Stripe mode: ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_test') ? 'TEST' : 'LIVE'}`);
});
