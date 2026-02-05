<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { loadStripe } from '@stripe/stripe-js'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressBar from 'primevue/progressbar'
import api from '@/services/api'

interface Subscription {
  id: string
  tenantId: string
  status: string
  planTier: string
  planName: string
  billingInterval: string | null
  includedMinutes: number
  currentPeriodMinutesUsed: number
  remainingMinutes: number
  usagePercentage: number
  overageMinutes: number
  overageRate: number
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  canceledAt: string | null
  trialStart: string | null
  trialEnd: string | null
  isActive: boolean
  isInactive: boolean
  hasAccess: boolean
  hasUnlimitedMinutes: boolean
}

interface Plan {
  id: string
  name: string
  monthlyPrice: number
  annualPrice: number
  monthlyPriceFormatted: string
  annualPriceFormatted: string
  annualMonthlyPriceFormatted: string
  includedMinutes: number
  includedMinutesFormatted: string
  overageRate: number
  overageRateFormatted: string
  parallelCalls: number
  popular?: boolean
}

interface Usage {
  planTier: string
  planName: string
  periodStart: string
  periodEnd: string
  includedMinutes: number | string
  minutesUsed: number
  remainingMinutes: number
  usagePercentage: number
  overageMinutes: number
  overageRate: number
  estimatedOverageCharge: number
  hasUnlimitedMinutes: boolean
}

const loading = ref(false)
const error = ref('')
const subscription = ref<Subscription | null>(null)
const availablePlans = ref<Plan[]>([])
const trialDays = ref(15)
const trialMinutes = ref(100)
const processingCheckout = ref(false)
const usage = ref<Usage | null>(null)
const loadingUsage = ref(false)

const isTrialing = computed(() => {
  return subscription.value?.status === 'trialing'
})

const isInactive = computed(() => {
  return subscription.value?.isInactive || false
})

const subscriptionStatusLabel = computed(() => {
  if (!subscription.value) return 'No subscription'
  
  const status = subscription.value.status
  const statusLabels: Record<string, string> = {
    trialing: 'Free Trial',
    active: 'Active',
    past_due: 'Past Due',
    canceled: 'Cancelled',
    unpaid: 'Unpaid',
    incomplete: 'Incomplete',
    incomplete_expired: 'Expired',
    inactive: 'Inactive'
  }
  
  return statusLabels[status] || status
})

const usageProgressColor = computed(() => {
  if (!subscription.value || subscription.value.hasUnlimitedMinutes) return 'bg-green-500'
  const percentage = subscription.value.usagePercentage
  if (percentage >= 100) return 'bg-red-500'
  if (percentage >= 80) return 'bg-yellow-500'
  return 'bg-green-500'
})

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    trialing: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    past_due: 'bg-yellow-100 text-yellow-700',
    canceled: 'bg-red-100 text-red-700',
    unpaid: 'bg-red-100 text-red-700',
    incomplete: 'bg-yellow-100 text-yellow-700',
    incomplete_expired: 'bg-red-100 text-red-700',
    inactive: 'bg-gray-100 text-gray-700'
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

async function fetchSubscription() {
  try {
    loading.value = true
    error.value = ''
    
    const response = await api.get('/api/billing/subscription')
    
    if (response.data.success) {
      subscription.value = response.data.data.subscription
      availablePlans.value = response.data.data.plans || []
      trialDays.value = response.data.data.trialDays || 15
      trialMinutes.value = response.data.data.trialMinutes || 100
    }
  } catch (err: unknown) {
    console.error('Failed to fetch subscription:', err)
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosError = err as { response?: { data?: { error?: string } } }
      error.value = axiosError.response?.data?.error || 'Failed to load subscription information'
    } else {
      error.value = 'Failed to load subscription information'
    }
  } finally {
    loading.value = false
  }
}

async function fetchUsage() {
  try {
    loadingUsage.value = true
    const response = await api.get('/api/billing/usage')
    if (response.data.success) {
      usage.value = response.data.data
    }
  } catch (err) {
    console.error('Failed to fetch usage:', err)
  } finally {
    loadingUsage.value = false
  }
}

async function openStripePortal() {
  try {
    processingCheckout.value = true
    error.value = ''
    
    const returnUrl = window.location.href
    const response = await api.post('/api/billing/portal-session', { returnUrl })
    
    if (response.data.success && response.data.data.url) {
      window.location.href = response.data.data.url
    }
  } catch (err: unknown) {
    console.error('Failed to open portal:', err)
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosError = err as { response?: { data?: { error?: string } } }
      error.value = axiosError.response?.data?.error || 'Failed to open billing portal'
    } else {
      error.value = 'Failed to open billing portal'
    }
    processingCheckout.value = false
  }
}

async function startCheckout(planTier: string = 'professional', billingInterval: string = 'month') {
  try {
    processingCheckout.value = true
    error.value = ''
    
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_live_51SlETHAhAXdJy2WMmvdaD3n92qfJEsRNyH03LcLOofXsf4IcHSBWUhoaGXUL6UgM7LJ6rxykQj7uAMWMBqkSQDqw00rWur2gNX'
    if (!stripeKey) {
      error.value = 'Stripe is not configured. Please contact support.'
      processingCheckout.value = false
      return
    }
    
    const successUrl = `${window.location.origin}/app/billing?success=true`
    const cancelUrl = `${window.location.origin}/app/billing?cancelled=true`
    
    const response = await api.post('/api/billing/create-checkout-session', {
      planTier,
      billingInterval,
      successUrl,
      cancelUrl
    })
    
    if (response.data.success && response.data.data.sessionId) {
      const stripe = await loadStripe(stripeKey)
      
      if (!stripe) {
        error.value = 'Failed to load Stripe. Please refresh and try again.'
        processingCheckout.value = false
        return
      }
      
      const result = await (stripe as any).redirectToCheckout({
        sessionId: response.data.data.sessionId
      })
      
      if (result && result.error) {
        error.value = result.error.message || 'Failed to redirect to checkout'
        processingCheckout.value = false
      }
    }
  } catch (err: unknown) {
    console.error('Failed to start checkout:', err)
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosError = err as { response?: { data?: { error?: string } } }
      error.value = axiosError.response?.data?.error || 'Failed to start checkout'
    } else {
      error.value = 'Failed to start checkout'
    }
    processingCheckout.value = false
  }
}

onMounted(async () => {
  await fetchSubscription()
  
  // Fetch usage if subscribed
  if (subscription.value?.isActive) {
    await fetchUsage()
  }
  
  // Check for success/cancelled query params
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('success') === 'true') {
    await fetchSubscription()
    await fetchUsage()
  } else if (urlParams.get('cancelled') === 'true') {
    error.value = 'Checkout was cancelled'
  }
  
  // Clean up URL
  if (urlParams.has('success') || urlParams.has('cancelled')) {
    window.history.replaceState({}, '', window.location.pathname)
  }
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
      <p class="text-gray-600 mt-1">Manage your subscription plan and track usage</p>
    </div>

    <Message v-if="error" severity="error" class="mb-6">{{ error }}</Message>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <i class="pi pi-spin pi-spinner text-4xl text-violet-600"></i>
      <p class="text-gray-600 mt-4">Loading subscription information...</p>
    </div>

    <!-- No Subscription / Inactive - Show Plan Selection -->
    <div v-else-if="!subscription || isInactive">
      <Card class="shadow-sm mb-6">
        <template #title>Choose Your Plan</template>
        <template #content>
          <div class="text-center mb-8">
            <h3 class="text-xl font-bold text-gray-900 mb-2">
              {{ isInactive ? 'Your trial has ended' : 'Start your subscription' }}
            </h3>
            <p class="text-gray-600">
              {{ isInactive ? 'Subscribe now to continue using CRITON.AI.' : 'Choose the plan that fits your business needs.' }}
            </p>
          </div>
          
          <div class="grid md:grid-cols-3 gap-6">
            <div 
              v-for="plan in availablePlans" 
              :key="plan.id"
              :class="[
                'border-2 rounded-xl p-6 relative transition-all hover:shadow-lg',
                plan.popular ? 'border-violet-500' : 'border-gray-200'
              ]"
            >
              <div v-if="plan.popular" class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-violet-500 text-white text-xs px-3 py-1 rounded-full">
                Most Popular
              </div>
              
              <h3 class="text-xl font-bold text-gray-900 mb-1">{{ plan.name }}</h3>
              <div class="mb-4">
                <span class="text-3xl font-bold text-gray-900">{{ plan.monthlyPriceFormatted }}</span>
                <span class="text-gray-500">/month</span>
              </div>
              
              <ul class="space-y-2 mb-6 text-sm">
                <li class="flex items-center text-gray-600">
                  <i class="pi pi-check text-green-500 mr-2"></i>
                  {{ plan.includedMinutesFormatted }} minutes included
                </li>
                <li class="flex items-center text-gray-600">
                  <i class="pi pi-check text-green-500 mr-2"></i>
                  {{ plan.overageRateFormatted }}/min overage
                </li>
                <li class="flex items-center text-gray-600">
                  <i class="pi pi-check text-green-500 mr-2"></i>
                  {{ plan.parallelCalls === -1 ? 'Unlimited' : plan.parallelCalls }} parallel calls
                </li>
              </ul>
              
              <Button
                :label="plan.popular ? 'Get Started' : 'Select'"
                :class="plan.popular ? 'w-full' : 'w-full p-button-outlined'"
                :loading="processingCheckout"
                @click="startCheckout(plan.id, 'month')"
              />
            </div>
          </div>
          
          <p class="text-center text-sm text-gray-500 mt-6">
            All plans include a {{ trialDays }}-day free trial with {{ trialMinutes }} minutes. No credit card required to start.
          </p>
        </template>
      </Card>
    </div>

    <!-- Active/Trial Subscription -->
    <div v-else class="space-y-6">
      <!-- Usage Overview Card -->
      <Card class="shadow-sm">
        <template #title>
          <div class="flex items-center justify-between">
            <span>Usage This Period</span>
            <span :class="['px-3 py-1 rounded-full text-sm font-medium', getStatusColor(subscription.status)]">
              {{ subscriptionStatusLabel }}
            </span>
          </div>
        </template>
        <template #content>
          <!-- Trial Info -->
          <div v-if="isTrialing" class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-start">
              <i class="pi pi-info-circle text-blue-600 text-xl mr-3 mt-0.5"></i>
              <div>
                <h4 class="font-medium text-blue-900 mb-1">Free Trial Active</h4>
                <p class="text-sm text-blue-700">
                  Your {{ trialDays }}-day free trial ends on {{ formatDate(subscription.trialEnd) }}.
                  You have {{ trialMinutes }} minutes included during the trial.
                </p>
              </div>
            </div>
          </div>
          
          <!-- Usage Meter -->
          <div v-if="!subscription.hasUnlimitedMinutes" class="mb-6">
            <div class="flex justify-between mb-2">
              <span class="text-gray-600">Minutes Used</span>
              <span class="font-medium">
                {{ subscription.currentPeriodMinutesUsed }} / {{ subscription.includedMinutes }}
                <span class="text-gray-500">({{ subscription.usagePercentage }}%)</span>
              </span>
            </div>
            <ProgressBar 
              :value="Math.min(subscription.usagePercentage, 100)" 
              :showValue="false"
              :class="usageProgressColor"
              style="height: 10px"
            />
            <div class="flex justify-between mt-2 text-sm">
              <span class="text-gray-500">
                {{ subscription.remainingMinutes }} minutes remaining
              </span>
              <span v-if="subscription.overageMinutes > 0" class="text-orange-600">
                {{ subscription.overageMinutes }} overage minutes @ ${{ (subscription.overageRate / 100).toFixed(2) }}/min
              </span>
            </div>
          </div>
          
          <!-- Unlimited indicator -->
          <div v-else class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex items-center">
              <i class="pi pi-check-circle text-green-600 text-xl mr-3"></i>
              <div>
                <h4 class="font-medium text-green-900">Unlimited Minutes</h4>
                <p class="text-sm text-green-700">
                  You have unlimited call minutes on your current plan.
                  Used this period: {{ subscription.currentPeriodMinutesUsed }} minutes
                </p>
              </div>
            </div>
          </div>
          
          <!-- Period Info -->
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500">Current Period</span>
              <p class="font-medium">{{ formatDate(subscription.currentPeriodStart) }} - {{ formatDate(subscription.currentPeriodEnd) }}</p>
            </div>
            <div class="text-right">
              <span class="text-gray-500">Plan</span>
              <p class="font-medium">{{ subscription.planName }} ({{ subscription.billingInterval === 'year' ? 'Annual' : 'Monthly' }})</p>
            </div>
          </div>
        </template>
      </Card>

      <!-- Subscription Details Card -->
      <Card class="shadow-sm">
        <template #title>Subscription Details</template>
        <template #content>
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <h4 class="font-medium text-gray-900 mb-3">Current Plan: {{ subscription.planName }}</h4>
              <ul class="space-y-2 text-sm text-gray-600">
                <li class="flex items-center">
                  <i class="pi pi-check text-green-500 mr-2"></i>
                  {{ subscription.hasUnlimitedMinutes ? 'Unlimited' : subscription.includedMinutes }} minutes/month
                </li>
                <li class="flex items-center">
                  <i class="pi pi-check text-green-500 mr-2"></i>
                  24/7 AI phone answering
                </li>
                <li class="flex items-center">
                  <i class="pi pi-check text-green-500 mr-2"></i>
                  Appointment scheduling
                </li>
                <li class="flex items-center">
                  <i class="pi pi-check text-green-500 mr-2"></i>
                  Call recordings & transcripts
                </li>
              </ul>
            </div>
            
            <div class="text-right">
              <div v-if="subscription.cancelAtPeriodEnd" class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                <p class="text-sm text-yellow-700">
                  <i class="pi pi-exclamation-triangle mr-1"></i>
                  Your subscription will end on {{ formatDate(subscription.currentPeriodEnd) }}
                </p>
              </div>
              
              <Button
                label="Manage Subscription"
                icon="pi pi-external-link"
                :loading="processingCheckout"
                @click="openStripePortal"
              />
              <p class="text-xs text-gray-500 mt-2">
                Change plan, update payment, or cancel
              </p>
            </div>
          </div>
        </template>
      </Card>

      <!-- Overage Warning -->
      <Message v-if="subscription.overageMinutes > 0" severity="warn">
        <strong>Overage Alert:</strong> You've used {{ subscription.overageMinutes }} minutes beyond your included amount.
        Estimated overage charge: ${{ ((subscription.overageMinutes * subscription.overageRate) / 100).toFixed(2) }}.
        Consider upgrading to a higher plan for more included minutes at a lower overage rate.
      </Message>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-progressbar) {
  border-radius: 9999px;
}
:deep(.p-progressbar-value) {
  border-radius: 9999px;
}
</style>

