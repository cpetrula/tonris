<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import api from '@/services/api'

type Step = 'request' | 'sent' | 'reset' | 'success'

const step = ref<Step>('request')
const email = ref('')
const token = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

// Check if URL has reset token
const urlParams = new URLSearchParams(window.location.search)
const urlToken = urlParams.get('token')
if (urlToken) {
  token.value = urlToken
  step.value = 'reset'
}

const title = computed(() => {
  switch (step.value) {
    case 'request':
      return 'Forgot your password?'
    case 'sent':
      return 'Check your email'
    case 'reset':
      return 'Reset your password'
    case 'success':
      return 'Password reset successful'
    default:
      return 'Forgot your password?'
  }
})

const description = computed(() => {
  switch (step.value) {
    case 'request':
      return "No worries, we'll send you reset instructions."
    case 'sent':
      return 'We sent a password reset link to your email address.'
    case 'reset':
      return 'Enter your new password below.'
    case 'success':
      return 'Your password has been reset. You can now sign in with your new password.'
    default:
      return ''
  }
})

async function handleRequestReset() {
  error.value = ''
  
  if (!email.value.trim()) {
    error.value = 'Email is required'
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    error.value = 'Please enter a valid email address'
    return
  }

  loading.value = true

  try {
    await api.post('/api/auth/forgot-password', {
      email: email.value
    })
    step.value = 'sent'
  } catch (err: unknown) {
    // Don't reveal whether email exists for security reasons
    // Always show success message
    step.value = 'sent'
  } finally {
    loading.value = false
  }
}

async function handleResetPassword() {
  error.value = ''

  if (!password.value) {
    error.value = 'Password is required'
    return
  }

  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  loading.value = true

  try {
    await api.post('/api/auth/reset-password', {
      token: token.value,
      password: password.value
    })
    step.value = 'success'
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosError = err as { response?: { data?: { error?: string } } }
      error.value = axiosError.response?.data?.error || 'Failed to reset password. Please try again.'
    } else {
      error.value = 'Failed to reset password. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

function resendEmail() {
  step.value = 'request'
}
</script>

<template>
  <div class="min-h-[calc(100vh-10rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-xl shadow-lg p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <!-- Icon -->
          <div 
            :class="[
              'w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center',
              step === 'success' ? 'bg-green-100' : 'bg-violet-100'
            ]"
          >
            <i 
              :class="[
                'text-3xl',
                step === 'sent' ? 'pi pi-envelope text-violet-600' :
                step === 'success' ? 'pi pi-check-circle text-green-600' :
                step === 'reset' ? 'pi pi-lock text-violet-600' :
                'pi pi-key text-violet-600'
              ]"
            ></i>
          </div>
          <h1 class="text-3xl font-bold text-gray-900">{{ title }}</h1>
          <p class="text-gray-600 mt-2">{{ description }}</p>
        </div>

        <!-- Error Message -->
        <Message v-if="error" severity="error" class="mb-4">
          {{ error }}
        </Message>

        <!-- Request Reset Form -->
        <form v-if="step === 'request'" @submit.prevent="handleRequestReset" class="space-y-6">
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

          <Button
            type="submit"
            label="Send Reset Link"
            icon="pi pi-send"
            class="w-full"
            :loading="loading"
          />
        </form>

        <!-- Email Sent Confirmation -->
        <div v-else-if="step === 'sent'" class="space-y-6">
          <div class="bg-violet-50 rounded-lg p-4 text-center">
            <p class="text-violet-700">
              <i class="pi pi-info-circle mr-2"></i>
              If an account exists for <strong>{{ email }}</strong>, you will receive an email with instructions to reset your password.
            </p>
          </div>

          <div class="text-center space-y-4">
            <p class="text-sm text-gray-600">
              Didn't receive the email? Check your spam folder or
            </p>
            <Button
              type="button"
              label="Try Again"
              severity="secondary"
              outlined
              @click="resendEmail"
            />
          </div>
        </div>

        <!-- Reset Password Form -->
        <form v-else-if="step === 'reset'" @submit.prevent="handleResetPassword" class="space-y-6">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              New Password
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
              Confirm New Password
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

          <Button
            type="submit"
            label="Reset Password"
            icon="pi pi-lock"
            class="w-full"
            :loading="loading"
          />
        </form>

        <!-- Success Message -->
        <div v-else-if="step === 'success'" class="space-y-6">
          <div class="bg-green-50 rounded-lg p-4 text-center">
            <p class="text-green-700">
              <i class="pi pi-check-circle mr-2"></i>
              Your password has been successfully reset.
            </p>
          </div>

          <RouterLink to="/login" class="block">
            <Button
              label="Sign In"
              icon="pi pi-sign-in"
              class="w-full"
            />
          </RouterLink>
        </div>

        <!-- Back to Login Link -->
        <p class="mt-6 text-center text-sm text-gray-600">
          <RouterLink to="/login" class="inline-flex items-center gap-1 text-violet-600 hover:text-violet-500 font-medium">
            <i class="pi pi-arrow-left text-xs"></i>
            Back to sign in
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
