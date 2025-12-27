<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterView, RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import InactiveAccountBanner from '@/components/InactiveAccountBanner.vue'
import type { MenuItem } from 'primevue/menuitem'

const router = useRouter()
const authStore = useAuthStore()
const tenantStore = useTenantStore()

const sidebarOpen = ref(false)
const userMenu = ref()

const userMenuItems: MenuItem[] = [
  {
    label: 'Profile',
    icon: 'pi pi-user',
    command: () => router.push('/app/profile')
  },
  {
    label: 'Settings',
    icon: 'pi pi-cog',
    command: () => router.push('/app/settings')
  },
  {
    separator: true
  },
  {
    label: 'Sign Out',
    icon: 'pi pi-sign-out',
    command: () => handleLogout()
  }
]

const navigationItems = [
  { name: 'Dashboard', path: '/app', icon: 'pi pi-home' },
  { name: 'Appointments', path: '/app/appointments', icon: 'pi pi-calendar' },
  { name: 'Employees', path: '/app/employees', icon: 'pi pi-users' },
  { name: 'Services', path: '/app/services', icon: 'pi pi-list' },
  { name: 'Reports', path: '/app/reports', icon: 'pi pi-chart-line' },
  { name: 'Billing', path: '/app/billing', icon: 'pi pi-credit-card' },
  { name: 'Settings', path: '/app/settings', icon: 'pi pi-cog' }
]

function toggleUserMenu(event: Event) {
  userMenu.value.toggle(event)
}

async function handleLogout() {
  await authStore.logout()
  tenantStore.clearTenant()
  router.push('/login')
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '')
  
  // Format as (XXX) XXX-XXXX for US numbers
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  } else if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  
  // Return original if not a standard format
  return phoneNumber
}

onMounted(async () => {
  // Fetch user data if not loaded
  if (!authStore.user && authStore.token) {
    await authStore.fetchUser()
  }
  // Fetch tenants
  await tenantStore.fetchTenants()
})
</script>

<template>
  <div class="min-h-screen flex bg-gray-100">
    <!-- Sidebar - Mobile Overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
      @click="toggleSidebar"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center justify-center border-b border-gray-200 px-4">
        <RouterLink to="/app" class="flex items-center space-x-2">
          <img src="/logo1.png" alt="CRITON.AI" class="h-8 w-auto" />
          <div class="flex flex-col">
            <span class="text-base font-bold text-gray-900 tracking-tight">CRITON.AI</span>
            <span class="text-[10px] text-gray-500 tracking-wider">Smart Assistants</span>
          </div>
        </RouterLink>
      </div>

      <!-- Navigation -->
      <nav class="mt-6 px-4">
        <div class="space-y-2">
          <RouterLink
            v-for="item in navigationItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-violet-50 hover:text-violet-600 transition-colors"
            active-class="bg-violet-50 text-violet-600"
          >
            <i :class="[item.icon, 'mr-3']"></i>
            {{ item.name }}
          </RouterLink>
        </div>
      </nav>

      <!-- Tenant Info -->
      <div v-if="tenantStore.currentTenant" class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div class="text-xs text-gray-500 uppercase tracking-wide mb-1">Current Workspace</div>
        <div class="text-sm font-medium text-gray-900">{{ tenantStore.tenantName }}</div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top Header -->
      <header class="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
        <!-- Mobile Menu Button -->
        <Button
          icon="pi pi-bars"
          text
          class="lg:hidden"
          @click="toggleSidebar"
          aria-label="Toggle menu"
        />
        
        <!-- Search / Breadcrumb placeholder -->
        <div class="flex-1 px-4">
          <!-- AI Phone Number Display -->
          <div v-if="tenantStore.currentTenant?.twilioPhoneNumber" class="flex items-center space-x-2">
            <i class="pi pi-phone text-violet-600"></i>
            <span class="text-sm font-medium text-surface-700 dark:text-surface-300">
              Your AI phone #: 
            </span>
            <span class="text-sm font-semibold text-violet-600 dark:text-violet-400">
              {{ formatPhoneNumber(tenantStore.currentTenant.twilioPhoneNumber) }}
            </span>
          </div>
        </div>

        <!-- User Menu -->
        <div class="flex items-center space-x-4">
          <Button
            icon="pi pi-bell"
            text
            badge="3"
            badge-severity="danger"
            aria-label="Notifications"
          />
          
          <div class="relative">
            <Button
              text
              class="flex items-center space-x-2"
              @click="toggleUserMenu"
            >
              <div class="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white font-medium">
                {{ authStore.user?.firstName?.charAt(0) || 'U' }}
              </div>
              <span class="hidden md:block text-gray-700">{{ authStore.user?.firstName || '' }} {{ authStore.user?.lastName || '' }}</span>
              <i class="pi pi-chevron-down text-gray-500"></i>
            </Button>
            <Menu ref="userMenu" :model="userMenuItems" popup />
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-4 lg:p-6">
        <!-- Inactive Account Banner -->
        <InactiveAccountBanner />
        
        <RouterView />
      </main>
    </div>
  </div>
</template>
