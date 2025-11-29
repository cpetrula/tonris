<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import api from '@/services/api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const twoFactorCode = ref('')
const requiresTwoFactor = ref(false)
const localError = ref('')
const loading = ref(false)

async function handleSubmit() {
  localError.value = ''
  loading.value = true

  try {
    const response = await api.post('/api/auth/login', {
      email: email.value,
      password: password.value,
      twoFactorCode: requiresTwoFactor.value ? twoFactorCode.value : undefined
    })

    // Check if 2FA is required
    if (response.data.requiresTwoFactor) {
      requiresTwoFactor.value = true
      loading.value = false
      return
    }

    // Login successful
    const { tokens, user } = response.data.data
    const token = tokens.accessToken
    localStorage.setItem('token', token)
    authStore.$patch({ token, user })

    // Redirect to the intended page or dashboard
    const redirect = route.query.redirect as string
    router.push(redirect || '/app')
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosError = err as { response?: { data?: { error?: string } } }
      localError.value = axiosError.response?.data?.error || 'Login failed'
    } else {
      localError.value = 'Login failed'
    }
  } finally {
    loading.value = false
  }
}

function resetTwoFactor() {
  requiresTwoFactor.value = false
  twoFactorCode.value = ''
  localError.value = ''
}

onMounted(() => {
  authStore.clearError()
})
</script>

<template>
  <div class="min-h-[calc(100vh-10rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-xl shadow-lg p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">
            {{ requiresTwoFactor ? 'Two-Factor Authentication' : 'Welcome back' }}
          </h1>
          <p class="text-gray-600 mt-2">
            {{ requiresTwoFactor ? 'Enter the code from your authenticator app' : 'Sign in to your account to continue' }}
          </p>
        </div>

        <!-- Error Message -->
        <Message v-if="authStore.error || localError" severity="error" class="mb-4">
          {{ authStore.error || localError }}
        </Message>

        <!-- 2FA Form -->
        <form v-if="requiresTwoFactor" @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label for="twoFactorCode" class="block text-sm font-medium text-gray-700 mb-1">
              Authentication Code
            </label>
            <InputText
              id="twoFactorCode"
              v-model="twoFactorCode"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="6"
              placeholder="000000"
              class="w-full text-center text-2xl tracking-widest"
              required
              autocomplete="one-time-code"
            />
            <p class="text-sm text-gray-500 mt-2">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          <Button
            type="submit"
            label="Verify Code"
            icon="pi pi-shield"
            class="w-full"
            :loading="loading"
          />

          <Button
            type="button"
            label="Use different account"
            severity="secondary"
            text
            class="w-full"
            @click="resetTwoFactor"
          />
        </form>

        <!-- Login Form -->
        <form v-else @submit.prevent="handleSubmit" class="space-y-6">
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
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Password
              id="password"
              v-model="password"
              placeholder="••••••••"
              class="w-full"
              :feedback="false"
              toggle-mask
              required
              autocomplete="current-password"
            />
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember"
                type="checkbox"
                class="h-4 w-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
              />
              <label for="remember" class="ml-2 text-sm text-gray-600">
                Remember me
              </label>
            </div>
            <RouterLink to="/forgot-password" class="text-sm text-violet-600 hover:text-violet-500">
              Forgot password?
            </RouterLink>
          </div>

          <Button
            type="submit"
            label="Sign In"
            icon="pi pi-sign-in"
            class="w-full"
            :loading="loading"
          />
        </form>

        <!-- Sign Up Link -->
        <p class="mt-6 text-center text-sm text-gray-600">
          Don't have an account?
          <RouterLink to="/signup" class="text-violet-600 hover:text-violet-500 font-medium">
            Create one now
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
