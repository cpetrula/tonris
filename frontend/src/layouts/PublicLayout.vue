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
  <div class="min-h-screen flex flex-col bg-[color:var(--criton-bg)] text-[color:var(--criton-text)]">
    <!-- Header -->
    <header
      class="sticky top-0 z-40 backdrop-blur-md bg-[color:var(--criton-bg)]/75 border-b border-[color:var(--criton-border)]"
    >
      <nav class="max-w-6xl mx-auto px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <RouterLink to="/" class="flex items-center gap-3 group">
            <img src="/criton-logo.png" alt="CRITON.AI" class="h-10 w-auto" />
            <div class="flex flex-col leading-none">
              <span class="font-display text-lg font-bold tracking-tight text-[color:var(--criton-text)]">
                CRITON.AI
              </span>
              <span class="text-[10px] tracking-[0.22em] uppercase text-[color:var(--criton-text-dim)] mt-0.5">
                AI Studio
              </span>
            </div>
          </RouterLink>

          <!-- Desktop Nav -->
          <div class="hidden md:flex items-center gap-8">
            <RouterLink
              to="/about"
              class="text-sm text-[color:var(--criton-text-muted)] hover:text-[color:var(--criton-gold-bright)] transition-colors"
            >
              About
            </RouterLink>
            <RouterLink
              to="/faq"
              class="text-sm text-[color:var(--criton-text-muted)] hover:text-[color:var(--criton-gold-bright)] transition-colors"
            >
              FAQ
            </RouterLink>
            <RouterLink
              to="/contact"
              class="text-sm text-[color:var(--criton-text-muted)] hover:text-[color:var(--criton-gold-bright)] transition-colors"
            >
              Contact
            </RouterLink>
            <template v-if="authStore.isAuthenticated">
              <RouterLink to="/app" class="criton-btn-primary !py-2 !px-4 !text-sm">
                Dashboard
              </RouterLink>
            </template>
            <template v-else>
              <RouterLink to="/contact" class="criton-btn-primary !py-2 !px-4 !text-sm">
                Start a project
              </RouterLink>
            </template>
          </div>

          <!-- Mobile toggle -->
          <button
            type="button"
            class="md:hidden text-[color:var(--criton-text-muted)] hover:text-[color:var(--criton-gold-bright)] p-2"
            @click="toggleMobileMenu"
            aria-label="Toggle menu"
          >
            <i :class="mobileMenuOpen ? 'pi pi-times' : 'pi pi-bars'" class="text-xl"></i>
          </button>
        </div>

        <!-- Mobile Menu -->
        <div
          v-if="mobileMenuOpen"
          class="md:hidden border-t border-[color:var(--criton-border)] py-4 space-y-1"
        >
          <RouterLink
            v-for="item in ['about', 'faq', 'contact']"
            :key="item"
            :to="`/${item}`"
            class="block px-3 py-2 text-sm text-[color:var(--criton-text-muted)] hover:text-[color:var(--criton-gold-bright)] capitalize"
            @click="closeMobileMenu"
          >
            {{ item }}
          </RouterLink>
          <template v-if="authStore.isAuthenticated">
            <RouterLink
              to="/app"
              class="block mt-2 mx-3 criton-btn-primary !py-2 !px-4 !text-sm text-center"
              @click="closeMobileMenu"
            >
              Dashboard
            </RouterLink>
          </template>
          <template v-else>
            <RouterLink
              to="/contact"
              class="block mt-2 mx-3 criton-btn-primary !py-2 !px-4 !text-sm text-center"
              @click="closeMobileMenu"
            >
              Start a project
            </RouterLink>
          </template>
        </div>
      </nav>
    </header>

    <!-- Main -->
    <main class="flex-1">
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="border-t border-[color:var(--criton-border)] bg-[color:var(--criton-bg)]">
      <div class="max-w-6xl mx-auto px-6 lg:px-8 py-14">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-10">
          <!-- Brand -->
          <div class="md:col-span-5">
            <RouterLink to="/" class="flex items-center gap-3 mb-4">
              <img src="/criton-logo.png" alt="CRITON.AI" class="h-10 w-auto" />
              <div class="flex flex-col leading-none">
                <span class="font-display text-lg font-bold tracking-tight">CRITON.AI</span>
                <span class="text-[10px] tracking-[0.22em] uppercase text-[color:var(--criton-text-dim)] mt-0.5">
                  AI Studio
                </span>
              </div>
            </RouterLink>
            <p class="text-sm text-[color:var(--criton-text-muted)] max-w-sm leading-relaxed">
              An AI studio designing, building, and shipping custom platforms for companies that
              want to own the product.
            </p>
          </div>

          <!-- Links -->
          <div class="md:col-span-3">
            <h3 class="criton-eyebrow mb-4 text-[color:var(--criton-text-dim)]">Studio</h3>
            <ul class="space-y-2.5">
              <li>
                <RouterLink to="/about" class="text-sm text-[color:var(--criton-text-muted)] hover:text-[color:var(--criton-gold-bright)] transition-colors">
                  About
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/faq" class="text-sm text-[color:var(--criton-text-muted)] hover:text-[color:var(--criton-gold-bright)] transition-colors">
                  FAQ
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/contact" class="text-sm text-[color:var(--criton-text-muted)] hover:text-[color:var(--criton-gold-bright)] transition-colors">
                  Contact
                </RouterLink>
              </li>
            </ul>
          </div>

          <!-- Contact -->
          <div class="md:col-span-4">
            <h3 class="criton-eyebrow mb-4 text-[color:var(--criton-text-dim)]">Contact</h3>
            <ul class="space-y-2.5">
              <li>
                <a href="tel:+18185316200" class="text-sm text-[color:var(--criton-text-muted)] hover:text-[color:var(--criton-gold-bright)] transition-colors inline-flex items-center gap-2">
                  <i class="pi pi-phone text-xs"></i>
                  (818) 531-6200
                </a>
              </li>
              <li>
                <a href="mailto:info@criton.ai" class="text-sm text-[color:var(--criton-text-muted)] hover:text-[color:var(--criton-gold-bright)] transition-colors inline-flex items-center gap-2">
                  <i class="pi pi-envelope text-xs"></i>
                  info@criton.ai
                </a>
              </li>
              <li class="text-sm text-[color:var(--criton-text-muted)] inline-flex items-center gap-2">
                <i class="pi pi-map-marker text-xs"></i>
                Los Angeles, CA
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-12 pt-6 border-t border-[color:var(--criton-border)] flex flex-col sm:flex-row justify-between gap-3">
          <p class="text-xs text-[color:var(--criton-text-dim)]">
            &copy; {{ new Date().getFullYear() }} CRITON.AI · All rights reserved.
          </p>
          <div class="flex gap-5">
            <a href="#" class="text-xs text-[color:var(--criton-text-dim)] hover:text-[color:var(--criton-text-muted)]">Privacy</a>
            <a href="#" class="text-xs text-[color:var(--criton-text-dim)] hover:text-[color:var(--criton-text-muted)]">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
