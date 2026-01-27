<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

interface OnboardingStep {
  key: string
  label: string
  description: string
  route: string
  icon: string
  completed: boolean
}

const props = defineProps<{
  steps: {
    services: boolean
    employees: boolean
    businessHours: boolean
  }
}>()

const emit = defineEmits<{
  dismiss: []
}>()

const router = useRouter()

const onboardingSteps = computed<OnboardingStep[]>(() => [
  {
    key: 'services',
    label: 'Add your services',
    description: 'Set up the services you offer with pricing and duration',
    route: '/app/services',
    icon: 'pi pi-list',
    completed: props.steps.services
  },
  {
    key: 'businessHours',
    label: 'Set business hours',
    description: 'Configure when your business is open for appointments',
    route: '/app/settings',
    icon: 'pi pi-clock',
    completed: props.steps.businessHours
  },
  {
    key: 'employees',
    label: 'Add team members',
    description: 'Add employees who will handle appointments',
    route: '/app/employees',
    icon: 'pi pi-users',
    completed: props.steps.employees
  }
])

const completedCount = computed(() => 
  onboardingSteps.value.filter(s => s.completed).length
)

const totalSteps = computed(() => onboardingSteps.value.length)

const progressPercent = computed(() => 
  Math.round((completedCount.value / totalSteps.value) * 100)
)

const allComplete = computed(() => 
  completedCount.value === totalSteps.value
)

function navigateTo(route: string) {
  router.push(route)
}
</script>

<template>
  <div class="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl p-4 md:p-6 text-white mb-6 shadow-lg">
    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <div>
        <h2 class="text-lg md:text-xl font-bold flex items-center gap-2">
          <i class="pi pi-flag"></i>
          Get Started
        </h2>
        <p class="text-violet-200 text-sm mt-1">
          Complete these steps to start receiving AI-powered calls
        </p>
      </div>
      <button 
        v-if="allComplete"
        class="text-violet-200 hover:text-white p-1"
        @click="emit('dismiss')"
        title="Dismiss"
      >
        <i class="pi pi-times"></i>
      </button>
    </div>

    <!-- Progress bar -->
    <div class="mb-4">
      <div class="flex justify-between text-sm mb-1">
        <span>{{ completedCount }} of {{ totalSteps }} complete</span>
        <span>{{ progressPercent }}%</span>
      </div>
      <div class="h-2 bg-violet-400/30 rounded-full overflow-hidden">
        <div 
          class="h-full bg-white rounded-full transition-all duration-500"
          :style="{ width: `${progressPercent}%` }"
        ></div>
      </div>
    </div>

    <!-- Steps -->
    <div class="space-y-2">
      <div 
        v-for="step in onboardingSteps" 
        :key="step.key"
        class="flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer"
        :class="step.completed 
          ? 'bg-white/10' 
          : 'bg-white/20 hover:bg-white/30'"
        @click="navigateTo(step.route)"
      >
        <!-- Checkbox circle -->
        <div 
          class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
          :class="step.completed 
            ? 'bg-green-500 text-white' 
            : 'bg-white/20 text-white'"
        >
          <i :class="step.completed ? 'pi pi-check' : step.icon" class="text-sm"></i>
        </div>

        <!-- Text -->
        <div class="flex-1 min-w-0">
          <p 
            class="font-medium text-sm md:text-base"
            :class="{ 'line-through opacity-70': step.completed }"
          >
            {{ step.label }}
          </p>
          <p class="text-xs text-violet-200 truncate hidden md:block">
            {{ step.description }}
          </p>
        </div>

        <!-- Arrow -->
        <i 
          v-if="!step.completed" 
          class="pi pi-chevron-right text-violet-200"
        ></i>
      </div>
    </div>

    <!-- All done message -->
    <div v-if="allComplete" class="mt-4 p-3 bg-green-500/20 rounded-lg flex items-center gap-2">
      <i class="pi pi-check-circle text-green-300"></i>
      <span class="text-sm">You're all set! Your AI receptionist is ready to take calls.</span>
    </div>
  </div>
</template>
