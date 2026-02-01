#!/usr/bin/env node
/**
 * Stripe Products & Prices Setup Script
 * 
 * This script creates the necessary Stripe products and prices for the new
 * hybrid pricing model. Run this once to set up your Stripe account.
 * 
 * Usage:
 *   node scripts/setup-stripe-products.js
 * 
 * Prerequisites:
 *   - STRIPE_SECRET_KEY environment variable must be set
 *   - Run in production mode for live keys, test mode for test keys
 * 
 * After running, add the generated price IDs to your .env file:
 *   STRIPE_STARTER_MONTH_PRICE_ID=price_xxx
 *   STRIPE_STARTER_YEAR_PRICE_ID=price_xxx
 *   STRIPE_PROFESSIONAL_MONTH_PRICE_ID=price_xxx
 *   STRIPE_PROFESSIONAL_YEAR_PRICE_ID=price_xxx
 *   STRIPE_BUSINESS_MONTH_PRICE_ID=price_xxx
 *   STRIPE_BUSINESS_YEAR_PRICE_ID=price_xxx
 *   STRIPE_OVERAGE_METERED_PRICE_ID=price_xxx
 */

require('dotenv').config();
const Stripe = require('stripe');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('ERROR: STRIPE_SECRET_KEY environment variable is required');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

// Plan configurations (prices in cents)
const PLANS = {
  starter: {
    name: 'Starter',
    description: 'For solopreneurs and small shops getting started with AI phone answering',
    monthlyPrice: 7900, // $79
    annualPrice: 80400, // $804/year ($67/mo)
    includedMinutes: 200,
    overageRate: 15, // $0.15/min
    features: [
      '200 minutes included/month',
      '24/7 AI phone answering',
      'Appointment scheduling',
      'Call recordings & transcripts',
      'Email notifications',
      'Basic analytics',
      '2 parallel calls',
    ],
  },
  professional: {
    name: 'Professional',
    description: 'For growing businesses with higher call volume',
    monthlyPrice: 14900, // $149
    annualPrice: 152400, // $1,524/year ($127/mo)
    includedMinutes: 500,
    overageRate: 12, // $0.12/min
    features: [
      '500 minutes included/month',
      '24/7 AI phone answering',
      'Appointment scheduling',
      'Call recordings & transcripts',
      'Email & SMS notifications',
      'Advanced analytics & reporting',
      '5 parallel calls',
      'CRM integrations (Zapier)',
      'Custom AI voice selection',
    ],
  },
  business: {
    name: 'Business',
    description: 'For busy practices and multi-location businesses',
    monthlyPrice: 29900, // $299
    annualPrice: 304800, // $3,048/year ($254/mo)
    includedMinutes: 1500,
    overageRate: 10, // $0.10/min
    features: [
      '1,500 minutes included/month',
      '24/7 AI phone answering',
      'Appointment scheduling',
      'Call recordings & transcripts',
      'Email & SMS notifications',
      'Advanced analytics & reporting',
      'Unlimited parallel calls',
      'CRM integrations (Zapier)',
      'Custom AI voice selection',
      'Priority support',
      'Dedicated account manager',
      'Custom integrations',
    ],
  },
};

async function createProduct(tier, config) {
  console.log(`\nCreating product: ${config.name}...`);
  
  const product = await stripe.products.create({
    name: `CRITON.AI ${config.name}`,
    description: config.description,
    metadata: {
      tier,
      includedMinutes: String(config.includedMinutes),
      overageRate: String(config.overageRate),
    },
    features: config.features.map(f => ({ name: f })),
  });
  
  console.log(`  Created product: ${product.id}`);
  return product;
}

async function createPrice(productId, tier, interval, amount, config) {
  console.log(`  Creating ${interval}ly price: $${(amount / 100).toFixed(2)}...`);
  
  const price = await stripe.prices.create({
    product: productId,
    currency: 'usd',
    unit_amount: amount,
    recurring: {
      interval: interval === 'month' ? 'month' : 'year',
    },
    metadata: {
      tier,
      planTier: tier,
      includedMinutes: String(config.includedMinutes),
    },
    nickname: `${config.name} ${interval === 'month' ? 'Monthly' : 'Annual'}`,
  });
  
  console.log(`    Created price: ${price.id}`);
  return price;
}

async function createOverageProduct() {
  console.log('\nCreating overage metered product...');
  
  // Check if product already exists
  const existingProducts = await stripe.products.list({ limit: 100 });
  let product = existingProducts.data.find(p => p.name === 'CRITON.AI Overage Minutes');
  
  if (product) {
    console.log(`  Using existing product: ${product.id}`);
  } else {
    product = await stripe.products.create({
      name: 'CRITON.AI Overage Minutes',
      description: 'Additional minutes beyond plan included amount',
      metadata: {
        type: 'overage',
      },
    });
    console.log(`  Created product: ${product.id}`);
  }
  
  // Create metered price (per minute)
  // We use a single price that works for all plans - the rate is the same ($0.12/min average)
  // In practice, you might want separate metered prices per tier
  console.log('  Creating metered price for overage minutes...');
  
  const price = await stripe.prices.create({
    product: product.id,
    currency: 'usd',
    unit_amount: 12, // $0.12 per minute (professional rate as default)
    recurring: {
      interval: 'month',
      usage_type: 'metered',
      aggregate_usage: 'sum',
    },
    metadata: {
      type: 'overage',
    },
    nickname: 'Overage Minutes',
  });
  
  console.log(`    Created metered price: ${price.id}`);
  return price;
}

async function main() {
  console.log('='.repeat(60));
  console.log('CRITON.AI Stripe Products & Prices Setup');
  console.log('='.repeat(60));
  console.log(`\nUsing Stripe key: ${STRIPE_SECRET_KEY.substring(0, 12)}...`);
  console.log(`Mode: ${STRIPE_SECRET_KEY.startsWith('sk_live') ? 'PRODUCTION' : 'TEST'}`);
  
  const results = {
    prices: {},
    overage: null,
  };
  
  try {
    // Create products and prices for each tier
    for (const [tier, config] of Object.entries(PLANS)) {
      const product = await createProduct(tier, config);
      
      const monthlyPrice = await createPrice(product.id, tier, 'month', config.monthlyPrice, config);
      const annualPrice = await createPrice(product.id, tier, 'year', config.annualPrice, config);
      
      results.prices[tier] = {
        productId: product.id,
        monthlyPriceId: monthlyPrice.id,
        annualPriceId: annualPrice.id,
      };
    }
    
    // Create overage metered product
    const overagePrice = await createOverageProduct();
    results.overage = overagePrice.id;
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('SETUP COMPLETE! Add these to your .env file:');
    console.log('='.repeat(60));
    
    console.log('\n# Stripe Price IDs for CRITON.AI Hybrid Pricing');
    for (const [tier, data] of Object.entries(results.prices)) {
      console.log(`STRIPE_${tier.toUpperCase()}_MONTH_PRICE_ID=${data.monthlyPriceId}`);
      console.log(`STRIPE_${tier.toUpperCase()}_YEAR_PRICE_ID=${data.annualPriceId}`);
    }
    console.log(`STRIPE_OVERAGE_METERED_PRICE_ID=${results.overage}`);
    
    console.log('\n# Default monthly price (for backward compatibility)');
    console.log(`STRIPE_MONTHLY_PRICE_ID=${results.prices.professional.monthlyPriceId}`);
    
    // Save to file for reference
    const fs = require('fs');
    const envContent = [
      '# Stripe Price IDs for CRITON.AI Hybrid Pricing',
      '# Generated by setup-stripe-products.js',
      `# Generated at: ${new Date().toISOString()}`,
      '',
      ...Object.entries(results.prices).flatMap(([tier, data]) => [
        `STRIPE_${tier.toUpperCase()}_MONTH_PRICE_ID=${data.monthlyPriceId}`,
        `STRIPE_${tier.toUpperCase()}_YEAR_PRICE_ID=${data.annualPriceId}`,
      ]),
      `STRIPE_OVERAGE_METERED_PRICE_ID=${results.overage}`,
      '',
      '# Default monthly price (for backward compatibility)',
      `STRIPE_MONTHLY_PRICE_ID=${results.prices.professional.monthlyPriceId}`,
      '',
    ].join('\n');
    
    fs.writeFileSync('stripe-prices.env', envContent);
    console.log('\n✅ Price IDs also saved to: stripe-prices.env');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.raw) {
      console.error('Stripe error:', error.raw);
    }
    process.exit(1);
  }
}

main();
