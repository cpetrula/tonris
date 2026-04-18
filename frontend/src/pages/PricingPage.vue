<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const isAnnual = ref(false)

const sharedFeatures = [
  '24/7 AI phone answering',
  'Appointment scheduling',
  'Call recordings & transcripts',
  'Email & SMS notifications',
  'Analytics & reporting',
  'Custom AI voice selection',
]

const plans = [
  {
    name: 'Starter',
    description: 'For solopreneurs and small shops getting started',
    monthlyPrice: 79,
    annualPrice: 67,
    includedMinutes: 200,
    overageRate: 0.15,
    features: [
      '200 minutes included/month',
      '$0.15/min overage',
      ...sharedFeatures,
    ],
    popular: false,
  },
  {
    name: 'Professional',
    description: 'For growing businesses with higher call volume',
    monthlyPrice: 149,
    annualPrice: 127,
    includedMinutes: 500,
    overageRate: 0.12,
    features: [
      '500 minutes included/month',
      '$0.12/min overage',
      ...sharedFeatures,
    ],
    popular: true,
  },
  {
    name: 'Business',
    description: 'For busy practices and multi-location businesses',
    monthlyPrice: 299,
    annualPrice: 254,
    includedMinutes: 1500,
    overageRate: 0.10,
    features: [
      '1,500 minutes included/month',
      '$0.10/min overage',
      ...sharedFeatures,
    ],
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
    answer: 'You\'ll be charged the overage rate for any minutes beyond your plan\'s included amount. We\'ll send you alerts at 80% and 100% usage so there are no surprises.',
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
    question: 'Do unused minutes roll over?',
    answer: 'Minutes do not roll over to the next month. Each billing cycle starts fresh with your full allocation.',
  },
  {
    question: 'How do I cancel?',
    answer: 'You can cancel anytime from your dashboard. There are no contracts or cancellation fees.',
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
  <div class="bg-[color:var(--criton-bg)] text-[color:var(--criton-text)]">
    <!-- HERO -->
    <section class="criton-hero-bg relative overflow-hidden">
      <div class="max-w-6xl mx-auto px-6 lg:px-8 pt-28 pb-16 md:pt-36 md:pb-20 text-center">
        <div class="criton-pill mb-8">Transparent Pricing</div>
        <h1
          class="font-display font-bold text-4xl md:text-6xl lg:text-7xl leading-[1.08] tracking-tight mb-7 max-w-4xl mx-auto"
        >
          Simple,<br />
          <span class="italic criton-accent">fair pricing.</span>
        </h1>
        <p
          class="text-lg md:text-xl text-[color:var(--criton-text-muted)] max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Professional AI phone answering at a fraction of the cost of hiring staff.
          Start with a 15-day free trial—no credit card required.
        </p>
        
        <!-- Billing Toggle -->
        <div class="flex items-center justify-center gap-4">
          <span :class="['text-base font-medium', !isAnnual ? 'text-[color:var(--criton-ivory)]' : 'text-[color:var(--criton-text-muted)]']">Monthly</span>
          <button
            @click="isAnnual = !isAnnual"
            :class="[
              'relative w-14 h-7 rounded-full transition-colors',
              isAnnual ? 'bg-[color:var(--criton-gold)]' : 'bg-[color:var(--criton-surface-2)] border border-[color:var(--criton-border)]'
            ]"
          >
            <span
              :class="[
                'absolute top-1 w-5 h-5 rounded-full transition-transform',
                isAnnual ? 'translate-x-8 bg-[color:var(--criton-bg)]' : 'translate-x-1 bg-[color:var(--criton-text-muted)]'
              ]"
            ></span>
          </button>
          <span :class="['text-base font-medium', isAnnual ? 'text-[color:var(--criton-ivory)]' : 'text-[color:var(--criton-text-muted)]']">
            Annual
            <span class="ml-2 bg-[color:var(--criton-gold)] text-[color:var(--criton-bg)] text-xs px-2 py-1 rounded-full font-semibold">Save 15%</span>
          </span>
        </div>
      </div>
    </section>

    <!-- PRICING CARDS -->
    <section class="py-16 md:py-24 border-t border-[color:var(--criton-border)]">
      <div class="max-w-6xl mx-auto px-6 lg:px-8">
        <div class="grid md:grid-cols-3 gap-6">
          <div 
            v-for="plan in plans" 
            :key="plan.name"
            :class="[
              'criton-card rounded-xl overflow-hidden relative',
              plan.popular ? 'ring-2 ring-[color:var(--criton-gold)]' : ''
            ]"
          >
            <!-- Popular Badge -->
            <div v-if="plan.popular" class="bg-[color:var(--criton-gold)] text-[color:var(--criton-bg)] text-center py-2 text-sm font-semibold tracking-wide">
              Most Popular
            </div>
            
            <div class="p-8">
              <!-- Plan Header -->
              <h3 class="font-display text-2xl font-bold text-[color:var(--criton-ivory)] mb-2">{{ plan.name }}</h3>
              <p class="text-[color:var(--criton-text-muted)] text-sm mb-6">{{ plan.description }}</p>
              
              <!-- Price -->
              <div class="mb-6">
                <div class="flex items-baseline">
                  <span class="font-display text-5xl font-bold text-[color:var(--criton-ivory)]">${{ getPrice(plan) }}</span>
                  <span class="text-[color:var(--criton-text-muted)] ml-2">/month</span>
                </div>
                <div v-if="isAnnual" class="text-[color:var(--criton-gold)] text-sm mt-1">
                  Save ${{ getSavings(plan) }}/year
                </div>
                <div class="text-[color:var(--criton-text-dim)] text-sm mt-2">
                  {{ plan.includedMinutes }} minutes included
                </div>
              </div>
              
              <!-- CTA Button -->
              <RouterLink 
                to="/signup" 
                :class="plan.popular ? 'criton-btn-primary w-full justify-center mb-8' : 'criton-btn-ghost w-full justify-center mb-8'"
              >
                Start Free Trial
              </RouterLink>
              
              <!-- Features -->
              <ul class="space-y-3">
                <li 
                  v-for="feature in plan.features" 
                  :key="feature"
                  class="flex items-start gap-3"
                >
                  <i class="pi pi-check text-[color:var(--criton-gold)] mt-0.5"></i>
                  <span class="text-sm text-[color:var(--criton-text-muted)]">{{ feature }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- Enterprise CTA -->
        <div class="mt-12 text-center">
          <p class="text-[color:var(--criton-text-muted)] mb-4">
            Need more than 1,500 minutes or custom features?
          </p>
          <a href="mailto:sales@criton.ai" class="criton-btn-ghost">
            Contact Sales
            <i class="pi pi-arrow-right text-xs"></i>
          </a>
        </div>
      </div>
    </section>

    <!-- USAGE CALCULATOR -->
    <section class="py-16 md:py-24 border-t border-[color:var(--criton-border)] bg-[color:var(--criton-surface)]">
      <div class="max-w-4xl mx-auto px-6 lg:px-8">
        <div class="text-center mb-12">
          <p class="criton-eyebrow mb-4">Plan Guide</p>
          <h2 class="font-display font-bold text-3xl md:text-4xl leading-tight">
            Which Plan is<br />
            <span class="italic text-[color:var(--criton-text-muted)]">Right for You?</span>
          </h2>
        </div>
        
        <div class="criton-card rounded-xl p-8">
          <div class="grid md:grid-cols-3 gap-8 text-center">
            <div class="p-4">
              <div class="font-display text-4xl font-bold text-[color:var(--criton-gold)] mb-2">~65</div>
              <div class="text-[color:var(--criton-text-muted)]">calls/month</div>
              <div class="text-sm text-[color:var(--criton-text-dim)] mt-1">(~3 min avg)</div>
              <div class="mt-4 font-semibold text-[color:var(--criton-ivory)]">→ Starter</div>
            </div>
            <div class="p-4 border-x border-[color:var(--criton-border)]">
              <div class="font-display text-4xl font-bold text-[color:var(--criton-gold)] mb-2">~165</div>
              <div class="text-[color:var(--criton-text-muted)]">calls/month</div>
              <div class="text-sm text-[color:var(--criton-text-dim)] mt-1">(~3 min avg)</div>
              <div class="mt-4 font-semibold text-[color:var(--criton-ivory)]">→ Professional</div>
            </div>
            <div class="p-4">
              <div class="font-display text-4xl font-bold text-[color:var(--criton-gold)] mb-2">~500</div>
              <div class="text-[color:var(--criton-text-muted)]">calls/month</div>
              <div class="text-sm text-[color:var(--criton-text-dim)] mt-1">(~3 min avg)</div>
              <div class="mt-4 font-semibold text-[color:var(--criton-ivory)]">→ Business</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- COST COMPARISON -->
    <section class="py-16 md:py-24 border-t border-[color:var(--criton-border)]">
      <div class="max-w-4xl mx-auto px-6 lg:px-8">
        <div class="text-center mb-12">
          <p class="criton-eyebrow mb-4">The Math</p>
          <h2 class="font-display font-bold text-3xl md:text-4xl leading-tight">
            Compare the<br />
            <span class="italic text-[color:var(--criton-text-muted)]">Savings</span>
          </h2>
        </div>
        
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Employee Cost -->
          <div class="rounded-xl p-6 border-2 border-red-500/30 bg-red-500/5">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center">
                <i class="pi pi-user text-2xl text-red-400"></i>
              </div>
              <h4 class="font-display text-lg font-semibold text-[color:var(--criton-ivory)]">Full-Time Receptionist</h4>
            </div>
            <div class="space-y-2 text-[color:var(--criton-text-muted)] mb-4">
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
                <span class="text-red-400">Not covered</span>
              </p>
            </div>
            <div class="border-t border-red-500/30 pt-4">
              <p class="flex justify-between items-center">
                <span class="font-semibold text-[color:var(--criton-ivory)]">Annual cost</span>
                <span class="font-display text-2xl font-bold text-red-400">$42,000+</span>
              </p>
            </div>
          </div>

          <!-- Criton Cost -->
          <div class="rounded-xl p-6 border-2 border-[color:var(--criton-gold)]/30 bg-[color:var(--criton-gold)]/5">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 bg-[color:var(--criton-gold)]/10 border border-[color:var(--criton-gold)]/30 rounded-full flex items-center justify-center">
                <i class="pi pi-bolt text-2xl text-[color:var(--criton-gold)]"></i>
              </div>
              <h4 class="font-display text-lg font-semibold text-[color:var(--criton-ivory)]">Criton.ai Professional</h4>
            </div>
            <div class="space-y-2 text-[color:var(--criton-text-muted)] mb-4">
              <p class="flex justify-between">
                <span>Monthly fee</span>
                <span>$149/mo</span>
              </p>
              <p class="flex justify-between">
                <span>Coverage</span>
                <span class="text-[color:var(--criton-gold)]">24/7/365</span>
              </p>
              <p class="flex justify-between">
                <span>After hours</span>
                <span class="text-[color:var(--criton-gold)]">✓ Included</span>
              </p>
            </div>
            <div class="border-t border-[color:var(--criton-gold)]/30 pt-4">
              <p class="flex justify-between items-center">
                <span class="font-semibold text-[color:var(--criton-ivory)]">Annual cost</span>
                <span class="font-display text-2xl font-bold text-[color:var(--criton-gold)]">$1,788</span>
              </p>
            </div>
          </div>
        </div>
        
        <div class="mt-8 text-center">
          <div class="inline-block bg-[color:var(--criton-gold)]/10 border border-[color:var(--criton-gold)]/30 text-[color:var(--criton-gold)] rounded-full px-6 py-3 font-semibold">
            Save over $40,000/year with Criton.ai
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="py-16 md:py-24 border-t border-[color:var(--criton-border)] bg-[color:var(--criton-surface)]">
      <div class="max-w-4xl mx-auto px-6 lg:px-8">
        <div class="text-center mb-12">
          <p class="criton-eyebrow mb-4">FAQ</p>
          <h2 class="font-display font-bold text-3xl md:text-4xl leading-tight">
            Common<br />
            <span class="italic text-[color:var(--criton-text-muted)]">Questions</span>
          </h2>
        </div>
        
        <div class="space-y-4">
          <div 
            v-for="faq in faqs" 
            :key="faq.question"
            class="criton-card rounded-xl p-6"
          >
            <h3 class="font-display text-lg font-semibold text-[color:var(--criton-ivory)] mb-2">{{ faq.question }}</h3>
            <p class="text-[color:var(--criton-text-muted)] leading-relaxed">{{ faq.answer }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="relative overflow-hidden border-t border-[color:var(--criton-border)]">
      <div class="criton-hero-bg absolute inset-0 opacity-60"></div>
      <div class="relative max-w-4xl mx-auto px-6 lg:px-8 py-24 md:py-32 text-center">
        <h2 class="font-display font-bold text-3xl md:text-5xl leading-tight mb-6">
          Ready to never miss<br />
          <span class="italic criton-accent">a call again?</span>
        </h2>
        <p class="text-lg text-[color:var(--criton-text-muted)] max-w-xl mx-auto mb-10">
          Start your 15-day free trial today. No credit card required.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <RouterLink to="/signup" class="criton-btn-primary">
            Start Free Trial
            <i class="pi pi-arrow-right text-xs"></i>
          </RouterLink>
          <a href="tel:14242839238" class="criton-btn-ghost">
            <i class="pi pi-phone text-xs"></i>
            Call Our Demo Line
          </a>
        </div>
      </div>
    </section>
  </div>
</template>
