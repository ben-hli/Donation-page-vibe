import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Zero-decimal currencies: Stripe expects the integer, not ×100
const ZERO_DECIMAL = new Set([
  'BIF','CLP','DJF','GNF','JPY','KMF','KRW','MGA','PYG','RWF','UGX','VND','VUV','XAF','XOF','XPF',
]);

function toSmallestUnit(amount, currency) {
  return ZERO_DECIMAL.has(currency) ? Math.round(amount) : Math.round(amount * 100);
}

// Minimum amounts in smallest unit per currency (Stripe requirements)
const MIN_AMOUNTS = {
  USD: 50, GBP: 30, EUR: 50, CAD: 50, AUD: 50, CHF: 50,
  NOK: 300, SEK: 300, DKK: 250, NZD: 50, SGD: 50, HKD: 400,
  JPY: 50, INR: 50, ZAR: 100, BRL: 50, MXN: 10, PLN: 50,
  CZK: 1500, HUF: 17500, ILS: 100, AED: 200, KRW: 50, CNY: 100,
  TWD: 100, THB: 20, MYR: 200, PHP: 200, IDR: 10000, VND: 10000,
};

export default async function handler(req, res) {
  // CORS headers for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { amount, currency, frequency, donor, destination, splits, hliPct } = req.body ?? {};

  // ── Validation ──────────────────────────────────────────────────────────
  const donationAmount = Number(amount);
  if (!amount || !isFinite(donationAmount) || donationAmount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  if (!currency || typeof currency !== 'string') {
    return res.status(400).json({ error: 'Invalid currency' });
  }
  if (!['one-off', 'monthly'].includes(frequency)) {
    return res.status(400).json({ error: 'Invalid frequency' });
  }
  if (!donor?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donor.email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // HLI's research contribution is charged in addition to the donation,
  // not deducted from it — only applies to the "recommended" (own-allocation) destination.
  const hliPctNum = destination === 'recommended' ? Number(hliPct) || 0 : 0;
  const hliAmount = donationAmount * (hliPctNum / 100);
  const totalAmount = donationAmount + hliAmount;

  const currencyUpper = currency.toUpperCase();
  const amountInt = toSmallestUnit(totalAmount, currencyUpper);
  const minAmount = MIN_AMOUNTS[currencyUpper] ?? 50;

  if (amountInt < minAmount) {
    return res.status(400).json({ error: `Minimum donation for ${currencyUpper} not met` });
  }

  // ── Shared metadata ──────────────────────────────────────────────────────
  const metadata = {
    destination:     destination ?? '',
    frequency,
    donationAmount:  String(donationAmount),
    hliPct:          String(hliPctNum),
    hliAmount:       String(hliAmount),
    splits:          JSON.stringify(splits ?? {}),
    donorFirstName:  donor.firstName ?? '',
    donorLastName:   donor.lastName  ?? '',
    donorEmail:      donor.email,
    donorAddressLine1: donor.addressLine1 ?? '',
    donorAddressLine2: donor.addressLine2 ?? '',
    donorCity:       donor.city ?? '',
    donorState:      donor.state ?? '',
    donorPostalCode: donor.postalCode ?? '',
    donorCountry:    donor.country     ?? '',
    donorCountryCode: donor.countryCode ?? '',
    giftAid:         String(donor.giftAid  ?? false),
    monthlyUpsellAccepted: String(donor.monthlyUpsellAccepted ?? false),
  };

  const donorName = `${donor.firstName ?? ''} ${donor.lastName ?? ''}`.trim() || undefined;

  try {
    // ── One-off PaymentIntent ───────────────────────────────────────────────
    if (frequency === 'one-off') {
      const intent = await stripe.paymentIntents.create({
        amount:       amountInt,
        currency:     currency.toLowerCase(),
        metadata,
        receipt_email: donor.email,
        automatic_payment_methods: { enabled: true },
        description: `HLI donation — ${destination}`,
      });

      return res.status(200).json({
        clientSecret: intent.client_secret,
        type: 'payment_intent',
      });
    }

    // ── Monthly Subscription ────────────────────────────────────────────────
    const customer = await stripe.customers.create({
      email: donor.email,
      name:  donorName,
      metadata,
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price_data: {
          currency:    currency.toLowerCase(),
          unit_amount: amountInt,
          recurring:   { interval: 'month' },
          product_data: {
            name: `Monthly donation — ${destination} (HLI)`,
          },
        },
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
        payment_method_types: ['card'],
      },
      expand: ['latest_invoice.payment_intent'],
      metadata,
    });

    const paymentIntent = subscription.latest_invoice.payment_intent;

    return res.status(200).json({
      clientSecret:   paymentIntent.client_secret,
      type:           'subscription',
      subscriptionId: subscription.id,
    });

  } catch (err) {
    console.error('Stripe error:', err.message);
    return res.status(500).json({ error: err.message ?? 'Payment setup failed' });
  }
}
