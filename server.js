require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create payment intent
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, guestName, guestMessage, coverFees } = req.body;

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
      totalAmount = Math.ceil((amount + 0.30) / 0.9825);
    }

    // Convert to cents for Stripe
    const amountInCents = Math.round(totalAmount * 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'aud',
      metadata: {
        guestName: guestName || 'Anonymous',
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
    
    // Here you could:
    // - Send an email notification to the couple
    // - Store the payment in a database
    // - Log to a file
  }

  res.json({ received: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎉 Wishing Well server running on http://localhost:${PORT}`);
  console.log(`📝 Stripe mode: ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_test') ? 'TEST' : 'LIVE'}`);
});
