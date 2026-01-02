<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputIcon from 'primevue/inputicon'
import IconField from 'primevue/iconfield'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import api from '@/services/api'

interface Service {
  id: string
  name: string
  description: string
  duration: number // in minutes
  price: number
  category: string
  status: 'active' | 'inactive'
}

const loading = ref(false)
const services = ref<Service[]>([])

const searchQuery = ref('')
const showDialog = ref(false)
const editMode = ref(false)
const error = ref('')

const emptyService: Service = {
  id: '',
  name: '',
  description: '',
  duration: 30,
  price: 0,
  category: '',
  status: 'active'
}

const currentService = ref<Service>({ ...emptyService })

const filteredServices = computed(() => {
  if (!searchQuery.value) return services.value
  const query = searchQuery.value.toLowerCase()
  return services.value.filter(service => 
    service.name.toLowerCase().includes(query) ||
    service.description.toLowerCase().includes(query) ||
    service.category.toLowerCase().includes(query)
  )
})

const categories = computed(() => {
  const cats = new Set(services.value.map(s => s.category))
  return Array.from(cats)
})

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}

function openCreateDialog() {
  currentService.value = { ...emptyService, id: crypto.randomUUID() }
  editMode.value = false
  showDialog.value = true
  error.value = ''
}

function openEditDialog(service: Service) {
  currentService.value = { ...service }
  editMode.value = true
  showDialog.value = true
  error.value = ''
}

function saveService() {
  if (!currentService.value.name || !currentService.value.price) {
    error.value = 'Please fill in all required fields'
    return
  }

  if (editMode.value) {
    const index = services.value.findIndex(s => s.id === currentService.value.id)
    if (index !== -1) {
      services.value[index] = { ...currentService.value }
    }
  } else {
    services.value.push({ ...currentService.value })
  }

  showDialog.value = false
  error.value = ''
}

function deleteService(service: Service) {
  if (confirm(`Are you sure you want to delete "${service.name}"?`)) {
    services.value = services.value.filter(s => s.id !== service.id)
  }
}

function toggleStatus(service: Service) {
  const index = services.value.findIndex(s => s.id === service.id)
  if (index !== -1) {
    services.value[index]!.status = service.status === 'active' ? 'inactive' : 'active'
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await fetchServices()
  } catch (err) {
    console.error('Error loading services:', err)
    error.value = 'Failed to load services data'
  } finally {
    loading.value = false
  }
})

async function fetchServices() {
  try {
    const response = await api.get('/api/services')
    if (response.data.success && response.data.data && response.data.data.services) {
      services.value = response.data.data.services.map((svc: any) => ({
        id: svc.id,
        name: svc.name || '',
        description: svc.description || '',
        duration: svc.duration || 30,
        price: svc.price || 0,
        category: svc.category || '',
        status: svc.status || 'active'
      }))
    }
  } catch (err) {
    console.error('Error fetching services:', err)
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Services</h1>
        <p class="text-gray-600 mt-1">Manage your service offerings and pricing</p>
      </div>
      <Button
        label="Add Service"
        icon="pi pi-plus"
        class="mt-4 sm:mt-0"
        @click="openCreateDialog"
      />
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <Card class="shadow-sm">
        <template #content>
          <div class="text-center">
            <p class="text-3xl font-bold text-violet-600">{{ services.length }}</p>
            <p class="text-sm text-white">Total Services</p>
          </div>
        </template>
      </Card>
      <Card class="shadow-sm">
        <template #content>
          <div class="text-center">
            <p class="text-3xl font-bold text-green-600">{{ services.filter(s => s.status === 'active').length }}</p>
            <p class="text-sm text-white">Active Services</p>
          </div>
        </template>
      </Card>
      <Card class="shadow-sm">
        <template #content>
          <div class="text-center">
            <p class="text-3xl font-bold text-cyan-600">{{ categories.length }}</p>
            <p class="text-sm text-white">Categories</p>
          </div>
        </template>
      </Card>
    </div>

    <!-- Search -->
    <Card class="mb-6 shadow-sm">
      <template #content>
        <IconField>
              <InputIcon class="pi pi-search" />
              <InputText
                v-model="searchQuery"
                placeholder="Search services..."
                class="w-full"
              />
        </IconField>
       
      </template>
    </Card>

    <!-- Services Table -->
    <Card class="shadow-sm">
      <template #content>
        <DataTable
          :value="filteredServices"
          :loading="loading"
          paginator
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20]"
          responsiveLayout="scroll"
          class="p-datatable-sm"
        >
          <template #empty>
            <div class="text-center py-8 text-gray-500">
              No services found
            </div>
          </template>

          <Column field="name" header="Service" sortable>
            <template #body="{ data }">
              <div>
                <p class="font-medium text-white">{{ data.name }}</p>
                <p class="text-sm text-white">{{ data.description }}</p>
              </div>
            </template>
          </Column>

          <Column field="category" header="Category" sortable>
            <template #body="{ data }">
              <span class="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                {{ data.category }}
              </span>
            </template>
          </Column>

          <Column field="duration" header="Duration" sortable>
            <template #body="{ data }">
              <span class="text-white">
                <i class="pi pi-clock mr-1 text-white"></i>
                {{ formatDuration(data.duration) }}
              </span>
            </template>
          </Column>

          <Column field="price" header="Price" sortable>
            <template #body="{ data }">
              <span class="font-medium text-white">{{ formatPrice(data.price) }}</span>
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

          <Column header="Actions" :exportable="false" style="min-width: 10rem">
            <template #body="{ data }">
              <div class="flex gap-2">
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
                  @click="deleteService(data)"
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
      :header="editMode ? 'Edit Service' : 'Add Service'"
      :modal="true"
      :style="{ width: '500px' }"
    >
      <Message v-if="error" severity="error" class="mb-4">{{ error }}</Message>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-white mb-1">Service Name *</label>
          <InputText v-model="currentService.name" class="w-full" placeholder="e.g., Haircut" />
        </div>

        <div>
          <label class="block text-sm font-medium text-white mb-1">Description</label>
          <Textarea v-model="currentService.description" class="w-full" rows="3" placeholder="Describe the service..." />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-white mb-1">Duration (minutes) *</label>
            <InputNumber v-model="currentService.duration" class="w-full" :min="5" :step="5" suffix=" min" />
          </div>
          <div>
            <label class="block text-sm font-medium text-white mb-1">Price *</label>
            <InputNumber v-model="currentService.price" class="w-full" mode="currency" currency="USD" locale="en-US" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-white mb-1">Category</label>
          <InputText v-model="currentService.category" class="w-full" placeholder="e.g., Hair, Grooming, Spa" />
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" text severity="secondary" @click="showDialog = false" />
        <Button :label="editMode ? 'Update' : 'Create'" @click="saveService" />
      </template>
    </Dialog>
  </div>
</template>
