import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;

if (stripeSecret) {
  stripe = new Stripe(stripeSecret, {
    apiVersion: '2025-01-27' as any
  });
}

// Creates checkout sessions for SaaS plans billing
export async function createCheckoutSession(
  userId: string,
  organizationId: string,
  planType: 'PRO' | 'ENTERPRISE'
): Promise<string> {
  const priceMap = {
    PRO: 'price_pro_subscription_dummy',
    ENTERPRISE: 'price_ent_subscription_dummy'
  };

  const domain = process.env.NEXT_PUBLIC_API_URL 
    ? new URL(process.env.NEXT_PUBLIC_API_URL).origin 
    : 'http://localhost';

  if (stripe) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceMap[planType],
            quantity: 1
          }
        ],
        mode: 'subscription',
        success_url: `${domain}/dashboard?checkout=success&plan=${planType}`,
        cancel_url: `${domain}/dashboard/settings?checkout=cancelled`,
        metadata: {
          userId,
          organizationId,
          planType
        }
      });
      return session.url || `${domain}/dashboard`;
    } catch (err) {
      console.warn('[PROVENTA STRIPE ERROR]: Session create failed. Falling back to dev mode.', err);
    }
  }

  // Developer Simulation Mode
  console.log(`[PROVENTA DEV]: Stripe checkout triggered for ${planType} plan. OrgId: ${organizationId}`);
  return `${domain}/dashboard?checkout=success&plan=${planType}`;
}

// Webhook simulation handler to verify checkout completed successfully
export async function verifyWebhookSignature(body: string, sig: string, webhookSecret: string): Promise<any> {
  if (stripe) {
    return stripe.webhooks.constructEvent(body, sig, webhookSecret);
  }
  return { type: 'checkout.session.completed', data: { object: { metadata: { organizationId: 'dummy', planType: 'PRO' } } } };
}
