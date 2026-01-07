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
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { useLocationStore, type Location, type CreateLocationData, type UpdateLocationData } from '@/stores/location'

const toast = useToast()
const locationStore = useLocationStore()

const loading = ref(false)
const searchQuery = ref('')
const showDialog = ref(false)
const editMode = ref(false)
const error = ref('')

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
]

const emptyLocation: CreateLocationData & { id?: string } = {
  name: '',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: ''
  },
  phone: '',
  email: '',
  isDefault: false,
  status: 'active'
}

const currentLocation = ref<CreateLocationData & { id?: string }>({ ...emptyLocation })

const filteredLocations = computed(() => {
  if (!searchQuery.value) return locationStore.locations
  const query = searchQuery.value.toLowerCase()
  return locationStore.locations.filter(loc =>
    loc.name.toLowerCase().includes(query) ||
    loc.address?.city?.toLowerCase().includes(query) ||
    loc.address?.state?.toLowerCase().includes(query) ||
    loc.email?.toLowerCase().includes(query)
  )
})

function openCreateDialog() {
  currentLocation.value = { ...emptyLocation, address: { ...emptyLocation.address } }
  editMode.value = false
  showDialog.value = true
  error.value = ''
}

function openEditDialog(location: Location) {
  currentLocation.value = {
    id: location.id,
    name: location.name,
    address: {
      street: location.address?.street || '',
      city: location.address?.city || '',
      state: location.address?.state || '',
      zipCode: location.address?.zipCode || ''
    },
    phone: location.phone || '',
    email: location.email || '',
    isDefault: location.isDefault,
    status: location.status
  }
  editMode.value = true
  showDialog.value = true
  error.value = ''
}

async function saveLocation() {
  if (!currentLocation.value.name) {
    error.value = 'Location name is required'
    return
  }

  loading.value = true
  try {
    if (editMode.value && currentLocation.value.id) {
      const updateData: UpdateLocationData = {
        name: currentLocation.value.name,
        address: currentLocation.value.address,
        phone: currentLocation.value.phone,
        email: currentLocation.value.email,
        isDefault: currentLocation.value.isDefault,
        status: currentLocation.value.status
      }
      const result = await locationStore.updateLocation(currentLocation.value.id, updateData)
      if (result) {
        toast.add({ severity: 'success', summary: 'Success', detail: 'Location updated', life: 3000 })
        showDialog.value = false
      } else {
        error.value = locationStore.error || 'Failed to update location'
      }
    } else {
      const createData: CreateLocationData = {
        name: currentLocation.value.name,
        address: currentLocation.value.address,
        phone: currentLocation.value.phone,
        email: currentLocation.value.email,
        isDefault: currentLocation.value.isDefault,
        status: currentLocation.value.status
      }
      const result = await locationStore.createLocation(createData)
      if (result) {
        toast.add({ severity: 'success', summary: 'Success', detail: 'Location created', life: 3000 })
        showDialog.value = false
      } else {
        error.value = locationStore.error || 'Failed to create location'
      }
    }
  } catch (err: any) {
    console.error('Error saving location:', err)
    error.value = err.response?.data?.error || 'Failed to save location'
  } finally {
    loading.value = false
  }
}

async function deleteLocation(location: Location) {
  if (location.isDefault) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Cannot delete the default location', life: 3000 })
    return
  }

  if (confirm(`Are you sure you want to delete "${location.name}"?`)) {
    loading.value = true
    try {
      const success = await locationStore.deleteLocation(location.id)
      if (success) {
        toast.add({ severity: 'success', summary: 'Success', detail: 'Location deleted', life: 3000 })
      } else {
        toast.add({ severity: 'error', summary: 'Error', detail: locationStore.error || 'Failed to delete location', life: 3000 })
      }
    } catch (err: any) {
      console.error('Error deleting location:', err)
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete location', life: 3000 })
    } finally {
      loading.value = false
    }
  }
}

async function setAsDefault(location: Location) {
  if (location.isDefault) return

  loading.value = true
  try {
    const success = await locationStore.setDefaultLocation(location.id)
    if (success) {
      toast.add({ severity: 'success', summary: 'Success', detail: `"${location.name}" is now the default location`, life: 3000 })
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: locationStore.error || 'Failed to set default', life: 3000 })
    }
  } catch (err: any) {
    console.error('Error setting default:', err)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to set default location', life: 3000 })
  } finally {
    loading.value = false
  }
}

function formatAddress(location: Location): string {
  const parts = []
  if (location.address?.street) parts.push(location.address.street)
  if (location.address?.city) parts.push(location.address.city)
  if (location.address?.state) parts.push(location.address.state)
  if (location.address?.zipCode) parts.push(location.address.zipCode)
  return parts.join(', ') || '-'
}

onMounted(async () => {
  loading.value = true
  try {
    await locationStore.fetchLocations()
  } catch (err) {
    console.error('Error loading locations:', err)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load locations', life: 3000 })
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Locations</h1>
        <p class="text-gray-600 mt-1">Manage your business locations</p>
      </div>
      <Button
        label="Add Location"
        icon="pi pi-plus"
        class="mt-4 sm:mt-0"
        @click="openCreateDialog"
      />
    </div>

    <!-- Search -->
    <Card class="mb-6 shadow-sm">
      <template #content>
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="searchQuery"
            placeholder="Search locations..."
            class="w-full"
          />
        </IconField>
      </template>
    </Card>

    <!-- Locations Table -->
    <Card class="shadow-sm">
      <template #content>
        <DataTable
          :value="filteredLocations"
          :loading="loading"
          paginator
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20]"
          responsiveLayout="scroll"
          class="p-datatable-sm"
        >
          <template #empty>
            <div class="text-center py-8 text-gray-500">
              No locations found
            </div>
          </template>

          <Column field="name" header="Name" sortable>
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <span class="font-medium">{{ data.name }}</span>
                <Tag v-if="data.isDefault" value="Default" severity="info" class="text-xs" />
              </div>
            </template>
          </Column>

          <Column field="address" header="Address">
            <template #body="{ data }">
              <span class="text-sm">{{ formatAddress(data) }}</span>
            </template>
          </Column>

          <Column field="phone" header="Phone" />

          <Column field="email" header="Email" />

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
                  v-if="!data.isDefault"
                  icon="pi pi-star"
                  text
                  size="small"
                  severity="secondary"
                  v-tooltip.top="'Set as Default'"
                  @click="setAsDefault(data)"
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
                  v-if="!data.isDefault"
                  icon="pi pi-trash"
                  text
                  size="small"
                  severity="danger"
                  v-tooltip.top="'Delete'"
                  @click="deleteLocation(data)"
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
      :header="editMode ? 'Edit Location' : 'Add Location'"
      :modal="true"
      :style="{ width: '500px' }"
    >
      <Message v-if="error" severity="error" class="mb-4">{{ error }}</Message>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Location Name *</label>
          <InputText v-model="currentLocation.name" class="w-full" placeholder="e.g., Downtown Branch" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
          <InputText v-model="currentLocation.address!.street" class="w-full" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
            <InputText v-model="currentLocation.address!.city" class="w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">State</label>
            <InputText v-model="currentLocation.address!.state" class="w-full" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
          <InputText v-model="currentLocation.address!.zipCode" class="w-full" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <InputText v-model="currentLocation.phone" class="w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <InputText v-model="currentLocation.email" type="email" class="w-full" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <Select
            v-model="currentLocation.status"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" text severity="secondary" @click="showDialog = false" />
        <Button :label="editMode ? 'Update' : 'Create'" @click="saveLocation" :loading="loading" />
      </template>
    </Dialog>
  </div>
</template>
