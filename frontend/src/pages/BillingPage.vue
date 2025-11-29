<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Message from 'primevue/message'

interface PaymentMethod {
  id: string
  type: 'card'
  brand: string
  last4: string
  expiryMonth: number
  expiryYear: number
  isDefault: boolean
}

interface Invoice {
  id: string
  number: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
  pdfUrl: string
}

const loading = ref(false)
const error = ref('')

// Current subscription info
const subscription = ref({
  plan: 'Professional',
  status: 'active',
  billingCycle: 'monthly',
  price: 99,
  nextBillingDate: '2024-02-15',
  features: [
    'Unlimited calls',
    '24/7 AI answering',
    'Appointment booking',
    'Calendar integration',
    'Email notifications',
    'Basic analytics'
  ]
})

// Available plans
const plans = ref([
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    priceYearly: 39,
    description: 'Perfect for small businesses',
    features: [
      'Up to 100 calls/month',
      'Business hours coverage',
      'Basic scheduling',
      'Email support'
    ],
    current: false
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99,
    priceYearly: 79,
    description: 'Most popular for growing businesses',
    features: [
      'Unlimited calls',
      '24/7 AI answering',
      'Appointment booking',
      'Calendar integration',
      'Email notifications',
      'Basic analytics'
    ],
    current: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 249,
    priceYearly: 199,
    description: 'For large organizations',
    features: [
      'Everything in Professional',
      'Multiple locations',
      'Advanced analytics',
      'Custom voice options',
      'Dedicated account manager',
      'Priority support',
      'API access'
    ],
    current: false
  }
])

// Payment methods
const paymentMethods = ref<PaymentMethod[]>([
  {
    id: '1',
    type: 'card',
    brand: 'visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true
  }
])

// Invoices
const invoices = ref<Invoice[]>([
  {
    id: '1',
    number: 'INV-2024-001',
    date: '2024-01-15',
    amount: 99,
    status: 'paid',
    pdfUrl: '#'
  },
  {
    id: '2',
    number: 'INV-2023-012',
    date: '2023-12-15',
    amount: 99,
    status: 'paid',
    pdfUrl: '#'
  },
  {
    id: '3',
    number: 'INV-2023-011',
    date: '2023-11-15',
    amount: 99,
    status: 'paid',
    pdfUrl: '#'
  }
])

const defaultPaymentMethod = computed(() => {
  return paymentMethods.value.find(pm => pm.isDefault)
})

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}

function getCardIcon(brand: string): string {
  const icons: Record<string, string> = {
    visa: 'pi pi-credit-card',
    mastercard: 'pi pi-credit-card',
    amex: 'pi pi-credit-card'
  }
  return icons[brand] || 'pi pi-credit-card'
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-700'
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

async function openStripePortal() {
  // In a real app, this would redirect to Stripe Customer Portal
  // const response = await api.post(`/api/tenants/${tenantStore.tenantId}/billing/portal`)
  // window.location.href = response.data.url
  alert('This would redirect to Stripe Customer Portal in production')
}

async function changePlan(planId: string) {
  if (confirm('Are you sure you want to change your plan?')) {
    // In a real app, this would call the API
    // await api.post(`/api/tenants/${tenantStore.tenantId}/billing/change-plan`, { planId })
    alert(`Plan change to ${planId} would be processed in production`)
  }
}

async function downloadInvoice(invoice: Invoice) {
  // In a real app, this would download the invoice PDF
  alert(`Downloading invoice ${invoice.number}...`)
}

onMounted(async () => {
  loading.value = true
  // In a real app, fetch billing data from API using tenantStore.tenantId
  // await api.get(`/api/tenants/${tenantStore.tenantId}/billing`)
  loading.value = false
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

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Current Plan -->
      <Card class="shadow-sm lg:col-span-2">
        <template #title>
          <div class="flex items-center justify-between">
            <span>Current Plan</span>
            <span :class="[
              'px-3 py-1 rounded-full text-sm font-medium',
              subscription.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            ]">
              {{ subscription.status === 'active' ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </template>
        <template #content>
          <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h3 class="text-2xl font-bold text-gray-900">{{ subscription.plan }}</h3>
              <p class="text-gray-500">
                ${{ subscription.price }}/{{ subscription.billingCycle === 'monthly' ? 'month' : 'year' }}
              </p>
            </div>
            <div class="mt-4 md:mt-0 text-right">
              <p class="text-sm text-gray-500">Next billing date</p>
              <p class="font-medium text-gray-900">{{ formatDate(subscription.nextBillingDate) }}</p>
            </div>
          </div>

          <div class="border-t border-gray-200 pt-4">
            <h4 class="font-medium text-gray-900 mb-3">Plan Features</h4>
            <ul class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <li v-for="feature in subscription.features" :key="feature" class="flex items-center text-gray-600">
                <i class="pi pi-check text-green-500 mr-2"></i>
                {{ feature }}
              </li>
            </ul>
          </div>

          <div class="mt-6 flex gap-3">
            <Button
              label="Manage Subscription"
              icon="pi pi-external-link"
              @click="openStripePortal"
            />
            <Button
              label="Cancel Subscription"
              severity="danger"
              text
              @click="openStripePortal"
            />
          </div>
        </template>
      </Card>

      <!-- Payment Method -->
      <Card class="shadow-sm">
        <template #title>Payment Method</template>
        <template #content>
          <div v-if="defaultPaymentMethod" class="mb-4">
            <div class="flex items-center p-4 bg-gray-50 rounded-lg">
              <i :class="[getCardIcon(defaultPaymentMethod.brand), 'text-2xl text-gray-600 mr-3']"></i>
              <div>
                <p class="font-medium text-gray-900 capitalize">{{ defaultPaymentMethod.brand }} •••• {{ defaultPaymentMethod.last4 }}</p>
                <p class="text-sm text-gray-500">
                  Expires {{ defaultPaymentMethod.expiryMonth }}/{{ defaultPaymentMethod.expiryYear }}
                </p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-4 text-gray-500">
            No payment method on file
          </div>
          <Button
            label="Update Payment Method"
            icon="pi pi-credit-card"
            outlined
            class="w-full"
            @click="openStripePortal"
          />
        </template>
      </Card>
    </div>

    <!-- Available Plans -->
    <Card class="shadow-sm mt-6">
      <template #title>Available Plans</template>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="plan in plans"
            :key="plan.id"
            :class="[
              'border-2 rounded-xl p-6 relative',
              plan.current ? 'border-violet-500 bg-violet-50' : 'border-gray-200'
            ]"
          >
            <div v-if="plan.current" class="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              Current Plan
            </div>

            <h3 class="text-xl font-bold text-gray-900 mb-1">{{ plan.name }}</h3>
            <p class="text-gray-500 text-sm mb-4">{{ plan.description }}</p>

            <div class="mb-4">
              <span class="text-3xl font-bold text-gray-900">${{ plan.price }}</span>
              <span class="text-gray-500">/month</span>
            </div>

            <ul class="space-y-2 mb-6">
              <li v-for="feature in plan.features" :key="feature" class="flex items-start text-sm text-gray-600">
                <i class="pi pi-check text-green-500 mr-2 mt-0.5"></i>
                {{ feature }}
              </li>
            </ul>

            <Button
              v-if="!plan.current"
              :label="plan.price > subscription.price ? 'Upgrade' : 'Downgrade'"
              :severity="plan.price > subscription.price ? 'primary' : 'secondary'"
              :outlined="plan.price < subscription.price"
              class="w-full"
              @click="changePlan(plan.id)"
            />
            <Button
              v-else
              label="Current Plan"
              severity="secondary"
              disabled
              class="w-full"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Billing History -->
    <Card class="shadow-sm mt-6">
      <template #title>
        <div class="flex items-center justify-between">
          <span>Billing History</span>
          <Button
            label="View All in Stripe"
            text
            size="small"
            @click="openStripePortal"
          />
        </div>
      </template>
      <template #content>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">Invoice</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th class="text-right py-3 px-4 text-sm font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="invoice in invoices" :key="invoice.id" class="border-b border-gray-100 last:border-0">
                <td class="py-3 px-4 font-medium text-gray-900">{{ invoice.number }}</td>
                <td class="py-3 px-4 text-gray-600">{{ formatDate(invoice.date) }}</td>
                <td class="py-3 px-4 text-gray-900">{{ formatPrice(invoice.amount) }}</td>
                <td class="py-3 px-4">
                  <span :class="['px-2 py-1 rounded-full text-xs font-medium capitalize', getStatusColor(invoice.status)]">
                    {{ invoice.status }}
                  </span>
                </td>
                <td class="py-3 px-4 text-right">
                  <Button
                    icon="pi pi-download"
                    text
                    size="small"
                    severity="secondary"
                    v-tooltip.top="'Download PDF'"
                    @click="downloadInvoice(invoice)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="invoices.length === 0" class="text-center py-8 text-gray-500">
          No invoices yet
        </div>
      </template>
    </Card>
  </div>
</template>
