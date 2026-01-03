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
import api from '@/services/api'

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  employeeType: string
  serviceIds: string[]
  status: 'active' | 'inactive'
  schedule: {
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
    saturday: string
    sunday: string
  }
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

const employeeTypeOptions = [
  { label: 'Employee (Full-time)', value: 'employee' },
  { label: 'Employee (Part-time)', value: 'employee' },
  { label: 'Contractor', value: 'contractor' }
]

const emptyEmployee: Employee = {
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  employeeType: '',
  serviceIds: [],
  status: 'active',
  schedule: {
    monday: '9:00 AM - 5:00 PM',
    tuesday: '9:00 AM - 5:00 PM',
    wednesday: '9:00 AM - 5:00 PM',
    thursday: '9:00 AM - 5:00 PM',
    friday: '9:00 AM - 5:00 PM',
    saturday: 'Off',
    sunday: 'Off'
  }
}

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
        status: currentEmployee.value.status
      })
    } else {
      // Create new employee
      await api.post('/api/employees', {
        firstName: currentEmployee.value.firstName,
        lastName: currentEmployee.value.lastName,
        email: currentEmployee.value.email,
        phone: currentEmployee.value.phone,
        employeeType: currentEmployee.value.employeeType,
        serviceIds: currentEmployee.value.serviceIds
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
    await Promise.all([fetchEmployees(), fetchServices()])
  } catch (err) {
    console.error('Error loading data:', err)
    error.value = 'Failed to load data'
  } finally {
    loading.value = false
  }
})

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
        serviceIds: emp.serviceIds || [],
        status: emp.status || 'active',
        schedule: emp.schedule || {
          monday: 'Off',
          tuesday: 'Off',
          wednesday: 'Off',
          thursday: 'Off',
          friday: 'Off',
          saturday: 'Off',
          sunday: 'Off'
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
            <div class="text-center py-8 text-white-500">
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
                  <p class="font-medium text-white-900">{{ data.firstName }} {{ data.lastName }}</p>
                  <p class="text-sm text-white-600">{{ data.email }}</p>
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
            <label class="block text-sm font-medium text-white-700 mb-1">First Name *</label>
            <InputText v-model="currentEmployee.firstName" class="w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-white-700 mb-1">Last Name *</label>
            <InputText v-model="currentEmployee.lastName" class="w-full" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-white-700 mb-1">Email *</label>
          <InputText v-model="currentEmployee.email" type="email" class="w-full" />
        </div>

        <div>
          <label class="block text-sm font-medium text-white-700 mb-1">Phone</label>
          <InputText v-model="currentEmployee.phone" class="w-full" />
        </div>

        <div>
          <label class="block text-sm font-medium text-white-700 mb-1">Employee Type</label>
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
          <label class="block text-sm font-medium text-white-700 mb-1">Services</label>
          <MultiSelect 
            v-model="currentEmployee.serviceIds" 
            :options="services" 
            optionLabel="name" 
            optionValue="id"
            placeholder="Select services"
            class="w-full"
            display="chip"
          />
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" text severity="secondary" @click="showDialog = false" />
        <Button :label="editMode ? 'Update' : 'Create'" @click="saveEmployee" />
      </template>
    </Dialog>

    <!-- Schedule Dialog -->
    <Dialog
      v-model:visible="showScheduleDialog"
      :header="`Schedule - ${selectedEmployee?.firstName} ${selectedEmployee?.lastName}`"
      :modal="true"
      :style="{ width: '500px' }"
    >
      <div v-if="selectedEmployee" class="space-y-3">
        <div v-for="(_, day) in selectedEmployee.schedule" :key="day" class="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
          <span class="font-medium text-gray-700 capitalize">{{ day }}</span>
          <span :class="selectedEmployee.schedule[day as keyof typeof selectedEmployee.schedule] === 'Off' ? 'text-gray-400' : 'text-gray-900'">
            {{ selectedEmployee.schedule[day as keyof typeof selectedEmployee.schedule] }}
          </span>
        </div>
      </div>

      <template #footer>
        <Button label="Close" text @click="showScheduleDialog = false" />
        <Button label="Edit Schedule" icon="pi pi-pencil" @click="openEditDialog(selectedEmployee!)" />
      </template>
    </Dialog>
  </div>
</template>
