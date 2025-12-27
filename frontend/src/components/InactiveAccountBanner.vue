<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Message from 'primevue/message'
import Button from 'primevue/button'
import api from '@/services/api'

const router = useRouter()
const showBanner = ref(false)
const subscription = ref<any>(null)
const trialDaysRemaining = ref(0)

onMounted(async () => {
  try {
    // Fetch subscription status
    const response = await api.get('/api/billing/subscription')
    subscription.value = response.data.data.subscription
    
    // Check if subscription is inactive or trialing
    if (subscription.value && subscription.value.status === 'inactive') {
      showBanner.value = true
    } else if (subscription.value && subscription.value.status === 'trialing' && subscription.value.trialEnd) {
      // Calculate days remaining in trial
      const trialEnd = new Date(subscription.value.trialEnd)
      const now = new Date()
      const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysLeft <= 5 && daysLeft > 0) {
        // Show warning when 5 or fewer days remain
        trialDaysRemaining.value = daysLeft
        showBanner.value = true
      }
    }
  } catch (error) {
    console.error('Failed to fetch subscription status:', error)
  }
})

function goToBilling() {
  router.push('/app/billing')
}
</script>

<template>
  <div v-if="showBanner" class="mb-4">
    <!-- Inactive Account Message -->
    <Message 
      v-if="subscription?.status === 'inactive'" 
      severity="error" 
      :closable="false"
      class="shadow-md"
    >
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-3">
          <i class="pi pi-exclamation-circle text-2xl"></i>
          <div>
            <p class="font-bold text-lg">Your Free Trial Has Ended</p>
            <p class="mt-1">
              To continue using CRITON.AI and keep your AI receptionist active, please set up your payment method.
            </p>
          </div>
        </div>
        <Button
          label="Set Up Payment"
          icon="pi pi-credit-card"
          severity="contrast"
          @click="goToBilling"
        />
      </div>
    </Message>

    <!-- Trial Ending Soon Message -->
    <Message 
      v-else-if="subscription?.status === 'trialing' && trialDaysRemaining > 0" 
      severity="warn" 
      :closable="false"
      class="shadow-md"
    >
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-3">
          <i class="pi pi-info-circle text-2xl"></i>
          <div>
            <p class="font-bold text-lg">
              {{ trialDaysRemaining }} Day{{ trialDaysRemaining > 1 ? 's' : '' }} Left in Your Free Trial
            </p>
            <p class="mt-1">
              Add your payment method now to ensure uninterrupted service after your trial ends.
            </p>
          </div>
        </div>
        <Button
          label="Add Payment Method"
          icon="pi pi-credit-card"
          severity="warning"
          @click="goToBilling"
        />
      </div>
    </Message>
  </div>
</template>
