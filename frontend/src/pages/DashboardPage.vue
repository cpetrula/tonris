<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import Card from 'primevue/card'
import Button from 'primevue/button'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const tenantStore = useTenantStore()
const router = useRouter()

const loading = ref(false)

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})

// Dashboard stats for the current tenant
const stats = ref([
  { label: "Today's Appointments", value: '8', icon: 'pi pi-calendar', color: 'bg-blue-500' },
  { label: 'Pending Calls', value: '12', icon: 'pi pi-phone', color: 'bg-orange-500' },
  { label: 'Active Employees', value: '5', icon: 'pi pi-users', color: 'bg-green-500' },
  { label: 'Services Offered', value: '15', icon: 'pi pi-list', color: 'bg-purple-500' }
])

// Upcoming appointments for today
const upcomingAppointments = ref([
  { id: '1', customerName: 'John Smith', service: 'Haircut', time: '10:00 AM', employee: 'Sarah Johnson' },
  { id: '2', customerName: 'Emily Davis', service: 'Color Treatment', time: '11:30 AM', employee: 'Mike Brown' },
  { id: '3', customerName: 'Robert Wilson', service: 'Beard Trim', time: '2:00 PM', employee: 'Sarah Johnson' },
  { id: '4', customerName: 'Lisa Anderson', service: 'Hair Styling', time: '3:30 PM', employee: 'Jessica Lee' }
])

// Recent activity
const recentActivity = ref([
  { action: 'New appointment booked', item: 'John Smith - Haircut', time: '15 minutes ago' },
  { action: 'Call answered', item: 'Inquiry about services', time: '30 minutes ago' },
  { action: 'Appointment completed', item: 'Emily Davis - Manicure', time: '1 hour ago' },
  { action: 'New customer registered', item: 'Michael Brown', time: '2 hours ago' }
])

function navigateTo(path: string) {
  router.push(path)
}

onMounted(async () => {
  loading.value = true
  // In a real app, fetch dashboard data from API using tenantStore.tenantId
  // await api.get(`/api/tenants/${tenantStore.tenantId}/dashboard`)
  loading.value = false
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
                <p class="font-medium text-gray-900">{{ appointment.customerName }}</p>
                <p class="text-sm text-gray-500">{{ appointment.service }} with {{ appointment.employee }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-violet-600">{{ appointment.time }}</p>
              </div>
            </div>
            <div v-if="upcomingAppointments.length === 0" class="text-center py-8 text-gray-500">
              No appointments scheduled for today
            </div>
          </div>
        </template>
      </Card>

      <!-- Recent Activity -->
      <Card class="shadow-sm">
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
      <Card class="shadow-sm lg:col-span-2">
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
      </Card>
    </div>
  </div>
</template>
