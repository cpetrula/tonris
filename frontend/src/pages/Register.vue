<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Select from 'primevue/select'

interface BusinessType {
  id: string
  businessType: string
  agentId: string
  active: boolean
}

const router = useRouter()
const authStore = useAuthStore()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const businessTypeId = ref('')
const businessTypes = ref<BusinessType[]>([])
const localError = ref('')
const loadingBusinessTypes = ref(false)

async function fetchBusinessTypes() {
  loadingBusinessTypes.value = true
  try {
    const response = await api.get('/api/business-types/active')
    businessTypes.value = response.data.data.businessTypes
  } catch (err) {
    console.error('Failed to fetch business types:', err)
    localError.value = 'Failed to load business types. Please refresh the page.'
  } finally {
    loadingBusinessTypes.value = false
  }
}

async function handleSubmit() {
  localError.value = ''

  // Validate business type selection
  if (!businessTypeId.value) {
    localError.value = 'Please select a business type'
    return
  }

  // Validate passwords match
  if (password.value !== confirmPassword.value) {
    localError.value = 'Passwords do not match'
    return
  }

  // Validate password strength
  if (password.value.length < 8) {
    localError.value = 'Password must be at least 8 characters'
    return
  }

  const success = await authStore.register({
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    password: password.value,
    businessTypeId: businessTypeId.value
  })

  if (success) {
    router.push('/app')
  }
}

onMounted(() => {
  authStore.clearError()
  fetchBusinessTypes()
})
</script>

<template>
  <div class="min-h-[calc(100vh-10rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-xl shadow-lg p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Create your account</h1>
          <p class="text-gray-600 mt-2">Start your free trial today</p>
        </div>

        <!-- Error Message -->
        <Message v-if="authStore.error || localError" severity="error" class="mb-4">
          {{ authStore.error || localError }}
        </Message>

        <!-- Register Form -->
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
                First name
              </label>
              <InputText
                id="firstName"
                v-model="firstName"
                placeholder="John"
                class="w-full"
                required
                autocomplete="given-name"
              />
            </div>
            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">
                Last name
              </label>
              <InputText
                id="lastName"
                v-model="lastName"
                placeholder="Doe"
                class="w-full"
                required
                autocomplete="family-name"
              />
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <InputText
              id="email"
              v-model="email"
              type="email"
              placeholder="you@example.com"
              class="w-full"
              required
              autocomplete="email"
            />
          </div>

          <div>
            <label for="businessType" class="block text-sm font-medium text-gray-700 mb-1">
              Business Type <span class="text-red-500">*</span>
            </label>
            <Select
              id="businessType"
              v-model="businessTypeId"
              :options="businessTypes"
              optionLabel="businessType"
              optionValue="id"
              placeholder="Select a business type"
              class="w-full"
              :loading="loadingBusinessTypes"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Password
              id="password"
              v-model="password"
              placeholder="••••••••"
              class="w-full"
              toggle-mask
              required
              autocomplete="new-password"
            />
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
              Confirm password
            </label>
            <Password
              id="confirmPassword"
              v-model="confirmPassword"
              placeholder="••••••••"
              class="w-full"
              :feedback="false"
              toggle-mask
              required
              autocomplete="new-password"
            />
          </div>

          <div class="flex items-center">
            <input
              id="terms"
              type="checkbox"
              class="h-4 w-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
              required
            />
            <label for="terms" class="ml-2 text-sm text-gray-600">
              I agree to the
              <a href="#" class="text-violet-600 hover:text-violet-500">Terms of Service</a>
              and
              <a href="#" class="text-violet-600 hover:text-violet-500">Privacy Policy</a>
            </label>
          </div>

          <Button
            type="submit"
            label="Create Account"
            icon="pi pi-user-plus"
            class="w-full"
            :loading="authStore.loading"
          />
        </form>

        <!-- Sign In Link -->
        <p class="mt-6 text-center text-sm text-gray-600">
          Already have an account?
          <RouterLink to="/login" class="text-violet-600 hover:text-violet-500 font-medium">
            Sign in
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
