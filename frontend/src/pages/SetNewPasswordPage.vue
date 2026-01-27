<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import api from '@/services/api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

// Get userId and tempPassword from route query params
const userId = computed(() => route.query.userId as string)
const tempPassword = computed(() => route.query.tempPassword as string)

// Password validation
const passwordsMatch = computed(() => newPassword.value === confirmPassword.value)
const passwordLongEnough = computed(() => newPassword.value.length >= 8)
const canSubmit = computed(() => 
  newPassword.value && 
  confirmPassword.value && 
  passwordsMatch.value && 
  passwordLongEnough.value
)

async function handleSubmit() {
  if (!canSubmit.value) return
  
  error.value = ''
  loading.value = true

  try {
    const response = await api.post('/api/auth/reset-password-first-login', {
      userId: userId.value,
      oldPassword: tempPassword.value,
      newPassword: newPassword.value
    })

    // Login successful - store tokens and redirect
    const { tokens, user } = response.data.data
    localStorage.setItem('token', tokens.accessToken)
    authStore.$patch({ token: tokens.accessToken, user })

    router.push('/app')
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosError = err as { response?: { data?: { error?: string } } }
      error.value = axiosError.response?.data?.error || 'Failed to set password'
    } else {
      error.value = 'Failed to set password'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-10rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-xl shadow-lg p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="mx-auto w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-4">
            <i class="pi pi-lock text-violet-600 text-2xl"></i>
          </div>
          <h1 class="text-3xl font-bold text-gray-900">Set Your Password</h1>
          <p class="text-gray-600 mt-2">
            Please create a new password to secure your account.
          </p>
        </div>

        <!-- Missing params warning -->
        <Message v-if="!userId || !tempPassword" severity="error" class="mb-4">
          Invalid password reset link. Please use the link from your email or contact your administrator.
        </Message>

        <!-- Error Message -->
        <Message v-if="error" severity="error" class="mb-4">
          {{ error }}
        </Message>

        <!-- Password Form -->
        <form v-if="userId && tempPassword" @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <Password
              id="newPassword"
              v-model="newPassword"
              placeholder="Enter new password"
              class="w-full"
              toggle-mask
              :feedback="true"
              required
              autocomplete="new-password"
            />
            <p v-if="newPassword && !passwordLongEnough" class="text-sm text-red-500 mt-1">
              Password must be at least 8 characters
            </p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <Password
              id="confirmPassword"
              v-model="confirmPassword"
              placeholder="Confirm new password"
              class="w-full"
              :feedback="false"
              toggle-mask
              required
              autocomplete="new-password"
            />
            <p v-if="confirmPassword && !passwordsMatch" class="text-sm text-red-500 mt-1">
              Passwords do not match
            </p>
          </div>

          <Button
            type="submit"
            label="Set Password & Continue"
            icon="pi pi-check"
            class="w-full"
            :loading="loading"
            :disabled="!canSubmit"
          />
        </form>

        <!-- Help text -->
        <p class="mt-6 text-center text-sm text-gray-500">
          Need help? Contact your administrator.
        </p>
      </div>
    </div>
  </div>
</template>
