<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import Button from 'primevue/button'
import ToggleSwitch from 'primevue/toggleswitch'

const isAnnual = ref(false)

const plans = [
  {
    name: 'Starter',
    description: 'For solopreneurs and small shops getting started',
    monthlyPrice: 79,
    annualPrice: 67, // ~15% off
    includedMinutes: 200,
    overageRate: 0.15,
    features: [
      '200 minutes included/month',
      '24/7 AI phone answering',
      'Appointment scheduling',
      'Call recordings & transcripts',
      'Email notifications',
      'Basic analytics',
      '2 parallel calls',
    ],
    notIncluded: [
      'CRM integrations',
      'Advanced analytics',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    description: 'For growing businesses with higher call volume',
    monthlyPrice: 149,
    annualPrice: 127, // ~15% off
    includedMinutes: 500,
    overageRate: 0.12,
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
    notIncluded: [
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Business',
    description: 'For busy practices and multi-location businesses',
    monthlyPrice: 299,
    annualPrice: 254, // ~15% off
    includedMinutes: 1500,
    overageRate: 0.10,
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
    notIncluded: [],
    cta: 'Start Free Trial',
    popular: false,
  },
]

const faqs = [
  {
    question: 'What counts as a "minute"?',
    answer: 'Minutes are counted from when the AI picks up the call until the call ends. We round to the nearest second, not the nearest minute—so you only pay for what you actually use.',
  },
  {
    question: 'What happens if I go over my included minutes?',
    answer: 'You\'ll be charged the overage rate for any minutes beyond your plan\'s included amount. We\'ll send you alerts at 80% and 100% usage so there are no surprises. You can also upgrade your plan at any time.',
  },
  {
    question: 'Can I change plans later?',
    answer: 'Absolutely! You can upgrade or downgrade at any time. Upgrades take effect immediately, and downgrades take effect at your next billing cycle.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! All plans include a 15-day free trial with 100 minutes included. No credit card required to start.',
  },
  {
    question: 'What\'s included in the free trial?',
    answer: 'You get full access to all features of the Professional plan for 15 days, including 100 minutes of call time. This lets you test everything before committing.',
  },
  {
    question: 'Do unused minutes roll over?',
    answer: 'Minutes do not roll over to the next month. Each billing cycle starts fresh with your full allocation.',
  },
  {
    question: 'How do I cancel?',
    answer: 'You can cancel anytime from your dashboard. There are no contracts or cancellation fees. If you cancel, you\'ll retain access until the end of your current billing period.',
  },
]

const getPrice = (plan: typeof plans[0]) => {
  return isAnnual.value ? plan.annualPrice : plan.monthlyPrice
}

const getSavings = (plan: typeof plans[0]) => {
  const monthlyCost = plan.monthlyPrice * 12
  const annualCost = plan.annualPrice * 12
  return monthlyCost - annualCost
}
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white py-16 md:py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-6">
          Simple, Transparent Pricing
        </h1>
        <p class="text-xl text-violet-100 mb-8 max-w-3xl mx-auto">
          Professional AI phone answering at a fraction of the cost of hiring staff.
          Start with a 15-day free trial—no credit card required.
        </p>
        
        <!-- Billing Toggle -->
        <div class="flex items-center justify-center gap-4 mb-4">
          <span :class="['text-lg font-medium', !isAnnual ? 'text-white' : 'text-violet-200']">Monthly</span>
          <ToggleSwitch v-model="isAnnual" />
          <span :class="['text-lg font-medium', isAnnual ? 'text-white' : 'text-violet-200']">
            Annual
            <span class="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">Save 15%</span>
          </span>
        </div>
      </div>
    </section>

    <!-- Pricing Cards -->
    <section class="py-16 md:py-20 bg-gray-50 -mt-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-3 gap-8">
          <div 
            v-for="plan in plans" 
            :key="plan.name"
            :class="[
              'bg-white rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-105',
              plan.popular ? 'ring-2 ring-violet-500 relative' : ''
            ]"
          >
            <!-- Popular Badge -->
            <div v-if="plan.popular" class="bg-violet-500 text-white text-center py-2 text-sm font-medium">
              Most Popular
            </div>
            
            <div class="p-8">
              <!-- Plan Header -->
              <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ plan.name }}</h3>
              <p class="text-gray-600 mb-6">{{ plan.description }}</p>
              
              <!-- Price -->
              <div class="mb-6">
                <div class="flex items-baseline">
                  <span class="text-5xl font-bold text-gray-900">${{ getPrice(plan) }}</span>
                  <span class="text-gray-500 ml-2">/month</span>
                </div>
                <div v-if="isAnnual" class="text-green-600 text-sm mt-1">
                  Save ${{ getSavings(plan) }}/year
                </div>
                <div class="text-gray-500 text-sm mt-2">
                  {{ plan.includedMinutes }} minutes included
                  <span class="text-gray-400">• ${{ plan.overageRate.toFixed(2) }}/min overage</span>
                </div>
              </div>
              
              <!-- CTA Button -->
              <RouterLink to="/signup" class="block mb-8">
                <Button 
                  :label="plan.cta" 
                  :class="[
                    'w-full',
                    plan.popular ? '' : 'p-button-outlined'
                  ]"
                  size="large"
                />
              </RouterLink>
              
              <!-- Features -->
              <ul class="space-y-3">
                <li 
                  v-for="feature in plan.features" 
                  :key="feature"
                  class="flex items-start gap-3"
                >
                  <i class="pi pi-check text-green-500 mt-1"></i>
                  <span class="text-gray-700">{{ feature }}</span>
                </li>
                <li 
                  v-for="notIncluded in plan.notIncluded" 
                  :key="notIncluded"
                  class="flex items-start gap-3"
                >
                  <i class="pi pi-times text-gray-300 mt-1"></i>
                  <span class="text-gray-400">{{ notIncluded }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- Enterprise CTA -->
        <div class="mt-12 text-center">
          <p class="text-gray-600 mb-4">
            Need more than 1,500 minutes or custom features?
          </p>
          <a href="mailto:sales@criton.ai">
            <Button 
              label="Contact Sales for Enterprise Pricing" 
              severity="secondary"
              outlined
            />
          </a>
        </div>
      </div>
    </section>

    <!-- Usage Calculator -->
    <section class="py-16 md:py-20 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            Which Plan is Right for You?
          </h2>
          <p class="text-lg text-gray-600">
            Estimate your monthly usage to find the best fit
          </p>
        </div>
        
        <div class="bg-gray-50 rounded-2xl p-8">
          <div class="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div class="text-4xl font-bold text-violet-600 mb-2">~65</div>
              <div class="text-gray-600">calls/month</div>
              <div class="text-sm text-gray-500 mt-1">(~3 min avg)</div>
              <div class="mt-4 font-semibold text-gray-900">→ Starter</div>
            </div>
            <div>
              <div class="text-4xl font-bold text-violet-600 mb-2">~165</div>
              <div class="text-gray-600">calls/month</div>
              <div class="text-sm text-gray-500 mt-1">(~3 min avg)</div>
              <div class="mt-4 font-semibold text-gray-900">→ Professional</div>
            </div>
            <div>
              <div class="text-4xl font-bold text-violet-600 mb-2">~500</div>
              <div class="text-gray-600">calls/month</div>
              <div class="text-sm text-gray-500 mt-1">(~3 min avg)</div>
              <div class="mt-4 font-semibold text-gray-900">→ Business</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Cost Comparison -->
    <section class="py-16 md:py-20 bg-gray-50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            Compare the Savings
          </h2>
        </div>
        
        <div class="grid md:grid-cols-2 gap-8">
          <!-- Employee Cost -->
          <div class="bg-red-50 rounded-xl p-6 border-2 border-red-200">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <i class="pi pi-user text-2xl text-red-500"></i>
              </div>
              <h4 class="text-lg font-semibold text-gray-900">Full-Time Receptionist</h4>
            </div>
            <div class="space-y-2 text-gray-700 mb-4">
              <p class="flex justify-between">
                <span>Salary + Benefits</span>
                <span>$3,500+/mo</span>
              </p>
              <p class="flex justify-between">
                <span>Coverage</span>
                <span>40 hrs/week</span>
              </p>
              <p class="flex justify-between">
                <span>After hours</span>
                <span class="text-red-500">Not covered</span>
              </p>
            </div>
            <div class="border-t border-red-200 pt-4">
              <p class="flex justify-between items-center">
                <span class="font-semibold">Annual cost</span>
                <span class="text-2xl font-bold text-red-600">$42,000+</span>
              </p>
            </div>
          </div>

          <!-- CRITON.AI Cost -->
          <div class="bg-green-50 rounded-xl p-6 border-2 border-green-200">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i class="pi pi-bolt text-2xl text-green-500"></i>
              </div>
              <h4 class="text-lg font-semibold text-gray-900">CRITON.AI Professional</h4>
            </div>
            <div class="space-y-2 text-gray-700 mb-4">
              <p class="flex justify-between">
                <span>Monthly fee</span>
                <span>$149/mo</span>
              </p>
              <p class="flex justify-between">
                <span>Coverage</span>
                <span class="text-green-600">24/7/365</span>
              </p>
              <p class="flex justify-between">
                <span>After hours</span>
                <span class="text-green-600">✓ Included</span>
              </p>
            </div>
            <div class="border-t border-green-200 pt-4">
              <p class="flex justify-between items-center">
                <span class="font-semibold">Annual cost</span>
                <span class="text-2xl font-bold text-green-600">$1,788</span>
              </p>
            </div>
          </div>
        </div>
        
        <div class="mt-8 text-center">
          <div class="inline-block bg-violet-100 text-violet-700 rounded-full px-6 py-3 text-lg font-semibold">
            Save over $40,000/year with CRITON.AI
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-16 md:py-20 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
        </div>
        
        <div class="space-y-6">
          <div 
            v-for="faq in faqs" 
            :key="faq.question"
            class="bg-gray-50 rounded-xl p-6"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ faq.question }}</h3>
            <p class="text-gray-600">{{ faq.answer }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="py-16 md:py-20 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">
          Ready to Never Miss a Call Again?
        </h2>
        <p class="text-lg text-violet-100 mb-8 max-w-2xl mx-auto">
          Start your 15-day free trial today. No credit card required.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <RouterLink to="/signup">
            <Button
              label="Start Free Trial"
              icon="pi pi-arrow-right"
              icon-pos="right"
              size="large"
              class="px-8 py-3 !bg-white !text-violet-600 hover:!bg-violet-50"
            />
          </RouterLink>
          <a href="tel:14242839238">
            <Button
              label="Call Our Demo Line"
              icon="pi pi-phone"
              severity="secondary"
              outlined
              size="large"
              class="px-8 py-3 !text-white !border-white hover:!bg-white/10"
            />
          </a>
        </div>
      </div>
    </section>
  </div>
</template>
