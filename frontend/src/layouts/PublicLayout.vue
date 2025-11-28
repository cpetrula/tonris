<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <RouterLink to="/" class="flex items-center space-x-2">
              <span class="text-2xl font-bold text-indigo-600">TONRIS</span>
            </RouterLink>
          </div>

          <!-- Navigation Links -->
          <div class="flex items-center space-x-4">
            <template v-if="authStore.isAuthenticated">
              <RouterLink
                to="/app"
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Dashboard
              </RouterLink>
            </template>
            <template v-else>
              <RouterLink
                to="/login"
                class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Sign In
              </RouterLink>
              <RouterLink
                to="/register"
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </RouterLink>
            </template>
          </div>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <p class="text-sm text-gray-500">
            &copy; {{ new Date().getFullYear() }} TONRIS. All rights reserved.
          </p>
          <div class="flex space-x-6 mt-4 md:mt-0">
            <a href="#" class="text-sm text-gray-500 hover:text-gray-700">Privacy Policy</a>
            <a href="#" class="text-sm text-gray-500 hover:text-gray-700">Terms of Service</a>
            <a href="#" class="text-sm text-gray-500 hover:text-gray-700">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
