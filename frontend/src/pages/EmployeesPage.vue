<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputIcon from 'primevue/inputicon'
import IconField from 'primevue/iconfield'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import Checkbox from 'primevue/checkbox'
import InputSwitch from 'primevue/inputswitch'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useLocationStore } from '@/stores/location'

const authStore = useAuthStore()
const locationStore = useLocationStore()

interface TimeBlock {
  start: string
  end: string
}

interface DaySchedule {
  enabled: boolean
  blocks: TimeBlock[]
}

interface Schedule {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

interface NotificationPreferences {
  receiveEmailNotifications: boolean
  receiveSmsNotifications: boolean
  notificationTypes: string[]
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  employeeType: string
  serviceIds: string[]
  status: 'active' | 'inactive'
  schedule: Schedule
  role: 'admin' | 'manager' | 'staff'
  locationId: string | null
  notificationPreferences: NotificationPreferences
}

interface Service {
  id: string
  name: string
  category: string
  price: number
  duration: number
}

const loading = ref(false)
const employees = ref<Employee[]>([])
const services = ref<Service[]>([])

const searchQuery = ref('')
const showDialog = ref(false)
const editMode = ref(false)
const showScheduleDialog = ref(false)
const selectedEmployee = ref<Employee | null>(null)
const error = ref('')

// Employee type options - both full-time and part-time map to 'employee' in the database
// The distinction between full-time and part-time can be managed through employee schedules
const employeeTypeOptions = [
  { label: 'Employee (Full-time)', value: 'employee' },
  { label: 'Employee (Part-time)', value: 'employee' },
  { label: 'Contractor', value: 'contractor' }
]

// Employee role options
const roleOptions = [
  { label: 'Staff', value: 'staff' },
  { label: 'Manager', value: 'manager' },
  { label: 'Admin', value: 'admin' }
]

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
type DayName = typeof days[number]

// Time options for dropdown (12-hour format display, 24-hour value)
const timeOptions = [
  { label: '6:00 AM', value: '06:00' },
  { label: '6:30 AM', value: '06:30' },
  { label: '7:00 AM', value: '07:00' },
  { label: '7:30 AM', value: '07:30' },
  { label: '8:00 AM', value: '08:00' },
  { label: '8:30 AM', value: '08:30' },
  { label: '9:00 AM', value: '09:00' },
  { label: '9:30 AM', value: '09:30' },
  { label: '10:00 AM', value: '10:00' },
  { label: '10:30 AM', value: '10:30' },
  { label: '11:00 AM', value: '11:00' },
  { label: '11:30 AM', value: '11:30' },
  { label: '12:00 PM', value: '12:00' },
  { label: '12:30 PM', value: '12:30' },
  { label: '1:00 PM', value: '13:00' },
  { label: '1:30 PM', value: '13:30' },
  { label: '2:00 PM', value: '14:00' },
  { label: '2:30 PM', value: '14:30' },
  { label: '3:00 PM', value: '15:00' },
  { label: '3:30 PM', value: '15:30' },
  { label: '4:00 PM', value: '16:00' },
  { label: '4:30 PM', value: '16:30' },
  { label: '5:00 PM', value: '17:00' },
  { label: '5:30 PM', value: '17:30' },
  { label: '6:00 PM', value: '18:00' },
  { label: '6:30 PM', value: '18:30' },
  { label: '7:00 PM', value: '19:00' },
  { label: '7:30 PM', value: '19:30' },
  { label: '8:00 PM', value: '20:00' },
  { label: '8:30 PM', value: '20:30' },
  { label: '9:00 PM', value: '21:00' },
  { label: '9:30 PM', value: '21:30' },
  { label: '10:00 PM', value: '22:00' }
]

const defaultSchedule: Schedule = {
  monday: { enabled: true, blocks: [{ start: '09:00', end: '17:00' }] },
  tuesday: { enabled: true, blocks: [{ start: '09:00', end: '17:00' }] },
  wednesday: { enabled: true, blocks: [{ start: '09:00', end: '17:00' }] },
  thursday: { enabled: true, blocks: [{ start: '09:00', end: '17:00' }] },
  friday: { enabled: true, blocks: [{ start: '09:00', end: '17:00' }] },
  saturday: { enabled: false, blocks: [] },
  sunday: { enabled: false, blocks: [] }
}

const emptyEmployee: Employee = {
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  employeeType: '',
  serviceIds: [],
  status: 'active',
  schedule: { ...defaultSchedule },
  role: 'staff',
  locationId: null,
  notificationPreferences: {
    receiveEmailNotifications: false,
    receiveSmsNotifications: false,
    notificationTypes: ['new_appointment', 'cancellation']
  }
}

const showScheduleEditorDialog = ref(false)
const scheduleEditorEmployee = ref<Employee | null>(null)
const editingSchedule = ref<Schedule>({ ...defaultSchedule })

const currentEmployee = ref<Employee>({ ...emptyEmployee })

const filteredEmployees = computed(() => {
  if (!searchQuery.value) return employees.value
  const query = searchQuery.value.toLowerCase()
  return employees.value.filter(emp =>
    emp.firstName.toLowerCase().includes(query) ||
    emp.lastName.toLowerCase().includes(query) ||
    emp.email.toLowerCase().includes(query) ||
    emp.employeeType.toLowerCase().includes(query)
  )
})

function openCreateDialog() {
  currentEmployee.value = { ...emptyEmployee }
  editMode.value = false
  showDialog.value = true
  error.value = ''
}

function openEditDialog(employee: Employee) {
  currentEmployee.value = { ...employee }
  editMode.value = true
  showDialog.value = true
  error.value = ''
}

function openScheduleDialog(employee: Employee) {
  selectedEmployee.value = employee
  showScheduleDialog.value = true
}

function openScheduleEditorDialog(employee: Employee) {
  scheduleEditorEmployee.value = employee
  // Deep clone the schedule
  editingSchedule.value = JSON.parse(JSON.stringify(employee.schedule))
  showScheduleEditorDialog.value = true
  showScheduleDialog.value = false
}

function addTimeBlock(day: DayName) {
  editingSchedule.value[day].blocks.push({ start: '09:00', end: '17:00' })
}

function removeTimeBlock(day: DayName, index: number) {
  editingSchedule.value[day].blocks.splice(index, 1)
}

function toggleDayEnabled(day: DayName) {
  const daySchedule = editingSchedule.value[day]
  daySchedule.enabled = !daySchedule.enabled
  if (daySchedule.enabled && daySchedule.blocks.length === 0) {
    daySchedule.blocks.push({ start: '09:00', end: '17:00' })
  }
}

async function saveSchedule() {
  if (!scheduleEditorEmployee.value) return

  loading.value = true
  try {
    await api.patch(`/api/employees/${scheduleEditorEmployee.value.id}`, {
      schedule: editingSchedule.value
    })
    await fetchEmployees()
    showScheduleEditorDialog.value = false
  } catch (err: any) {
    console.error('Error saving schedule:', err)
    error.value = err.response?.data?.error || 'Failed to save schedule'
  } finally {
    loading.value = false
  }
}

function formatTime12h(time: string): string {
  const parts = time.split(':')
  const hours = parts[0] || '00'
  const minutes = parts[1] || '00'
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

function getScheduleSummary(schedule: Schedule): Record<string, string> {
  const summary: Record<string, string> = {}
  for (const day of days) {
    const daySchedule = schedule[day]
    if (!daySchedule || !daySchedule.enabled || daySchedule.blocks.length === 0) {
      summary[day] = 'Off'
    } else {
      const blockStrings = daySchedule.blocks.map(block =>
        `${formatTime12h(block.start)} - ${formatTime12h(block.end)}`
      )
      summary[day] = blockStrings.join(', ')
    }
  }
  return summary
}

async function saveEmployee() {
  if (!currentEmployee.value.firstName || !currentEmployee.value.lastName || !currentEmployee.value.email) {
    error.value = 'Please fill in all required fields'
    return
  }

  loading.value = true
  try {
    if (editMode.value) {
      // Update existing employee
      await api.patch(`/api/employees/${currentEmployee.value.id}`, {
        firstName: currentEmployee.value.firstName,
        lastName: currentEmployee.value.lastName,
        email: currentEmployee.value.email,
        phone: currentEmployee.value.phone,
        employeeType: currentEmployee.value.employeeType,
        serviceIds: currentEmployee.value.serviceIds,
        status: currentEmployee.value.status,
        role: currentEmployee.value.role,
        locationId: currentEmployee.value.locationId,
        notificationPreferences: currentEmployee.value.notificationPreferences
      })
    } else {
      // Create new employee
      await api.post('/api/employees', {
        firstName: currentEmployee.value.firstName,
        lastName: currentEmployee.value.lastName,
        email: currentEmployee.value.email,
        phone: currentEmployee.value.phone,
        employeeType: currentEmployee.value.employeeType,
        serviceIds: currentEmployee.value.serviceIds,
        role: currentEmployee.value.role,
        locationId: currentEmployee.value.locationId,
        notificationPreferences: currentEmployee.value.notificationPreferences
      })
    }

    // Refresh the employees list
    await fetchEmployees()
    showDialog.value = false
    error.value = ''
  } catch (err: any) {
    console.error('Error saving employee:', err)
    error.value = err.response?.data?.error || 'Failed to save employee'
  } finally {
    loading.value = false
  }
}

async function deleteEmployee(employee: Employee) {
  if (confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`)) {
    loading.value = true
    try {
      await api.delete(`/api/employees/${employee.id}`)
      // Refresh the employees list
      await fetchEmployees()
    } catch (err: any) {
      console.error('Error deleting employee:', err)
      error.value = err.response?.data?.error || 'Failed to delete employee'
    } finally {
      loading.value = false
    }
  }
}

async function toggleStatus(employee: Employee) {
  loading.value = true
  try {
    const newStatus = employee.status === 'active' ? 'inactive' : 'active'
    await api.patch(`/api/employees/${employee.id}`, {
      status: newStatus
    })
    // Refresh the employees list
    await fetchEmployees()
  } catch (err: any) {
    console.error('Error toggling employee status:', err)
    error.value = err.response?.data?.error || 'Failed to update employee status'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([fetchEmployees(), fetchServices(), locationStore.fetchLocations()])
  } catch (err) {
    console.error('Error loading data:', err)
    error.value = 'Failed to load data'
  } finally {
    loading.value = false
  }
})

function normalizeSchedule(schedule: any): Schedule {
  const normalized: Schedule = JSON.parse(JSON.stringify(defaultSchedule))
  if (!schedule) return normalized

  for (const day of days) {
    if (schedule[day]) {
      // Handle new blocks format
      if (typeof schedule[day] === 'object' && 'blocks' in schedule[day]) {
        normalized[day] = {
          enabled: schedule[day].enabled ?? false,
          blocks: Array.isArray(schedule[day].blocks) ? schedule[day].blocks : []
        }
      }
      // Handle old format with just enabled, start, end (no blocks array)
      else if (typeof schedule[day] === 'object' && 'enabled' in schedule[day] && 'start' in schedule[day]) {
        normalized[day] = {
          enabled: schedule[day].enabled ?? false,
          blocks: schedule[day].enabled ? [{ start: schedule[day].start, end: schedule[day].end }] : []
        }
      }
      // Handle legacy string format (e.g., "9:00 AM - 5:00 PM")
      else if (typeof schedule[day] === 'string') {
        if (schedule[day] === 'Off' || schedule[day] === '') {
          normalized[day] = { enabled: false, blocks: [] }
        } else {
          normalized[day] = { enabled: true, blocks: [{ start: '09:00', end: '17:00' }] }
        }
      }
    }
  }
  return normalized
}

async function fetchEmployees() {
  try {
    const response = await api.get('/api/employees')
    if (response.data.success && response.data.data && response.data.data.employees) {
      employees.value = response.data.data.employees.map((emp: any) => ({
        id: emp.id,
        firstName: emp.firstName || '',
        lastName: emp.lastName || '',
        email: emp.email || '',
        phone: emp.phone || '',
        employeeType: emp.employeeType || '',
        serviceIds: typeof emp.serviceIds === 'string' ? JSON.parse(emp.serviceIds || '[]') : (emp.serviceIds || []),
        status: emp.status || 'active',
        schedule: normalizeSchedule(emp.schedule),
        role: emp.role || 'staff',
        locationId: emp.locationId || null,
        notificationPreferences: emp.notificationPreferences || {
          receiveEmailNotifications: false,
          receiveSmsNotifications: false,
          notificationTypes: ['new_appointment', 'cancellation']
        }
      }))
    }
  } catch (err) {
    console.error('Error fetching employees:', err)
  }
}

async function fetchServices() {
  try {
    const response = await api.get('/api/services')
    if (response.data.success && response.data.data && response.data.data.services) {
      services.value = response.data.data.services.map((svc: any) => ({
        id: svc.id,
        name: svc.name,
        category: svc.category,
        price: svc.price,
        duration: svc.duration
      }))
    }
  } catch (err) {
    console.error('Error fetching services:', err)
  }
}

function getEmployeeTypeLabel(value: string) {
  const option = employeeTypeOptions.find(opt => opt.value === value)
  return option ? option.label : value
}

function getRoleLabel(value: string) {
  const option = roleOptions.find(opt => opt.value === value)
  return option ? option.label : value
}

function getLocationName(locationId: string | null) {
  if (!locationId) return 'All Locations'
  const location = locationStore.locations.find(loc => loc.id === locationId)
  return location ? location.name : 'Unknown'
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Employees</h1>
        <p class="text-gray-600 mt-1">Manage your team members and their schedules</p>
      </div>
      <Button
        label="Add Employee"
        icon="pi pi-plus"
        class="mt-4 sm:mt-0"
        @click="openCreateDialog"
      />
    </div>

    <!-- Search and Filter -->
    <Card class="mb-6 shadow-sm">
      <template #content>
        <IconField>
              <InputIcon class="pi pi-search" />
              <InputText
                v-model="searchQuery"
                placeholder="Search employees..."
                class="w-full"
              />
        </IconField>
      </template>
    </Card>

    <!-- Employees Table -->
    <Card class="shadow-sm">
      <template #content>
        <DataTable
          :value="filteredEmployees"
          :loading="loading"
          paginator
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20]"
          responsiveLayout="scroll"
          class="p-datatable-sm"
        >
          <template #empty>
            <div class="text-center py-8 text-gray-500">
              No employees found
            </div>
          </template>

          <Column field="firstName" header="Name" sortable>
            <template #body="{ data }">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center mr-3">
                  <span class="text-violet-600 font-medium">
                    {{ data.firstName.charAt(0) }}{{ data.lastName.charAt(0) }}
                  </span>
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ data.firstName }} {{ data.lastName }}</p>
                  <p class="text-sm text-gray-500">{{ data.email }}</p>
                </div>
              </div>
            </template>
          </Column>

          <Column field="phone" header="Phone" sortable />

          <Column field="employeeType" header="Type" sortable>
            <template #body="{ data }">
              <span class="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                {{ getEmployeeTypeLabel(data.employeeType) }}
              </span>
            </template>
          </Column>

          <Column field="role" header="Role" sortable>
            <template #body="{ data }">
              <span
                :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  data.role === 'admin' ? 'bg-violet-100 text-violet-700' :
                  data.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                ]"
              >
                {{ getRoleLabel(data.role) }}
              </span>
            </template>
          </Column>

          <Column field="locationId" header="Location">
            <template #body="{ data }">
              <span class="text-sm text-gray-600">
                {{ getLocationName(data.locationId) }}
              </span>
            </template>
          </Column>

          <Column field="status" header="Status" sortable>
            <template #body="{ data }">
              <span
                :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  data.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                ]"
              >
                {{ data.status === 'active' ? 'Active' : 'Inactive' }}
              </span>
            </template>
          </Column>

          <Column header="Actions" :exportable="false" style="min-width: 12rem">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button
                  icon="pi pi-calendar"
                  text
                  size="small"
                  severity="secondary"
                  v-tooltip.top="'View Schedule'"
                  @click="openScheduleDialog(data)"
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
                  :icon="data.status === 'active' ? 'pi pi-ban' : 'pi pi-check'"
                  text
                  size="small"
                  :severity="data.status === 'active' ? 'warn' : 'success'"
                  v-tooltip.top="data.status === 'active' ? 'Deactivate' : 'Activate'"
                  @click="toggleStatus(data)"
                />
                <Button
                  icon="pi pi-trash"
                  text
                  size="small"
                  severity="danger"
                  v-tooltip.top="'Delete'"
                  @click="deleteEmployee(data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Create/Edit Dialog -->
    <Dialog
      v-model:visible="showDialog"
      :header="editMode ? 'Edit Employee' : 'Add Employee'"
      :modal="true"
      :style="{ width: '500px' }"
    >
      <Message v-if="error" severity="error" class="mb-4">{{ error }}</Message>

      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <InputText v-model="currentEmployee.firstName" class="w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <InputText v-model="currentEmployee.lastName" class="w-full" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <InputText v-model="currentEmployee.email" type="email" class="w-full" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <InputText v-model="currentEmployee.phone" class="w-full" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Employee Type</label>
          <Select
            v-model="currentEmployee.employeeType"
            :options="employeeTypeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select employee type"
            class="w-full"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Services</label>
          <MultiSelect
            v-model="currentEmployee.serviceIds"
            :options="services"
            optionLabel="name"
            optionValue="id"
            placeholder="Select services"
            class="w-full services-multiselect"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <Select
              v-model="currentEmployee.role"
              :options="roleOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select role"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <Select
              v-model="currentEmployee.locationId"
              :options="[{ id: null, name: 'All Locations' }, ...locationStore.activeLocations]"
              optionLabel="name"
              optionValue="id"
              placeholder="Select location"
              class="w-full"
            />
          </div>
        </div>

        <!-- Notification Preferences (Superuser only) -->
        <div v-if="authStore.isSuperuser" class="border-t border-gray-200 pt-4 mt-4">
          <h4 class="text-sm font-medium text-gray-700 mb-3">Notification Preferences</h4>
          <div class="space-y-3 ml-2">
            <div class="flex items-center justify-between">
              <span class="text-sm">Receive Email Notifications</span>
              <InputSwitch v-model="currentEmployee.notificationPreferences.receiveEmailNotifications" />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm">Receive SMS Notifications</span>
              <InputSwitch v-model="currentEmployee.notificationPreferences.receiveSmsNotifications" />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" text severity="secondary" @click="showDialog = false" />
        <Button :label="editMode ? 'Update' : 'Create'" @click="saveEmployee" />
      </template>
    </Dialog>

    <!-- Schedule View Dialog -->
    <Dialog
      v-model:visible="showScheduleDialog"
      :header="`Schedule - ${selectedEmployee?.firstName} ${selectedEmployee?.lastName}`"
      :modal="true"
      :style="{ width: '500px' }"
    >
      <div v-if="selectedEmployee" class="space-y-3">
        <div v-for="day in days" :key="day" class="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
          <span class="font-medium capitalize">{{ day }}</span>
          <span :class="getScheduleSummary(selectedEmployee.schedule)[day] === 'Off' ? 'text-gray-400' : 'text-gray-800'">
            {{ getScheduleSummary(selectedEmployee.schedule)[day] }}
          </span>
        </div>
      </div>

      <template #footer>
        <Button label="Close" text @click="showScheduleDialog = false" />
        <Button label="Edit Schedule" icon="pi pi-pencil" @click="openScheduleEditorDialog(selectedEmployee!)" />
      </template>
    </Dialog>

    <!-- Schedule Editor Dialog -->
    <Dialog
      v-model:visible="showScheduleEditorDialog"
      :header="`Edit Schedule - ${scheduleEditorEmployee?.firstName} ${scheduleEditorEmployee?.lastName}`"
      :modal="true"
      :style="{ width: '700px' }"
      :closable="true"
    >
      <Message v-if="error" severity="error" class="mb-4">{{ error }}</Message>

      <div class="space-y-4">
        <div v-for="day in days" :key="day" class="border rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <Checkbox
                :modelValue="editingSchedule[day].enabled"
                @update:modelValue="toggleDayEnabled(day)"
                :binary="true"
              />
              <span class="font-medium text-gray-700 capitalize">{{ day }}</span>
            </div>
            <Button
              v-if="editingSchedule[day].enabled"
              icon="pi pi-plus"
              text
              size="small"
              severity="secondary"
              label="Add Shift"
              @click="addTimeBlock(day)"
            />
          </div>

          <div v-if="editingSchedule[day].enabled" class="space-y-2 ml-8">
            <div
              v-for="(block, index) in editingSchedule[day].blocks"
              :key="index"
              class="flex items-center gap-3"
            >
              <div class="flex items-center gap-2">
                <Select
                  v-model="block.start"
                  :options="timeOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Start"
                  class="w-32"
                />
                <span class="text-gray-500">to</span>
                <Select
                  v-model="block.end"
                  :options="timeOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="End"
                  class="w-32"
                />
              </div>
              <Button
                v-if="editingSchedule[day].blocks.length > 1"
                icon="pi pi-trash"
                text
                size="small"
                severity="danger"
                @click="removeTimeBlock(day, index)"
              />
            </div>
            <p v-if="editingSchedule[day].blocks.length === 0" class="text-gray-400 text-sm">
              No shifts scheduled. Click "Add Shift" to add working hours.
            </p>
          </div>

          <p v-else class="text-gray-400 text-sm ml-8">Day off</p>
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" text severity="secondary" @click="showScheduleEditorDialog = false" />
        <Button label="Save Schedule" icon="pi pi-check" @click="saveSchedule" :loading="loading" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
/* Fix MultiSelect chip text visibility */
.services-multiselect :deep(.p-multiselect-label) {
  color: #374151;
}
.services-multiselect :deep(.p-chip) {
  background-color: #ede9fe;
  color: #5b21b6;
}
.services-multiselect :deep(.p-chip-label) {
  color: #5b21b6;
}
</style>
