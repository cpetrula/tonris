<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Card from 'primevue/card'
import axios from 'axios'

const router = useRouter()

// State
const adminPassword = ref('')
const loading = ref(false)
const error = ref('')
const passwordInput = ref<HTMLInputElement | null>(null)

// Store password in session storage (cleared on browser close)
const ADMIN_PASSWORD_KEY = 'admin_password'
const ADMIN_AUTH_KEY = 'admin_authenticated'

// Check if already authenticated
onMounted(() => {
  const isAuth = sessionStorage.getItem(ADMIN_AUTH_KEY)
  if (isAuth === 'true') {
    // Already authenticated, redirect to admin dashboard
    router.push('/admin/clients')
  }
})

// Authenticate with admin password
async function handleLogin() {
  if (!adminPassword.value.trim()) {
    error.value = 'Please enter admin password'
    return
  }

  loading.value = true
  error.value = ''

  try {
    // Test the admin password by making a request
    await axios.get(
      `${import.meta.env.VITE_API_URL || ''}/api/admin/clients`,
      {
        headers: {
          'X-Admin-Password': adminPassword.value
        }
      }
    )

    // Success - store authentication state and password
    sessionStorage.setItem(ADMIN_PASSWORD_KEY, adminPassword.value)
    sessionStorage.setItem(ADMIN_AUTH_KEY, 'true')
    
    // Redirect to admin clients page
    router.push('/admin/clients')
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Invalid admin password'
    // Clear any existing auth data
    sessionStorage.removeItem(ADMIN_PASSWORD_KEY)
    sessionStorage.removeItem(ADMIN_AUTH_KEY)
  } finally {
    loading.value = false
  }
}

// Navigate back to home
function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md">
      <!-- Back Button -->
      <div class="mb-4">
        <Button
          label="Back to Home"
          icon="pi pi-arrow-left"
          @click="goBack"
          text
          size="small"
          class="text-gray-600"
        />
      </div>

      <!-- Login Card -->
      <Card class="shadow-xl">
        <template #header>
          <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center rounded-t-lg">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
              <i class="pi pi-shield text-blue-600 text-3xl"></i>
            </div>
            <h1 class="text-2xl font-bold text-white">Admin Access</h1>
            <p class="text-blue-100 mt-2">System Administrator Portal</p>
          </div>
        </template>

        <template #content>
          <div class="space-y-6 px-2">
            <!-- Info Message -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex items-start gap-3">
                <i class="pi pi-info-circle text-blue-600 mt-0.5"></i>
                <div class="text-sm text-blue-900">
                  <p class="font-semibold mb-1">Restricted Area</p>
                  <p class="text-blue-700">
                    This area is restricted to system administrators only. 
                    Enter your admin password to access the client management dashboard.
                  </p>
                </div>
              </div>
            </div>

            <!-- Error Message -->
            <Message v-if="error" severity="error" :closable="false">
              {{ error }}
            </Message>

            <!-- Login Form -->
            <form @submit.prevent="handleLogin" class="space-y-5">
              <div>
                <label for="adminPassword" class="block text-sm font-semibold text-gray-700 mb-2">
                  Admin Password
                </label>
                <InputText
                  id="adminPassword"
                  v-model="adminPassword"
                  ref="passwordInput"
                  type="password"
                  placeholder="Enter your admin password"
                  class="w-full"
                  :disabled="loading"
                  autofocus
                  size="large"
                />
                <p class="mt-2 text-xs text-gray-500">
                  Contact your system administrator if you don't have access
                </p>
              </div>

              <Button
                type="submit"
                label="Sign In to Admin Panel"
                icon="pi pi-sign-in"
                class="w-full"
                :loading="loading"
                size="large"
              />
            </form>

            <!-- Security Note -->
            <div class="pt-4 border-t border-gray-200">
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <i class="pi pi-lock"></i>
                <span>Your session is secured and will expire when you close the browser</span>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Warning Footer -->
      <div class="mt-6 text-center text-xs text-gray-500">
        <p>⚠️ Unauthorized access attempts will be logged and monitored</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional styling if needed */
</style>
