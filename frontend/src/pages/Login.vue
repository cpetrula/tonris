<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')

async function handleSubmit() {
  const success = await authStore.login({
    email: email.value,
    password: password.value
  })

  if (success) {
    // Redirect to the intended page or dashboard
    const redirect = route.query.redirect as string
    router.push(redirect || '/app')
  }
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
          <h1 class="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p class="text-gray-600 mt-2">Sign in to your account to continue</p>
        </div>

        <!-- Error Message -->
        <Message v-if="authStore.error" severity="error" class="mb-4">
          {{ authStore.error }}
        </Message>

        <!-- Login Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
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
                class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label for="remember" class="ml-2 text-sm text-gray-600">
                Remember me
              </label>
            </div>
            <a href="#" class="text-sm text-indigo-600 hover:text-indigo-500">
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            label="Sign In"
            icon="pi pi-sign-in"
            class="w-full"
            :loading="authStore.loading"
          />
        </form>

        <!-- Sign Up Link -->
        <p class="mt-6 text-center text-sm text-gray-600">
          Don't have an account?
          <RouterLink to="/register" class="text-indigo-600 hover:text-indigo-500 font-medium">
            Create one now
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
