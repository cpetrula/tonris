<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import Card from 'primevue/card'
import Button from 'primevue/button'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const authStore = useAuthStore()
const tenantStore = useTenantStore()
const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})

interface AppointmentItem {
  id: string
  customerName: string
  service: string
  time: string
  employee: string
}

interface ActivityItem {
  type: string
  action: string
  item: string
  timestamp: string
  time?: string
}

// Dashboard stats for the current tenant
const stats = ref<{ label: string; value: string; icon: string; color: string }[]>([
  { label: "Today's Appointments", value: '0', icon: 'pi pi-calendar', color: 'bg-blue-500' },
  { label: 'Pending Calls', value: '0', icon: 'pi pi-phone', color: 'bg-orange-500' },
  { label: 'Active Employees', value: '0', icon: 'pi pi-users', color: 'bg-green-500' },
  { label: 'Services Offered', value: '0', icon: 'pi pi-list', color: 'bg-purple-500' }
])

// Upcoming appointments for today
const upcomingAppointments = ref<AppointmentItem[]>([])

// Recent activity
const recentActivity = ref<ActivityItem[]>([])

function navigateTo(path: string) {
  router.push(path)
}

function navigateToStatDetails(index: number) {
  // Navigate to appropriate page based on stat index
  const routes = ['/app/appointments', '/app/appointments', '/app/employees', '/app/services']
  if (routes[index]) {
    router.push(routes[index])
  }
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function formatRelativeTime(dateString: string): string {
  const now = new Date()
  const past = new Date(dateString)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  if (diffDays === 1) return 'Yesterday'
  return `${diffDays} days ago`
}

async function fetchDashboardData() {
  loading.value = true
  error.value = null
  
  try {
    const response = await api.get('/api/tenant/dashboard-stats')
    const data = response.data.data
    
    // Update stats using a more robust approach
    if (data.stats) {
      const statMap: Record<string, keyof typeof data.stats> = {
        "Today's Appointments": 'todayAppointments',
        'Pending Calls': 'pendingCalls',
        'Active Employees': 'activeEmployees',
        'Services Offered': 'servicesOffered'
      }
      
      stats.value.forEach(stat => {
        const key = statMap[stat.label]
        if (key && data.stats[key] !== undefined) {
          stat.value = String(data.stats[key])
        }
      })
    }
    
    // Update appointments
    if (data.todayAppointments) {
      upcomingAppointments.value = data.todayAppointments.map((apt: AppointmentItem) => ({
        ...apt,
        time: formatTime(apt.time)
      }))
    }
    
    // Update recent activity
    if (data.recentActivity) {
      recentActivity.value = data.recentActivity.map((activity: ActivityItem) => ({
        ...activity,
        time: formatRelativeTime(activity.timestamp)
      }))
    }
  } catch (err) {
    console.error('Failed to fetch dashboard data:', err)
    error.value = 'Failed to load dashboard data'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchDashboardData()
})
</script>

<template>
  <div>
    <!-- Welcome Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">
        {{ greeting }}, {{ authStore.user?.firstName || 'User' }}!
      </h1>
      <p class="text-gray-600 mt-1">
        Here's what's happening with {{ tenantStore.tenantName || 'your business' }} today.
      </p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 rounded-lg">
      <p class="text-red-800 dark:text-red-300">{{ error }}</p>
    </div>

    <!-- Phone Forwarding Setup Banner -->
    <Card class="mb-6 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
      <template #content>
        <div class="flex items-center justify-between">
          <div class="flex items-start gap-4">
            <div class="bg-violet-100 p-3 rounded-lg">
              <i class="pi pi-phone text-2xl text-violet-600"></i>
            </div>
            <div>
              <h3 class="font-semibold">Set Up Call Forwarding</h3>
              <p class="text-sm mt-1">
                Forward calls from your business phone to Criton.AI so our AI receptionist can handle them.
              </p>
            </div>
          </div>
          <Button
            label="View Instructions"
            icon="pi pi-arrow-right"
            iconPos="right"
            @click="navigateTo('/app/phone-forwarding')"
          />
        </div>
      </template>
    </Card>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card 
        v-for="(stat, index) in stats" 
        :key="stat.label" 
        class="shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        @click="navigateToStatDetails(index)"
      >
        <template #content>
          <div class="flex items-center">
            <div :class="[stat.color, 'w-12 h-12 rounded-lg flex items-center justify-center']">
              <i :class="[stat.icon, 'text-xl text-white']"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-white-600">{{ stat.label }}</p>
              <p class="text-2xl font-bold text-white-900">{{ stat.value }}</p>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Upcoming Appointments -->
      <Card class="shadow-sm">
        <template #title>
          <div class="flex items-center justify-between">
            <span>Today's Appointments</span>
            <Button 
              label="View All" 
              text 
              size="small" 
              @click="navigateTo('/app/appointments')"
            />
          </div>
        </template>
        <template #content>
          <div class="space-y-4">
            <div
              v-for="appointment in upcomingAppointments"
              :key="appointment.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p class="font-medium text-white-900">{{ appointment.customerName }}</p>
                <p class="text-sm text-white-600">{{ appointment.service }} with {{ appointment.employee }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-violet-600">{{ appointment.time }}</p>
              </div>
            </div>
            <div v-if="upcomingAppointments.length === 0" class="text-center py-8 text-white-600">
              No appointments scheduled for today
            </div>
          </div>
        </template>
      </Card>

      <!-- Recent Activity -->
      <Card v-if="recentActivity.length > 0" class="shadow-sm">
        <template #title>
          <div class="flex items-center justify-between">
            <span>Recent Activity</span>
            <Button 
              label="View Reports" 
              text 
              size="small"
              @click="navigateTo('/app/reports')"
            />
          </div>
        </template>
        <template #content>
          <div class="space-y-4">
            <div
              v-for="(activity, index) in recentActivity"
              :key="index"
              class="flex items-start pb-4 border-b border-gray-200 last:border-0 last:pb-0"
            >
              <div class="w-2 h-2 mt-2 rounded-full bg-violet-500"></div>
              <div class="ml-3">
                <p class="text-sm font-medium text-white-900">{{ activity.action }}</p>
                <p class="text-sm text-white-600">{{ activity.item }}</p>
                <p class="text-xs text-white-500 mt-1">{{ activity.time }}</p>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Quick Actions -->
      <!-- <Card class="shadow-sm lg:col-span-2">
        <template #title>Quick Actions</template>
        <template #content>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
              @click="navigateTo('/app/appointments')"
            >
              <i class="pi pi-calendar-plus text-2xl text-violet-600 mb-2 block"></i>
              <span class="text-sm font-medium text-gray-900">New Appointment</span>
            </button>
            <button 
              class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
              @click="navigateTo('/app/employees')"
            >
              <i class="pi pi-user-plus text-2xl text-cyan-600 mb-2 block"></i>
              <span class="text-sm font-medium text-gray-900">Add Employee</span>
            </button>
            <button 
              class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
              @click="navigateTo('/app/services')"
            >
              <i class="pi pi-plus-circle text-2xl text-fuchsia-600 mb-2 block"></i>
              <span class="text-sm font-medium text-gray-900">Add Service</span>
            </button>
            <button 
              class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
              @click="navigateTo('/app/settings')"
            >
              <i class="pi pi-cog text-2xl text-gray-600 mb-2 block"></i>
              <span class="text-sm font-medium text-gray-900">Settings</span>
            </button>
          </div>
        </template>
      </Card> -->
    </div>
  </div>
</template>
