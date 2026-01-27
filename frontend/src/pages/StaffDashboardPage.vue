<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import Card from 'primevue/card'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Textarea from 'primevue/textarea'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import ConfirmDialog from 'primevue/confirmdialog'
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
  d.setDate(d.getDate() + 7) // Next 7 days
  d.setHours(23, 59, 59, 999)
  return d
})

// Status styling
function getStatusSeverity(status: string) {
  const map: Record<string, string> = {
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

// Fetch appointments
async function fetchAppointments() {
  if (!employeeId.value) {
    console.error('No employee ID found for user')
    return
  }
  
  loading.value = true
  try {
    // Today's appointments
    const todayResponse = await api.get('/api/appointments', {
      params: {
        employeeId: employeeId.value,
        startDate: today.value.toISOString(),
        endDate: endOfToday.value.toISOString()
      }
    })
    todayAppointments.value = todayResponse.data.data.appointments || []
    
    // Upcoming appointments (tomorrow to next 7 days)
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
    
    // Completed appointments (last 30 days by default)
    await fetchCompletedAppointments()
    
  } catch (error) {
    console.error('Failed to fetch appointments:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load appointments',
      life: 3000
    })
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
    toast.add({
      severity: 'warn',
      summary: 'Validation',
      detail: 'Please fill in all required fields',
      life: 3000
    })
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
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Appointment updated',
        life: 3000
      })
    } else {
      await api.post('/api/appointments', payload)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Appointment created',
        life: 3000
      })
    }

    appointmentDialog.value = false
    await fetchAppointments()
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.error || 'Failed to save appointment',
      life: 3000
    })
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
        await api.patch(`/api/appointments/${appointment.id}`, {
          status: 'cancelled',
          cancellationReason: 'employee_unavailable'
        })
        toast.add({
          severity: 'success',
          summary: 'Cancelled',
          detail: 'Appointment has been cancelled',
          life: 3000
        })
        await fetchAppointments()
      } catch (error: any) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: error.response?.data?.error || 'Failed to cancel appointment',
          life: 3000
        })
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
        await api.patch(`/api/appointments/${appointment.id}`, {
          status: 'completed'
        })
        toast.add({
          severity: 'success',
          summary: 'Completed',
          detail: 'Appointment marked as completed',
          life: 3000
        })
        await fetchAppointments()
      } catch (error: any) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: error.response?.data?.error || 'Failed to update appointment',
          life: 3000
        })
      }
    }
  })
}

// Watch for date range filter changes
function onCompletedFilterChange() {
  fetchCompletedAppointments()
}

onMounted(() => {
  fetchAppointments()
  fetchServices()
})
</script>

<template>
  <div class="staff-dashboard">
    <ConfirmDialog />
    
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">My Schedule</h1>
      <p class="text-gray-600">Welcome back, {{ authStore.user?.firstName }}</p>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card class="bg-blue-50 border-blue-200">
        <template #content>
          <div class="flex items-center">
            <div class="p-3 bg-blue-500 rounded-lg mr-4">
              <i class="pi pi-calendar text-white text-xl"></i>
            </div>
            <div>
              <p class="text-sm text-blue-600 font-medium">Today</p>
              <p class="text-2xl font-bold text-blue-900">{{ todayAppointments.length }}</p>
            </div>
          </div>
        </template>
      </Card>
      
      <Card class="bg-violet-50 border-violet-200">
        <template #content>
          <div class="flex items-center">
            <div class="p-3 bg-violet-500 rounded-lg mr-4">
              <i class="pi pi-clock text-white text-xl"></i>
            </div>
            <div>
              <p class="text-sm text-violet-600 font-medium">Upcoming</p>
              <p class="text-2xl font-bold text-violet-900">{{ upcomingAppointments.length }}</p>
            </div>
          </div>
        </template>
      </Card>
      
      <Card class="bg-green-50 border-green-200">
        <template #content>
          <div class="flex items-center">
            <div class="p-3 bg-green-500 rounded-lg mr-4">
              <i class="pi pi-check-circle text-white text-xl"></i>
            </div>
            <div>
              <p class="text-sm text-green-600 font-medium">Completed (30d)</p>
              <p class="text-2xl font-bold text-green-900">{{ completedAppointments.length }}</p>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Add Appointment Button -->
    <div class="mb-4">
      <Button 
        label="New Appointment" 
        icon="pi pi-plus" 
        @click="openNewAppointment"
      />
    </div>

    <!-- Tabs for different views -->
    <TabView>
      <!-- Today's Schedule -->
      <TabPanel value="0" header="Today's Schedule">
        <DataTable 
          :value="todayAppointments" 
          :loading="loading"
          stripedRows
          class="p-datatable-sm"
          emptyMessage="No appointments today"
        >
          <Column header="Time" sortable>
            <template #body="{ data }">
              <span class="font-medium">{{ formatTime(data.startTime) }}</span>
              <span class="text-gray-400 mx-1">-</span>
              <span class="text-gray-600">{{ formatTime(data.endTime) }}</span>
            </template>
          </Column>
          <Column field="customerName" header="Customer" sortable />
          <Column header="Service">
            <template #body="{ data }">
              {{ data.service?.name || 'N/A' }}
            </template>
          </Column>
          <Column field="status" header="Status">
            <template #body="{ data }">
              <Tag :value="formatStatus(data.status)" :severity="getStatusSeverity(data.status)" />
            </template>
          </Column>
          <Column header="Actions" style="width: 150px">
            <template #body="{ data }">
              <div class="flex gap-1" v-if="data.status !== 'completed' && data.status !== 'cancelled'">
                <Button 
                  icon="pi pi-pencil" 
                  text 
                  rounded 
                  size="small"
                  v-tooltip.top="'Edit'"
                  @click="openEditAppointment(data)"
                />
                <Button 
                  icon="pi pi-check" 
                  text 
                  rounded 
                  size="small"
                  severity="success"
                  v-tooltip.top="'Complete'"
                  @click="confirmCompleteAppointment(data)"
                />
                <Button 
                  icon="pi pi-times" 
                  text 
                  rounded 
                  size="small"
                  severity="danger"
                  v-tooltip.top="'Cancel'"
                  @click="confirmCancelAppointment(data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </TabPanel>

      <!-- Upcoming Appointments -->
      <TabPanel value="1" header="Upcoming">
        <DataTable 
          :value="upcomingAppointments" 
          :loading="loading"
          stripedRows
          class="p-datatable-sm"
          emptyMessage="No upcoming appointments"
        >
          <Column header="Date & Time" sortable>
            <template #body="{ data }">
              <div>
                <span class="font-medium">{{ formatDate(data.startTime) }}</span>
              </div>
              <div class="text-sm text-gray-600">
                {{ formatTime(data.startTime) }} - {{ formatTime(data.endTime) }}
              </div>
            </template>
          </Column>
          <Column field="customerName" header="Customer" sortable />
          <Column header="Service">
            <template #body="{ data }">
              {{ data.service?.name || 'N/A' }}
            </template>
          </Column>
          <Column field="status" header="Status">
            <template #body="{ data }">
              <Tag :value="formatStatus(data.status)" :severity="getStatusSeverity(data.status)" />
            </template>
          </Column>
          <Column header="Actions" style="width: 150px">
            <template #body="{ data }">
              <div class="flex gap-1" v-if="data.status !== 'completed' && data.status !== 'cancelled'">
                <Button 
                  icon="pi pi-pencil" 
                  text 
                  rounded 
                  size="small"
                  v-tooltip.top="'Edit'"
                  @click="openEditAppointment(data)"
                />
                <Button 
                  icon="pi pi-times" 
                  text 
                  rounded 
                  size="small"
                  severity="danger"
                  v-tooltip.top="'Cancel'"
                  @click="confirmCancelAppointment(data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </TabPanel>

      <!-- Completed Appointments -->
      <TabPanel value="2" header="Completed">
        <!-- Date Filter -->
        <div class="mb-4 flex items-center gap-2">
          <label class="text-sm text-gray-600">Filter by date:</label>
          <Calendar 
            v-model="completedDateRange" 
            selectionMode="range" 
            dateFormat="M d, yy"
            placeholder="Select date range"
            showIcon
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

        <DataTable 
          :value="completedAppointments" 
          :loading="loading"
          stripedRows
          class="p-datatable-sm"
          emptyMessage="No completed appointments"
          paginator
          :rows="10"
        >
          <Column header="Date & Time" sortable>
            <template #body="{ data }">
              {{ formatDateTime(data.startTime) }}
            </template>
          </Column>
          <Column field="customerName" header="Customer" sortable />
          <Column header="Service">
            <template #body="{ data }">
              {{ data.service?.name || 'N/A' }}
            </template>
          </Column>
          <Column header="Duration">
            <template #body="{ data }">
              {{ data.service?.duration || 0 }} min
            </template>
          </Column>
        </DataTable>
      </TabPanel>
    </TabView>

    <!-- Appointment Dialog -->
    <Dialog 
      v-model:visible="appointmentDialog" 
      :header="editingAppointment ? 'Edit Appointment' : 'New Appointment'"
      :style="{ width: '500px' }"
      modal
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
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <InputText 
            v-model="appointmentForm.customerEmail" 
            class="w-full"
            type="email"
            placeholder="customer@email.com"
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
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <Textarea 
            v-model="appointmentForm.notes"
            class="w-full"
            rows="3"
            placeholder="Any special notes..."
          />
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" text @click="appointmentDialog = false" />
        <Button label="Save" icon="pi pi-check" @click="saveAppointment" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.staff-dashboard :deep(.p-card) {
  border: 1px solid;
}

.staff-dashboard :deep(.p-tabview-panels) {
  padding: 1rem 0;
}
</style>
