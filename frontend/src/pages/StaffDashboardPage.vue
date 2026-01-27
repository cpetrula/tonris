<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Textarea from 'primevue/textarea'
import ConfirmDialog from 'primevue/confirmdialog'
import SelectButton from 'primevue/selectbutton'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

const authStore = useAuthStore()
const confirm = useConfirm()
const toast = useToast()

// State
const loading = ref(false)
const todayAppointments = ref<any[]>([])
const upcomingAppointments = ref<any[]>([])
const completedAppointments = ref<any[]>([])
const services = ref<any[]>([])

// View state
const activeView = ref('today')
const viewOptions = [
  { label: 'Today', value: 'today' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'History', value: 'completed' }
]

// Dialog state
const appointmentDialog = ref(false)
const editingAppointment = ref<any>(null)
const appointmentForm = ref({
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  serviceId: '',
  startTime: null as Date | null,
  notes: ''
})

// Filter state for completed appointments
const completedDateRange = ref<Date[] | null>(null)

// Get employee ID from auth store
const employeeId = computed(() => authStore.user?.employeeId)

// Current appointments based on view
const currentAppointments = computed(() => {
  switch (activeView.value) {
    case 'today': return todayAppointments.value
    case 'upcoming': return upcomingAppointments.value
    case 'completed': return completedAppointments.value
    default: return []
  }
})

// Date helpers
const today = computed(() => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
})

const endOfToday = computed(() => {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d
})

const upcomingEndDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  d.setHours(23, 59, 59, 999)
  return d
})

// Status styling
function getStatusSeverity(status: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
  const map: Record<string, "success" | "info" | "warn" | "danger" | "secondary" | "contrast"> = {
    scheduled: 'info',
    confirmed: 'success',
    in_progress: 'warn',
    completed: 'success',
    cancelled: 'danger',
    no_show: 'danger'
  }
  return map[status] || 'info'
}

function formatStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

function formatDateShort(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (date.toDateString() === now.toDateString()) {
    return 'Today'
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow'
  }
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatDateFull(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

// Check if appointment can be actioned
function canAction(appointment: any) {
  return appointment.status !== 'completed' && appointment.status !== 'cancelled'
}

// Fetch appointments
async function fetchAppointments() {
  if (!employeeId.value) {
    console.error('No employee ID found for user')
    return
  }
  
  loading.value = true
  try {
    const todayResponse = await api.get('/api/appointments', {
      params: {
        employeeId: employeeId.value,
        startDate: today.value.toISOString(),
        endDate: endOfToday.value.toISOString()
      }
    })
    todayAppointments.value = todayResponse.data.data.appointments || []
    
    const tomorrow = new Date(today.value)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const upcomingResponse = await api.get('/api/appointments', {
      params: {
        employeeId: employeeId.value,
        startDate: tomorrow.toISOString(),
        endDate: upcomingEndDate.value.toISOString()
      }
    })
    upcomingAppointments.value = upcomingResponse.data.data.appointments || []
    
    await fetchCompletedAppointments()
  } catch (error) {
    console.error('Failed to fetch appointments:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load appointments', life: 3000 })
  } finally {
    loading.value = false
  }
}

async function fetchCompletedAppointments() {
  if (!employeeId.value) return
  
  const endDate = new Date()
  const startDate = completedDateRange.value?.[0] || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const filterEndDate = completedDateRange.value?.[1] || endDate
  
  try {
    const response = await api.get('/api/appointments', {
      params: {
        employeeId: employeeId.value,
        status: 'completed',
        startDate: startDate.toISOString(),
        endDate: filterEndDate.toISOString()
      }
    })
    completedAppointments.value = response.data.data.appointments || []
  } catch (error) {
    console.error('Failed to fetch completed appointments:', error)
  }
}

async function fetchServices() {
  try {
    const response = await api.get('/api/services')
    services.value = response.data.data.services || []
  } catch (error) {
    console.error('Failed to fetch services:', error)
  }
}

// Dialog actions
function openNewAppointment() {
  editingAppointment.value = null
  appointmentForm.value = {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    serviceId: '',
    startTime: null,
    notes: ''
  }
  appointmentDialog.value = true
}

function openEditAppointment(appointment: any) {
  editingAppointment.value = appointment
  appointmentForm.value = {
    customerName: appointment.customerName,
    customerEmail: appointment.customerEmail || '',
    customerPhone: appointment.customerPhone || '',
    serviceId: appointment.serviceId,
    startTime: new Date(appointment.startTime),
    notes: appointment.notes || ''
  }
  appointmentDialog.value = true
}

async function saveAppointment() {
  if (!appointmentForm.value.customerName || !appointmentForm.value.serviceId || !appointmentForm.value.startTime) {
    toast.add({ severity: 'warn', summary: 'Validation', detail: 'Please fill in all required fields', life: 3000 })
    return
  }

  try {
    const payload = {
      ...appointmentForm.value,
      employeeId: employeeId.value,
      startTime: appointmentForm.value.startTime?.toISOString()
    }

    if (editingAppointment.value) {
      await api.patch(`/api/appointments/${editingAppointment.value.id}`, payload)
      toast.add({ severity: 'success', summary: 'Success', detail: 'Appointment updated', life: 3000 })
    } else {
      await api.post('/api/appointments', payload)
      toast.add({ severity: 'success', summary: 'Success', detail: 'Appointment created', life: 3000 })
    }

    appointmentDialog.value = false
    await fetchAppointments()
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.error || 'Failed to save appointment', life: 3000 })
  }
}

function confirmCancelAppointment(appointment: any) {
  confirm.require({
    message: `Cancel appointment for ${appointment.customerName}?`,
    header: 'Cancel Appointment',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await api.patch(`/api/appointments/${appointment.id}`, { status: 'cancelled', cancellationReason: 'employee_unavailable' })
        toast.add({ severity: 'success', summary: 'Cancelled', detail: 'Appointment has been cancelled', life: 3000 })
        await fetchAppointments()
      } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.error || 'Failed to cancel', life: 3000 })
      }
    }
  })
}

function confirmCompleteAppointment(appointment: any) {
  confirm.require({
    message: `Mark appointment for ${appointment.customerName} as completed?`,
    header: 'Complete Appointment',
    icon: 'pi pi-check-circle',
    accept: async () => {
      try {
        await api.patch(`/api/appointments/${appointment.id}`, { status: 'completed' })
        toast.add({ severity: 'success', summary: 'Completed', detail: 'Appointment marked as completed', life: 3000 })
        await fetchAppointments()
      } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.error || 'Failed to update', life: 3000 })
      }
    }
  })
}

function onCompletedFilterChange() {
  fetchCompletedAppointments()
}

onMounted(() => {
  fetchAppointments()
  fetchServices()
})
</script>

<template>
  <div class="staff-dashboard pb-20 md:pb-4">
    <ConfirmDialog />
    
    <!-- Compact Header -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-xl md:text-2xl font-bold text-gray-900">My Schedule</h1>
        <p class="text-sm text-gray-500">{{ authStore.user?.firstName }}</p>
      </div>
      <!-- Desktop add button -->
      <Button 
        label="New" 
        icon="pi pi-plus" 
        size="small"
        class="hidden md:flex"
        @click="openNewAppointment"
      />
    </div>

    <!-- Stats Row - Horizontal scroll on mobile -->
    <div class="flex gap-3 mb-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
      <div 
        class="flex-shrink-0 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 min-w-[140px] cursor-pointer"
        :class="{ 'ring-2 ring-blue-500': activeView === 'today' }"
        @click="activeView = 'today'"
      >
        <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <i class="pi pi-calendar text-white"></i>
        </div>
        <div>
          <p class="text-xs text-blue-600 font-medium">Today</p>
          <p class="text-xl font-bold text-blue-900">{{ todayAppointments.length }}</p>
        </div>
      </div>
      
      <div 
        class="flex-shrink-0 flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-lg px-4 py-3 min-w-[140px] cursor-pointer"
        :class="{ 'ring-2 ring-violet-500': activeView === 'upcoming' }"
        @click="activeView = 'upcoming'"
      >
        <div class="w-10 h-10 bg-violet-500 rounded-lg flex items-center justify-center">
          <i class="pi pi-clock text-white"></i>
        </div>
        <div>
          <p class="text-xs text-violet-600 font-medium">Upcoming</p>
          <p class="text-xl font-bold text-violet-900">{{ upcomingAppointments.length }}</p>
        </div>
      </div>
      
      <div 
        class="flex-shrink-0 flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 min-w-[140px] cursor-pointer"
        :class="{ 'ring-2 ring-green-500': activeView === 'completed' }"
        @click="activeView = 'completed'"
      >
        <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
          <i class="pi pi-check-circle text-white"></i>
        </div>
        <div>
          <p class="text-xs text-green-600 font-medium">History</p>
          <p class="text-xl font-bold text-green-900">{{ completedAppointments.length }}</p>
        </div>
      </div>
    </div>

    <!-- View Selector (desktop) -->
    <div class="hidden md:flex mb-4">
      <SelectButton 
        v-model="activeView" 
        :options="viewOptions" 
        optionLabel="label" 
        optionValue="value"
        :allowEmpty="false"
      />
    </div>

    <!-- Date filter for completed view -->
    <div v-if="activeView === 'completed'" class="mb-4 flex flex-wrap items-center gap-2">
      <span class="text-sm text-gray-600">Filter:</span>
      <Calendar 
        v-model="completedDateRange" 
        selectionMode="range" 
        dateFormat="M d"
        placeholder="Date range"
        showIcon
        class="w-full md:w-auto"
        @update:modelValue="onCompletedFilterChange"
      />
      <Button 
        v-if="completedDateRange"
        icon="pi pi-times" 
        text 
        rounded 
        size="small"
        @click="completedDateRange = null; onCompletedFilterChange()"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <i class="pi pi-spin pi-spinner text-2xl text-violet-600"></i>
    </div>

    <!-- Empty State -->
    <div v-else-if="currentAppointments.length === 0" class="text-center py-12">
      <i class="pi pi-calendar text-4xl text-gray-300 mb-3"></i>
      <p class="text-gray-500">
        {{ activeView === 'today' ? 'No appointments today' : 
           activeView === 'upcoming' ? 'No upcoming appointments' : 
           'No completed appointments' }}
      </p>
    </div>

    <!-- Appointment Cards -->
    <div v-else class="space-y-3">
      <div 
        v-for="apt in currentAppointments" 
        :key="apt.id"
        class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <!-- Card Header - Time prominent -->
        <div class="flex items-stretch">
          <!-- Time block -->
          <div class="bg-violet-600 text-white px-4 py-3 flex flex-col justify-center min-w-[90px]">
            <span class="text-lg font-bold leading-tight">{{ formatTime(apt.startTime) }}</span>
            <span v-if="activeView !== 'today'" class="text-xs text-violet-200">{{ formatDateShort(apt.startTime) }}</span>
          </div>
          
          <!-- Main content -->
          <div class="flex-1 px-4 py-3">
            <div class="flex items-start justify-between">
              <div class="min-w-0 flex-1">
                <h3 class="font-semibold text-gray-900 truncate">{{ apt.customerName }}</h3>
                <p class="text-sm text-gray-600 truncate">{{ apt.service?.name || 'Service' }}</p>
              </div>
              <Tag 
                :value="formatStatus(apt.status)" 
                :severity="getStatusSeverity(apt.status)"
                class="ml-2 flex-shrink-0"
              />
            </div>
            
            <!-- Duration -->
            <p class="text-xs text-gray-400 mt-1">
              {{ apt.service?.duration || 0 }} min
              <span v-if="apt.customerPhone" class="ml-2">
                <i class="pi pi-phone text-xs"></i> {{ apt.customerPhone }}
              </span>
            </p>
          </div>
        </div>
        
        <!-- Action buttons -->
        <div v-if="canAction(apt)" class="flex border-t border-gray-100 divide-x divide-gray-100">
          <button 
            class="flex-1 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1"
            @click="openEditAppointment(apt)"
          >
            <i class="pi pi-pencil text-xs"></i> Edit
          </button>
          <button 
            class="flex-1 py-2.5 text-sm font-medium text-green-600 hover:bg-green-50 flex items-center justify-center gap-1"
            @click="confirmCompleteAppointment(apt)"
          >
            <i class="pi pi-check text-xs"></i> Done
          </button>
          <button 
            class="flex-1 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center justify-center gap-1"
            @click="confirmCancelAppointment(apt)"
          >
            <i class="pi pi-times text-xs"></i> Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile FAB -->
    <button 
      class="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-violet-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-violet-700 active:scale-95 transition-transform z-50"
      @click="openNewAppointment"
    >
      <i class="pi pi-plus text-xl"></i>
    </button>

    <!-- Appointment Dialog -->
    <Dialog 
      v-model:visible="appointmentDialog" 
      :header="editingAppointment ? 'Edit Appointment' : 'New Appointment'"
      :style="{ width: '95vw', maxWidth: '500px' }"
      :breakpoints="{ '640px': '95vw' }"
      modal
      :dismissableMask="true"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
          <InputText 
            v-model="appointmentForm.customerName" 
            class="w-full"
            placeholder="Customer name"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <InputText 
            v-model="appointmentForm.customerPhone" 
            class="w-full"
            placeholder="(555) 555-5555"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <InputText 
            v-model="appointmentForm.customerEmail" 
            class="w-full"
            type="email"
            placeholder="customer@email.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Service *</label>
          <Dropdown 
            v-model="appointmentForm.serviceId"
            :options="services"
            optionLabel="name"
            optionValue="id"
            placeholder="Select a service"
            class="w-full"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
          <Calendar 
            v-model="appointmentForm.startTime"
            showTime
            hourFormat="12"
            dateFormat="M d, yy"
            placeholder="Select date and time"
            class="w-full"
            touchUI
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <Textarea 
            v-model="appointmentForm.notes"
            class="w-full"
            rows="2"
            placeholder="Any special notes..."
          />
        </div>
      </div>

      <template #footer>
        <div class="flex gap-2 justify-end">
          <Button label="Cancel" text @click="appointmentDialog = false" />
          <Button label="Save" icon="pi pi-check" @click="saveAppointment" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
/* Hide scrollbar but allow scrolling */
.overflow-x-auto {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.overflow-x-auto::-webkit-scrollbar {
  display: none;
}
</style>
