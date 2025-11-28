<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import Card from 'primevue/card'

const authStore = useAuthStore()
const tenantStore = useTenantStore()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})

const stats = [
  { label: 'Active Projects', value: '12', icon: 'pi pi-folder', color: 'bg-blue-500' },
  { label: 'Tasks Completed', value: '147', icon: 'pi pi-check-circle', color: 'bg-green-500' },
  { label: 'Team Members', value: '8', icon: 'pi pi-users', color: 'bg-purple-500' },
  { label: 'API Calls', value: '2.4K', icon: 'pi pi-bolt', color: 'bg-orange-500' }
]

const recentActivity = [
  { action: 'Project created', item: 'Marketing Campaign Q4', time: '2 hours ago' },
  { action: 'Task completed', item: 'Review content strategy', time: '4 hours ago' },
  { action: 'Member joined', item: 'Sarah Johnson', time: 'Yesterday' },
  { action: 'API key generated', item: 'Production key', time: '2 days ago' }
]
</script>

<template>
  <div>
    <!-- Welcome Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">
        {{ greeting }}, {{ authStore.user?.firstName || 'User' }}!
      </h1>
      <p class="text-gray-600 mt-1">
        Here's what's happening with your {{ tenantStore.tenantName || 'workspace' }} today.
      </p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card v-for="stat in stats" :key="stat.label" class="shadow-sm">
        <template #content>
          <div class="flex items-center">
            <div :class="[stat.color, 'w-12 h-12 rounded-lg flex items-center justify-center']">
              <i :class="[stat.icon, 'text-xl text-white']"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">{{ stat.label }}</p>
              <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Activity -->
      <Card class="shadow-sm">
        <template #title>
          <div class="flex items-center justify-between">
            <span>Recent Activity</span>
            <a href="#" class="text-sm text-violet-600 hover:text-violet-500">View all</a>
          </div>
        </template>
        <template #content>
          <div class="space-y-4">
            <div
              v-for="(activity, index) in recentActivity"
              :key="index"
              class="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0"
            >
              <div class="w-2 h-2 mt-2 rounded-full bg-violet-500"></div>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">{{ activity.action }}</p>
                <p class="text-sm text-gray-500">{{ activity.item }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ activity.time }}</p>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Quick Actions -->
      <Card class="shadow-sm">
        <template #title>Quick Actions</template>
        <template #content>
          <div class="grid grid-cols-2 gap-4">
            <button class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left">
              <i class="pi pi-plus-circle text-2xl text-violet-600 mb-2 block"></i>
              <span class="text-sm font-medium text-gray-900">New Project</span>
            </button>
            <button class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left">
              <i class="pi pi-user-plus text-2xl text-cyan-600 mb-2 block"></i>
              <span class="text-sm font-medium text-gray-900">Invite Team</span>
            </button>
            <button class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left">
              <i class="pi pi-key text-2xl text-fuchsia-600 mb-2 block"></i>
              <span class="text-sm font-medium text-gray-900">API Keys</span>
            </button>
            <button class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left">
              <i class="pi pi-cog text-2xl text-gray-600 mb-2 block"></i>
              <span class="text-sm font-medium text-gray-900">Settings</span>
            </button>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
