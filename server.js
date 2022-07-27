
import Stripe from 'stripe'
const express = require('express')
const cors = require('cors')
const app = express()

const endpointSecret =
process.env.STRIPE_ENDPOINT_SECRET

const corsOptions = {
	origin: 'http://localhost:3000',
	optionSuccessStatus: 200,
}

app.use(cors(corsOptions))

const stripe = require('stripe')(process.env.STRIPE_SK)

// Use JSON parser for all non-webhook routes
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Stripe requires the raw body to construct the event
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    // On error, log and return the error message
    console.log(`❌ Error message: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Successfully constructed event
  console.log('✅ Success:', event.id);

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      console.log('paymentIntent', paymentIntent)
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      console.log('paymentMethod', paymentMethod)
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({received: true});
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});