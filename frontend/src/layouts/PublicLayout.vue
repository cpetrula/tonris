<script setup lang="ts">
import { ref } from 'vue'
import { RouterView, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const mobileMenuOpen = ref(false)

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}
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
              <img src="/logo.svg" alt="TONRIS" class="h-10" />
            </RouterLink>
          </div>

          <!-- Desktop Navigation Links -->
          <div class="hidden md:flex items-center space-x-6">
            <RouterLink
              to="/how-it-works"
              class="text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors"
            >
              How It Works
            </RouterLink>
            <RouterLink
              to="/faq"
              class="text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors"
            >
              FAQ
            </RouterLink>
            <template v-if="authStore.isAuthenticated">
              <RouterLink
                to="/app"
                class="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors"
              >
                Dashboard
              </RouterLink>
            </template>
            <template v-else>
              <RouterLink
                to="/login"
                class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors"
              >
                Sign In
              </RouterLink>
              <RouterLink
                to="/signup"
                class="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors"
              >
                Get Started
              </RouterLink>
            </template>
          </div>

          <!-- Mobile Menu Button -->
          <div class="md:hidden flex items-center">
            <button
              type="button"
              class="text-gray-700 hover:text-violet-600 p-2"
              @click="toggleMobileMenu"
              aria-label="Toggle menu"
            >
              <i :class="mobileMenuOpen ? 'pi pi-times' : 'pi pi-bars'" class="text-xl"></i>
            </button>
          </div>
        </div>

        <!-- Mobile Navigation Menu -->
        <div 
          v-if="mobileMenuOpen" 
          class="md:hidden border-t border-gray-200 py-4 space-y-2"
        >
          <RouterLink
            to="/how-it-works"
            class="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            @click="closeMobileMenu"
          >
            How It Works
          </RouterLink>
          <RouterLink
            to="/faq"
            class="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            @click="closeMobileMenu"
          >
            FAQ
          </RouterLink>
          <template v-if="authStore.isAuthenticated">
            <RouterLink
              to="/app"
              class="block px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700"
              @click="closeMobileMenu"
            >
              Dashboard
            </RouterLink>
          </template>
          <template v-else>
            <RouterLink
              to="/login"
              class="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              @click="closeMobileMenu"
            >
              Sign In
            </RouterLink>
            <RouterLink
              to="/signup"
              class="block px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700"
              @click="closeMobileMenu"
            >
              Get Started
            </RouterLink>
          </template>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200">
      <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Brand -->
          <div class="col-span-1 md:col-span-2">
            <RouterLink to="/" class="flex items-center space-x-2 mb-4">
              <img src="/logo.svg" alt="TONRIS" class="h-8" />
            </RouterLink>
            <p class="text-sm text-gray-500 max-w-md">
              Your AI-powered phone receptionist that never sleeps. Handle every call professionally, 24/7.
            </p>
          </div>

          <!-- Links -->
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Product</h3>
            <ul class="space-y-2">
              <li>
                <RouterLink to="/how-it-works" class="text-sm text-gray-500 hover:text-gray-700">
                  How It Works
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/#pricing" class="text-sm text-gray-500 hover:text-gray-700">
                  Pricing
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/faq" class="text-sm text-gray-500 hover:text-gray-700">
                  FAQ
                </RouterLink>
              </li>
            </ul>
          </div>

          <!-- Legal -->
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Legal</h3>
            <ul class="space-y-2">
              <li>
                <a href="#" class="text-sm text-gray-500 hover:text-gray-700">Privacy Policy</a>
              </li>
              <li>
                <a href="#" class="text-sm text-gray-500 hover:text-gray-700">Terms of Service</a>
              </li>
              <li>
                <a href="mailto:support@tonris.com" class="text-sm text-gray-500 hover:text-gray-700">Contact</a>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-8 pt-8 border-t border-gray-200">
          <p class="text-sm text-gray-500 text-center">
            &copy; {{ new Date().getFullYear() }} TONRIS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>
