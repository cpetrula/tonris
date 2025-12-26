<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { loadStripe } from '@stripe/stripe-js'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Message from 'primevue/message'
import api from '@/services/api'

interface Subscription {
  id: string
  tenantId: string
  status: string
  billingInterval: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  canceledAt: string | null
  trialStart: string | null
  trialEnd: string | null
  isActive: boolean
  isInactive: boolean
  hasAccess: boolean
}

interface Plan {
  id: string
  name: string
  price: number
  priceFormatted: string
  interval: string
  intervalLabel: string
}

const loading = ref(false)
const error = ref('')
const subscription = ref<Subscription | null>(null)
const availablePlans = ref<Plan[]>([])
const trialDays = ref(15)
const processingCheckout = ref(false)

const hasActiveSubscription = computed(() => {
  return subscription.value?.isActive || false
})

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

const subscriptionPrice = computed(() => {
  if (!subscription.value || !availablePlans.value.length) return 295
  return availablePlans.value[0].price / 100
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
      availablePlans.value = response.data.data.plans.monthly ? [response.data.data.plans.monthly] : []
      trialDays.value = response.data.data.trialDays || 15
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

async function startCheckout() {
  try {
    processingCheckout.value = true
    error.value = ''
    
    const successUrl = `${window.location.origin}/app/billing?success=true`
    const cancelUrl = `${window.location.origin}/app/billing?cancelled=true`
    
    const response = await api.post('/api/billing/create-checkout-session', {
      billingInterval: 'month',
      successUrl,
      cancelUrl
    })
    
    if (response.data.success && response.data.data.sessionId) {
      // Note: In a real implementation, you would need to get your Stripe publishable key
      // from environment variables or backend configuration
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')
      
      if (stripe) {
        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId: response.data.data.sessionId
        })
        
        if (stripeError) {
          error.value = stripeError.message || 'Failed to redirect to checkout'
          processingCheckout.value = false
        }
      } else {
        error.value = 'Stripe is not configured'
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
  
  // Check for success/cancelled query params
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('success') === 'true') {
    // Refresh subscription data after successful payment
    await fetchSubscription()
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
      <p class="text-gray-600 mt-1">Manage your subscription plan and payment methods</p>
    </div>

    <Message v-if="error" severity="error" class="mb-6">{{ error }}</Message>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <i class="pi pi-spin pi-spinner text-4xl text-violet-600"></i>
      <p class="text-gray-600 mt-4">Loading subscription information...</p>
    </div>

    <!-- No Subscription / Inactive -->
    <div v-else-if="!subscription || isInactive">
      <Card class="shadow-sm">
        <template #title>Start Your Subscription</template>
        <template #content>
          <div class="text-center py-8">
            <i class="pi pi-credit-card text-6xl text-gray-300 mb-4"></i>
            <h3 class="text-xl font-bold text-gray-900 mb-2">No Active Subscription</h3>
            <p class="text-gray-600 mb-6">
              {{ isInactive ? 'Your trial has ended. Subscribe now to continue using TONRIS.' : 'Subscribe to get started with TONRIS AI Assistant.' }}
            </p>
            
            <div class="max-w-md mx-auto">
              <div class="border-2 rounded-xl p-6 mb-6">
                <h3 class="text-xl font-bold text-gray-900 mb-1">Monthly Plan</h3>
                <p class="text-gray-500 text-sm mb-4">Cancel anytime. No long-term contracts required.</p>

                <div class="mb-4">
                  <span class="text-3xl font-bold text-gray-900">${{ subscriptionPrice }}</span>
                  <span class="text-gray-500">/month</span>
                </div>

                <ul class="space-y-2 mb-6 text-left">
                  <li class="flex items-start text-sm text-gray-600">
                    <i class="pi pi-check text-green-500 mr-2 mt-0.5"></i>
                    Unlimited calls
                  </li>
                  <li class="flex items-start text-sm text-gray-600">
                    <i class="pi pi-check text-green-500 mr-2 mt-0.5"></i>
                    24/7 AI answering
                  </li>
                  <li class="flex items-start text-sm text-gray-600">
                    <i class="pi pi-check text-green-500 mr-2 mt-0.5"></i>
                    Appointment booking
                  </li>
                  <li class="flex items-start text-sm text-gray-600">
                    <i class="pi pi-check text-green-500 mr-2 mt-0.5"></i>
                    Calendar integration
                  </li>
                  <li class="flex items-start text-sm text-gray-600">
                    <i class="pi pi-check text-green-500 mr-2 mt-0.5"></i>
                    Email notifications
                  </li>
                  <li class="flex items-start text-sm text-gray-600">
                    <i class="pi pi-check text-green-500 mr-2 mt-0.5"></i>
                    Basic analytics
                  </li>
                </ul>

                <Button
                  label="Subscribe Now"
                  icon="pi pi-credit-card"
                  class="w-full"
                  :loading="processingCheckout"
                  @click="startCheckout"
                />
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Active/Trial Subscription -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Current Subscription -->
      <Card class="shadow-sm lg:col-span-2">
        <template #title>
          <div class="flex items-center justify-between">
            <span>Current Subscription</span>
            <span :class="['px-3 py-1 rounded-full text-sm font-medium', getStatusColor(subscription.status)]">
              {{ subscriptionStatusLabel }}
            </span>
          </div>
        </template>
        <template #content>
          <!-- Trial Information -->
          <div v-if="isTrialing" class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-start">
              <i class="pi pi-info-circle text-blue-600 text-xl mr-3 mt-0.5"></i>
              <div>
                <h4 class="font-medium text-blue-900 mb-1">Free Trial Active</h4>
                <p class="text-sm text-blue-700">
                  Your {{ trialDays }}-day free trial ends on {{ formatDate(subscription.trialEnd) }}.
                  Add a payment method to continue your service after the trial.
                </p>
              </div>
            </div>
          </div>

          <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h3 class="text-2xl font-bold text-gray-900">Professional Plan</h3>
              <p class="text-gray-500">
                ${{ subscriptionPrice }}/month
              </p>
            </div>
            <div v-if="subscription.currentPeriodEnd && hasActiveSubscription" class="mt-4 md:mt-0 text-right">
              <p class="text-sm text-gray-500">
                {{ subscription.cancelAtPeriodEnd ? 'Ends on' : 'Next billing date' }}
              </p>
              <p class="font-medium text-gray-900">{{ formatDate(subscription.currentPeriodEnd) }}</p>
            </div>
          </div>

          <div class="border-t border-gray-200 pt-4">
            <h4 class="font-medium text-gray-900 mb-3">Plan Features</h4>
            <ul class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <li class="flex items-center text-gray-600">
                <i class="pi pi-check text-green-500 mr-2"></i>
                Unlimited calls
              </li>
              <li class="flex items-center text-gray-600">
                <i class="pi pi-check text-green-500 mr-2"></i>
                24/7 AI answering
              </li>
              <li class="flex items-center text-gray-600">
                <i class="pi pi-check text-green-500 mr-2"></i>
                Appointment booking
              </li>
              <li class="flex items-center text-gray-600">
                <i class="pi pi-check text-green-500 mr-2"></i>
                Calendar integration
              </li>
              <li class="flex items-center text-gray-600">
                <i class="pi pi-check text-green-500 mr-2"></i>
                Email notifications
              </li>
              <li class="flex items-center text-gray-600">
                <i class="pi pi-check text-green-500 mr-2"></i>
                Basic analytics
              </li>
            </ul>
          </div>

          <div class="mt-6 flex gap-3">
            <Button
              label="Manage in Stripe"
              icon="pi pi-external-link"
              :loading="processingCheckout"
              @click="openStripePortal"
            />
          </div>
        </template>
      </Card>

      <!-- Payment Method -->
      <Card class="shadow-sm">
        <template #title>Payment Method</template>
        <template #content>
          <div v-if="isTrialing" class="text-center py-4">
            <i class="pi pi-credit-card text-4xl text-gray-300 mb-3"></i>
            <p class="text-sm text-gray-600 mb-4">
              No payment method on file. Add one before your trial ends.
            </p>
          </div>
          <div v-else-if="hasActiveSubscription" class="text-center py-4">
            <i class="pi pi-credit-card text-4xl text-green-500 mb-3"></i>
            <p class="text-sm text-gray-600 mb-4">
              Payment method is on file and managed through Stripe.
            </p>
          </div>
          <div v-else class="text-center py-4 text-gray-500">
            No payment method on file
          </div>
          <Button
            label="Manage Payment Method"
            icon="pi pi-credit-card"
            outlined
            class="w-full"
            :loading="processingCheckout"
            @click="openStripePortal"
          />
        </template>
      </Card>
    </div>

    <!-- Billing History Card -->
    <Card v-if="subscription && !isInactive" class="shadow-sm mt-6">
      <template #title>
        <div class="flex items-center justify-between">
          <span>Billing History</span>
          <Button
            label="View All in Stripe"
            text
            size="small"
            :loading="processingCheckout"
            @click="openStripePortal"
          />
        </div>
      </template>
      <template #content>
        <div class="text-center py-8 text-gray-500">
          View your complete billing history in the Stripe customer portal.
        </div>
      </template>
    </Card>
  </div>
</template>
