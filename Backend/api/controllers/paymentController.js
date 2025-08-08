
import Stripe from 'stripe';

function getStripeInstance() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function getCards(req, res) {
  const userId = req.user.id;
  const db = req.app.get('db');
  const cards = await db.collection('cards').find({ userId }).toArray();
  res.json(cards);
}

export async function addCard(req, res) {
  const userId = req.user.id;
  const { type, last4 } = req.body;
  const db = req.app.get('db');
  await db.collection('cards').insertOne({ userId, type, last4 });
  res.status(201).json({ message: 'Tarjeta agregada' });
}

export async function deleteCard(req, res) {
  const userId = req.user.id;
  const { cardId } = req.params;
  const db = req.app.get('db');
  await db.collection('cards').deleteOne({ _id: cardId, userId });
  res.status(200).json({ message: 'Tarjeta eliminada' });
}

export async function createCheckoutSession(req, res) {
  const { cart } = req.body;
  try {
    const stripe = getStripeInstance();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: cart.map(item => ({
        price_data: {
          currency: 'cop',
          product_data: { name: item.nombre },
          unit_amount: Math.round(item.precio * 100)
        },
        quantity: item.cantidad
      })),
      success_url: `${process.env.FRONTEND_URLS}/confirm-payment?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URLS}/cart`
    });

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: 'Error creating checkout session' });
  }
}

export async function stripeWebhook(req, res) {
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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      const db = req.app.get('db');
      await db
        .collection('orders')
        .updateOne({ sessionId: session.id }, { $set: { status: 'paid' } });
      // TODO: Decrease inventory based on the purchased items
    } catch (error) {
      console.error('Error updating order after payment:', error);
    }
  }

  res.json({ received: true });
}

export async function getSessionStatus(req, res) {
  const { id } = req.params;
  try {
    const session = await stripe.checkout.sessions.retrieve(id);
    res.json({ status: session.payment_status });
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).json({ message: 'Unable to retrieve session' });
  }
}