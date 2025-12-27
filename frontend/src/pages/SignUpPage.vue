<script setup lang="ts">
import { ref, onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Dropdown from 'primevue/dropdown'
import InputMask from 'primevue/inputmask'
import { RouterLink } from 'vue-router'
import api from '@/services/api'

// Define TypeScript interface for business type
interface BusinessType {
  id: string
  businessType: string
}

// Form state
const step = ref(1)
const loading = ref(false)
const error = ref('')

// Business Information (Step 1)
const businessName = ref('')
const businessType = ref('')
const businessPhone = ref('')
const businessAddress = ref('')
const businessCity = ref('')
const businessState = ref('')
const businessZip = ref('')

// Owner Information (Step 2)
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const phone = ref('')

// Business types - will be populated from API
interface DropdownOption {
  label: string
  value: string
}
const businessTypes = ref<Array<DropdownOption>>([])
const loadingBusinessTypes = ref(false)

const states = [
  { label: 'Alabama', value: 'AL' },
  { label: 'Alaska', value: 'AK' },
  { label: 'Arizona', value: 'AZ' },
  { label: 'Arkansas', value: 'AR' },
  { label: 'California', value: 'CA' },
  { label: 'Colorado', value: 'CO' },
  { label: 'Connecticut', value: 'CT' },
  { label: 'Delaware', value: 'DE' },
  { label: 'Florida', value: 'FL' },
  { label: 'Georgia', value: 'GA' },
  { label: 'Hawaii', value: 'HI' },
  { label: 'Idaho', value: 'ID' },
  { label: 'Illinois', value: 'IL' },
  { label: 'Indiana', value: 'IN' },
  { label: 'Iowa', value: 'IA' },
  { label: 'Kansas', value: 'KS' },
  { label: 'Kentucky', value: 'KY' },
  { label: 'Louisiana', value: 'LA' },
  { label: 'Maine', value: 'ME' },
  { label: 'Maryland', value: 'MD' },
  { label: 'Massachusetts', value: 'MA' },
  { label: 'Michigan', value: 'MI' },
  { label: 'Minnesota', value: 'MN' },
  { label: 'Mississippi', value: 'MS' },
  { label: 'Missouri', value: 'MO' },
  { label: 'Montana', value: 'MT' },
  { label: 'Nebraska', value: 'NE' },
  { label: 'Nevada', value: 'NV' },
  { label: 'New Hampshire', value: 'NH' },
  { label: 'New Jersey', value: 'NJ' },
  { label: 'New Mexico', value: 'NM' },
  { label: 'New York', value: 'NY' },
  { label: 'North Carolina', value: 'NC' },
  { label: 'North Dakota', value: 'ND' },
  { label: 'Ohio', value: 'OH' },
  { label: 'Oklahoma', value: 'OK' },
  { label: 'Oregon', value: 'OR' },
  { label: 'Pennsylvania', value: 'PA' },
  { label: 'Rhode Island', value: 'RI' },
  { label: 'South Carolina', value: 'SC' },
  { label: 'South Dakota', value: 'SD' },
  { label: 'Tennessee', value: 'TN' },
  { label: 'Texas', value: 'TX' },
  { label: 'Utah', value: 'UT' },
  { label: 'Vermont', value: 'VT' },
  { label: 'Virginia', value: 'VA' },
  { label: 'Washington', value: 'WA' },
  { label: 'West Virginia', value: 'WV' },
  { label: 'Wisconsin', value: 'WI' },
  { label: 'Wyoming', value: 'WY' }
]

function validateStep1(): boolean {
  if (!businessName.value.trim()) {
    error.value = 'Business name is required'
    return false
  }
  if (!businessType.value) {
    error.value = 'Please select a business type'
    return false
  }
  if (!businessPhone.value) {
    error.value = 'Business phone is required'
    return false
  }
  return true
}

function validateStep2(): boolean {
  if (!firstName.value.trim()) {
    error.value = 'First name is required'
    return false
  }
  if (!lastName.value.trim()) {
    error.value = 'Last name is required'
    return false
  }
  if (!email.value.trim()) {
    error.value = 'Email is required'
    return false
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    error.value = 'Please enter a valid email address'
    return false
  }
  if (!password.value) {
    error.value = 'Password is required'
    return false
  }
  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters'
    return false
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return false
  }
  return true
}

function nextStep() {
  error.value = ''
  if (step.value === 1 && validateStep1()) {
    step.value = 2
  }
}

function prevStep() {
  error.value = ''
  step.value = 1
}

// Fetch active business types from the API
async function fetchBusinessTypes() {
  loadingBusinessTypes.value = true
  try {
    const response = await api.get('/api/business-types/active')
    if (response.data.success && response.data.data.businessTypes) {
      // Map the business types to dropdown format
      businessTypes.value = response.data.data.businessTypes.map((bt: BusinessType) => ({
        label: bt.businessType,
        value: bt.id
      }))
    }
  } catch (err) {
    console.error('Failed to fetch business types:', err)
    // If API fails, don't set any fallback - let user know there's an issue
    error.value = 'Unable to load business types. Please refresh the page.'
  } finally {
    loadingBusinessTypes.value = false
  }
}

// Fetch business types on component mount
onMounted(() => {
  fetchBusinessTypes()
})

async function handleSubmit() {
  error.value = ''
  
  if (!validateStep2()) {
    return
  }

  loading.value = true

  try {
    // Register the user and business with free trial
    const signupResponse = await api.post('/api/auth/register', {
      email: email.value,
      password: password.value,
      firstName: firstName.value,
      lastName: lastName.value,
      contactPhone: phone.value,
      businessTypeId: businessType.value,
      businessName: businessName.value,
      businessPhone: businessPhone.value,
      businessAddress: businessAddress.value,
      businessCity: businessCity.value,
      businessState: businessState.value,
      businessZip: businessZip.value
    })

    // Store the token
    const { accessToken } = signupResponse.data.data.tokens
    localStorage.setItem('token', accessToken)

    // Redirect to app dashboard with success message
    window.location.href = `${window.location.origin}/app?signup=success`
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosError = err as { response?: { data?: { error?: string } } }
      error.value = axiosError.response?.data?.error || 'Registration failed. Please try again.'
    } else {
      error.value = 'Registration failed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-10rem)] py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-xl shadow-lg p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Create Your Account</h1>
          <p class="text-gray-600 mt-2">
            {{ step === 1 ? 'Tell us about your business' : 'Set up your account' }}
          </p>
          <p class="text-violet-600 font-medium mt-2">
            Start your 15-day free trial • No credit card required
          </p>
          
          <!-- Progress Steps -->
          <div class="flex items-center justify-center mt-6">
            <div class="flex items-center">
              <div 
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold',
                  step >= 1 ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-500'
                ]"
              >
                1
              </div>
              <div 
                :class="[
                  'w-16 h-1 mx-2',
                  step >= 2 ? 'bg-violet-600' : 'bg-gray-200'
                ]"
              ></div>
              <div 
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold',
                  step >= 2 ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-500'
                ]"
              >
                2
              </div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <Message v-if="error" severity="error" class="mb-4">
          {{ error }}
        </Message>

        <!-- Step 1: Business Information -->
        <form v-if="step === 1" @submit.prevent="nextStep" class="space-y-5">
          <div>
            <label for="businessName" class="block text-sm font-medium text-gray-700 mb-1">
              Business Name *
            </label>
            <InputText
              id="businessName"
              v-model="businessName"
              placeholder="Your Business Name"
              class="w-full"
              required
            />
          </div>

          <div>
            <label for="businessType" class="block text-sm font-medium text-gray-700 mb-1">
              Business Type *
            </label>
            <Dropdown
              id="businessType"
              v-model="businessType"
              :options="businessTypes"
              option-label="label"
              option-value="value"
              placeholder="Select your business type"
              class="w-full"
              :loading="loadingBusinessTypes"
              :disabled="loadingBusinessTypes"
            />
          </div>

          <div>
            <label for="businessPhone" class="block text-sm font-medium text-gray-700 mb-1">
              Business Phone *
            </label>
            <InputMask
              id="businessPhone"
              v-model="businessPhone"
              mask="(999) 999-9999"
              placeholder="(555) 555-5555"
              class="w-full"
            />
          </div>

          <div>
            <label for="businessAddress" class="block text-sm font-medium text-gray-700 mb-1">
              Street Address
            </label>
            <InputText
              id="businessAddress"
              v-model="businessAddress"
              placeholder="123 Main Street"
              class="w-full"
            />
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label for="businessCity" class="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <InputText
                id="businessCity"
                v-model="businessCity"
                placeholder="City"
                class="w-full"
              />
            </div>
            <div>
              <label for="businessState" class="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <Dropdown
                id="businessState"
                v-model="businessState"
                :options="states"
                option-label="label"
                option-value="value"
                placeholder="State"
                class="w-full"
              />
            </div>
            <div class="col-span-2 md:col-span-1">
              <label for="businessZip" class="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code
              </label>
              <InputMask
                id="businessZip"
                v-model="businessZip"
                mask="99999"
                placeholder="12345"
                class="w-full"
              />
            </div>
          </div>

          <Button
            type="submit"
            label="Continue"
            icon="pi pi-arrow-right"
            icon-pos="right"
            class="w-full mt-6"
          />
        </form>

        <!-- Step 2: Owner Information -->
        <form v-else @submit.prevent="handleSubmit" class="space-y-5">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
                First Name *
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
                Last Name *
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
              Email Address *
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
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <InputMask
              id="phone"
              v-model="phone"
              mask="(999) 999-9999"
              placeholder="(555) 555-5555"
              class="w-full"
              autocomplete="tel"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Password *
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
              Confirm Password *
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

          <div class="flex items-start">
            <input
              id="terms"
              type="checkbox"
              class="h-4 w-4 mt-0.5 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
              required
            />
            <label for="terms" class="ml-2 text-sm text-gray-600">
              I agree to the
              <a href="#" class="text-violet-600 hover:text-violet-500">Terms of Service</a>
              and
              <a href="#" class="text-violet-600 hover:text-violet-500">Privacy Policy</a>
            </label>
          </div>

          <div class="flex gap-4 mt-6">
            <Button
              type="button"
              label="Back"
              icon="pi pi-arrow-left"
              severity="secondary"
              outlined
              class="flex-1"
              @click="prevStep"
            />
            <Button
              type="submit"
              label="Create Account & Start Trial"
              icon="pi pi-check"
              icon-pos="right"
              class="flex-1"
              :loading="loading"
            />
          </div>
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
