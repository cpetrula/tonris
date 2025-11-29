<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'

interface Appointment {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  service: string
  employee: string
  date: Date
  time: string
  duration: number
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
  notes: string
}

const loading = ref(false)
const appointments = ref<Appointment[]>([
  {
    id: '1',
    customerName: 'John Smith',
    customerEmail: 'john.smith@email.com',
    customerPhone: '(555) 123-4567',
    service: 'Haircut',
    employee: 'Sarah Johnson',
    date: new Date(),
    time: '10:00 AM',
    duration: 45,
    status: 'confirmed',
    notes: 'Regular customer'
  },
  {
    id: '2',
    customerName: 'Emily Davis',
    customerEmail: 'emily.davis@email.com',
    customerPhone: '(555) 234-5678',
    service: 'Color Treatment',
    employee: 'Mike Brown',
    date: new Date(),
    time: '11:30 AM',
    duration: 120,
    status: 'scheduled',
    notes: ''
  },
  {
    id: '3',
    customerName: 'Robert Wilson',
    customerEmail: 'robert.w@email.com',
    customerPhone: '(555) 345-6789',
    service: 'Beard Trim',
    employee: 'Sarah Johnson',
    date: new Date(),
    time: '2:00 PM',
    duration: 20,
    status: 'scheduled',
    notes: 'First visit'
  },
  {
    id: '4',
    customerName: 'Lisa Anderson',
    customerEmail: 'lisa.a@email.com',
    customerPhone: '(555) 456-7890',
    service: 'Hair Styling',
    employee: 'Jessica Lee',
    date: new Date(Date.now() + 86400000),
    time: '9:00 AM',
    duration: 60,
    status: 'confirmed',
    notes: 'Wedding preparation'
  },
  {
    id: '5',
    customerName: 'David Martinez',
    customerEmail: 'david.m@email.com',
    customerPhone: '(555) 567-8901',
    service: 'Haircut',
    employee: 'Mike Brown',
    date: new Date(Date.now() - 86400000),
    time: '3:30 PM',
    duration: 45,
    status: 'completed',
    notes: ''
  }
])

const searchQuery = ref('')
const selectedDate = ref<Date | null>(null)
const statusFilter = ref<string | null>(null)
const showDialog = ref(false)
const editMode = ref(false)
const error = ref('')

const statusOptions = [
  { label: 'All Statuses', value: null },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'No Show', value: 'no-show' }
]

const employees = [
  { label: 'Sarah Johnson', value: 'Sarah Johnson' },
  { label: 'Mike Brown', value: 'Mike Brown' },
  { label: 'Jessica Lee', value: 'Jessica Lee' }
]

const services = [
  { label: 'Haircut', value: 'Haircut' },
  { label: 'Color Treatment', value: 'Color Treatment' },
  { label: 'Beard Trim', value: 'Beard Trim' },
  { label: 'Hair Styling', value: 'Hair Styling' },
  { label: 'Deep Conditioning', value: 'Deep Conditioning' }
]

const timeSlots = [
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
  '5:00 PM', '5:30 PM', '6:00 PM'
]

const emptyAppointment: Appointment = {
  id: '',
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  service: '',
  employee: '',
  date: new Date(),
  time: '9:00 AM',
  duration: 45,
  status: 'scheduled',
  notes: ''
}

const currentAppointment = ref<Appointment>({ ...emptyAppointment })

const filteredAppointments = computed(() => {
  let filtered = appointments.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(apt => 
      apt.customerName.toLowerCase().includes(query) ||
      apt.customerEmail.toLowerCase().includes(query) ||
      apt.service.toLowerCase().includes(query) ||
      apt.employee.toLowerCase().includes(query)
    )
  }

  if (selectedDate.value) {
    const dateStr = selectedDate.value.toDateString()
    filtered = filtered.filter(apt => new Date(apt.date).toDateString() === dateStr)
  }

  if (statusFilter.value) {
    filtered = filtered.filter(apt => apt.status === statusFilter.value)
  }

  return filtered
})

const todayAppointments = computed(() => {
  const today = new Date().toDateString()
  return appointments.value.filter(apt => new Date(apt.date).toDateString() === today)
})

const upcomingAppointments = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return appointments.value
    .filter(apt => new Date(apt.date) >= today && apt.status !== 'completed' && apt.status !== 'cancelled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
})

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  })
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
    'no-show': 'bg-orange-100 text-orange-700'
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

function openCreateDialog() {
  currentAppointment.value = { ...emptyAppointment, id: crypto.randomUUID(), date: new Date() }
  editMode.value = false
  showDialog.value = true
  error.value = ''
}

function openEditDialog(appointment: Appointment) {
  currentAppointment.value = { ...appointment, date: new Date(appointment.date) }
  editMode.value = true
  showDialog.value = true
  error.value = ''
}

function saveAppointment() {
  if (!currentAppointment.value.customerName || !currentAppointment.value.service || !currentAppointment.value.employee) {
    error.value = 'Please fill in all required fields'
    return
  }

  if (editMode.value) {
    const index = appointments.value.findIndex(a => a.id === currentAppointment.value.id)
    if (index !== -1) {
      appointments.value[index] = { ...currentAppointment.value }
    }
  } else {
    appointments.value.push({ ...currentAppointment.value })
  }

  showDialog.value = false
  error.value = ''
}

function updateStatus(appointment: Appointment, status: Appointment['status']) {
  const index = appointments.value.findIndex(a => a.id === appointment.id)
  if (index !== -1 && appointments.value[index]) {
    appointments.value[index]!.status = status
  }
}

function cancelAppointment(appointment: Appointment) {
  if (confirm(`Are you sure you want to cancel the appointment for ${appointment.customerName}?`)) {
    updateStatus(appointment, 'cancelled')
  }
}

function clearFilters() {
  searchQuery.value = ''
  selectedDate.value = null
  statusFilter.value = null
}

onMounted(async () => {
  loading.value = true
  // In a real app, fetch appointments from API using tenantStore.tenantId
  // await api.get(`/api/tenants/${tenantStore.tenantId}/appointments`)
  loading.value = false
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Appointments</h1>
        <p class="text-gray-600 mt-1">Manage your appointments calendar and bookings</p>
      </div>
      <Button
        label="New Appointment"
        icon="pi pi-plus"
        class="mt-4 sm:mt-0"
        @click="openCreateDialog"
      />
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
      <Card class="shadow-sm">
        <template #content>
          <div class="text-center">
            <p class="text-3xl font-bold text-violet-600">{{ todayAppointments.length }}</p>
            <p class="text-sm text-gray-500">Today</p>
          </div>
        </template>
      </Card>
      <Card class="shadow-sm">
        <template #content>
          <div class="text-center">
            <p class="text-3xl font-bold text-blue-600">{{ upcomingAppointments.length }}</p>
            <p class="text-sm text-gray-500">Upcoming</p>
          </div>
        </template>
      </Card>
      <Card class="shadow-sm">
        <template #content>
          <div class="text-center">
            <p class="text-3xl font-bold text-green-600">{{ appointments.filter(a => a.status === 'completed').length }}</p>
            <p class="text-sm text-gray-500">Completed</p>
          </div>
        </template>
      </Card>
      <Card class="shadow-sm">
        <template #content>
          <div class="text-center">
            <p class="text-3xl font-bold text-red-600">{{ appointments.filter(a => a.status === 'cancelled').length }}</p>
            <p class="text-sm text-gray-500">Cancelled</p>
          </div>
        </template>
      </Card>
    </div>

    <TabView>
      <!-- Calendar View Tab -->
      <TabPanel value="0" header="Calendar View">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Calendar -->
          <Card class="shadow-sm">
            <template #content>
              <Calendar
                v-model="selectedDate"
                inline
                class="w-full"
                :manualInput="false"
              />
              <Button 
                v-if="selectedDate" 
                label="Clear Date" 
                text 
                size="small" 
                class="mt-2 w-full"
                @click="selectedDate = null"
              />
            </template>
          </Card>

          <!-- Selected Day Appointments -->
          <Card class="shadow-sm lg:col-span-2">
            <template #title>
              {{ selectedDate ? formatDate(selectedDate) : "Today's" }} Appointments
            </template>
            <template #content>
              <div class="space-y-3">
                <div
                  v-for="apt in (selectedDate ? filteredAppointments : todayAppointments)"
                  :key="apt.id"
                  class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div class="flex items-center space-x-4">
                    <div class="text-center min-w-[60px]">
                      <p class="text-lg font-bold text-violet-600">{{ apt.time }}</p>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ apt.customerName }}</p>
                      <p class="text-sm text-gray-500">{{ apt.service }} with {{ apt.employee }}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusColor(apt.status)]">
                      {{ apt.status }}
                    </span>
                    <Button
                      icon="pi pi-pencil"
                      text
                      size="small"
                      severity="secondary"
                      @click="openEditDialog(apt)"
                    />
                  </div>
                </div>
                <div v-if="(selectedDate ? filteredAppointments : todayAppointments).length === 0" class="text-center py-8 text-gray-500">
                  No appointments for this day
                </div>
              </div>
            </template>
          </Card>
        </div>
      </TabPanel>

      <!-- List View Tab -->
      <TabPanel value="1" header="List View">
        <!-- Filters -->
        <Card class="mb-6 shadow-sm">
          <template #content>
            <div class="flex flex-col sm:flex-row gap-4">
              <div class="flex-1">
                <span class="p-input-icon-left w-full">
                  <i class="pi pi-search" />
                  <InputText
                    v-model="searchQuery"
                    placeholder="Search appointments..."
                    class="w-full"
                  />
                </span>
              </div>
              <Dropdown
                v-model="statusFilter"
                :options="statusOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Filter by status"
                class="w-full sm:w-48"
              />
              <Button
                v-if="searchQuery || statusFilter"
                label="Clear"
                text
                severity="secondary"
                @click="clearFilters"
              />
            </div>
          </template>
        </Card>

        <!-- Appointments Table -->
        <Card class="shadow-sm">
          <template #content>
            <DataTable
              :value="filteredAppointments"
              :loading="loading"
              paginator
              :rows="10"
              :rowsPerPageOptions="[5, 10, 20]"
              responsiveLayout="scroll"
              class="p-datatable-sm"
              sortField="date"
              :sortOrder="-1"
            >
              <template #empty>
                <div class="text-center py-8 text-gray-500">
                  No appointments found
                </div>
              </template>

              <Column field="date" header="Date" sortable>
                <template #body="{ data }">
                  <div>
                    <p class="font-medium text-gray-900">{{ formatDate(data.date) }}</p>
                    <p class="text-sm text-violet-600">{{ data.time }}</p>
                  </div>
                </template>
              </Column>

              <Column field="customerName" header="Customer" sortable>
                <template #body="{ data }">
                  <div>
                    <p class="font-medium text-gray-900">{{ data.customerName }}</p>
                    <p class="text-sm text-gray-500">{{ data.customerPhone }}</p>
                  </div>
                </template>
              </Column>

              <Column field="service" header="Service" sortable />

              <Column field="employee" header="Employee" sortable />

              <Column field="status" header="Status" sortable>
                <template #body="{ data }">
                  <span :class="['px-2 py-1 rounded-full text-xs font-medium capitalize', getStatusColor(data.status)]">
                    {{ data.status }}
                  </span>
                </template>
              </Column>

              <Column header="Actions" :exportable="false" style="min-width: 12rem">
                <template #body="{ data }">
                  <div class="flex gap-1">
                    <Button
                      v-if="data.status === 'scheduled'"
                      icon="pi pi-check"
                      text
                      size="small"
                      severity="success"
                      v-tooltip.top="'Confirm'"
                      @click="updateStatus(data, 'confirmed')"
                    />
                    <Button
                      v-if="data.status === 'confirmed'"
                      icon="pi pi-check-circle"
                      text
                      size="small"
                      severity="success"
                      v-tooltip.top="'Complete'"
                      @click="updateStatus(data, 'completed')"
                    />
                    <Button
                      icon="pi pi-pencil"
                      text
                      size="small"
                      severity="secondary"
                      v-tooltip.top="'Edit'"
                      @click="openEditDialog(data)"
                    />
                    <Button
                      v-if="data.status !== 'cancelled' && data.status !== 'completed'"
                      icon="pi pi-times"
                      text
                      size="small"
                      severity="danger"
                      v-tooltip.top="'Cancel'"
                      @click="cancelAppointment(data)"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>
      </TabPanel>
    </TabView>

    <!-- Create/Edit Dialog -->
    <Dialog
      v-model:visible="showDialog"
      :header="editMode ? 'Edit Appointment' : 'New Appointment'"
      :modal="true"
      :style="{ width: '600px' }"
    >
      <Message v-if="error" severity="error" class="mb-4">{{ error }}</Message>

      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
            <InputText v-model="currentAppointment.customerName" class="w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <InputText v-model="currentAppointment.customerEmail" type="email" class="w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <InputText v-model="currentAppointment.customerPhone" class="w-full" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Service *</label>
            <Dropdown
              v-model="currentAppointment.service"
              :options="services"
              optionLabel="label"
              optionValue="value"
              placeholder="Select service"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
            <Dropdown
              v-model="currentAppointment.employee"
              :options="employees"
              optionLabel="label"
              optionValue="value"
              placeholder="Select employee"
              class="w-full"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <Calendar v-model="currentAppointment.date" class="w-full" dateFormat="mm/dd/yy" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Time *</label>
            <Dropdown
              v-model="currentAppointment.time"
              :options="timeSlots"
              placeholder="Select time"
              class="w-full"
            />
          </div>
        </div>

        <div v-if="editMode">
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <Dropdown
            v-model="currentAppointment.status"
            :options="statusOptions.filter(s => s.value)"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <InputText v-model="currentAppointment.notes" class="w-full" placeholder="Any special requests or notes..." />
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" text severity="secondary" @click="showDialog = false" />
        <Button :label="editMode ? 'Update' : 'Book'" @click="saveAppointment" />
      </template>
    </Dialog>
  </div>
</template>
