import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export interface LocationAddress {
  street?: string
  city?: string
  state?: string
  zipCode?: string
}

export interface Location {
  id: string
  tenantId: string
  name: string
  address?: LocationAddress
  phone?: string
  email?: string
  isDefault: boolean
  status: 'active' | 'inactive'
  businessHours?: Record<string, { open: string; close: string; enabled: boolean }>
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface CreateLocationData {
  name: string
  address?: LocationAddress
  phone?: string
  email?: string
  isDefault?: boolean
  status?: 'active' | 'inactive'
  businessHours?: Record<string, { open: string; close: string; enabled: boolean }>
}

export interface UpdateLocationData {
  name?: string
  address?: LocationAddress
  phone?: string
  email?: string
  isDefault?: boolean
  status?: 'active' | 'inactive'
  businessHours?: Record<string, { open: string; close: string; enabled: boolean }>
}

export const useLocationStore = defineStore('location', () => {
  // State
  const locations = ref<Location[]>([])
  const currentLocation = ref<Location | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeLocations = computed(() => locations.value.filter(loc => loc.status === 'active'))
  const defaultLocation = computed(() => locations.value.find(loc => loc.isDefault))
  const hasLocations = computed(() => locations.value.length > 0)

  // Helper function to handle API errors
  function handleApiError(err: unknown, defaultMessage: string): string {
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosError = err as { response?: { data?: { message?: string; error?: string } } }
      return axiosError.response?.data?.message || axiosError.response?.data?.error || defaultMessage
    }
    return defaultMessage
  }

  // Actions
  async function fetchLocations(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const response = await api.get('/api/locations')
      const data = response.data?.data

      if (data?.locations) {
        locations.value = data.locations
      } else if (Array.isArray(data)) {
        locations.value = data
      }
    } catch (err: unknown) {
      error.value = handleApiError(err, 'Failed to fetch locations')
    } finally {
      loading.value = false
    }
  }

  async function fetchLocationById(locationId: string): Promise<Location | null> {
    loading.value = true
    error.value = null

    try {
      const response = await api.get(`/api/locations/${locationId}`)
      const location = response.data?.data?.location

      if (location) {
        // Update in locations array if exists
        const index = locations.value.findIndex(l => l.id === locationId)
        if (index !== -1) {
          locations.value[index] = location
        }
        return location
      }
      return null
    } catch (err: unknown) {
      error.value = handleApiError(err, 'Failed to fetch location')
      return null
    } finally {
      loading.value = false
    }
  }

  async function createLocation(locationData: CreateLocationData): Promise<Location | null> {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/api/locations', locationData)
      const location = response.data?.data?.location

      if (location) {
        // If this is set as default, update other locations
        if (location.isDefault) {
          locations.value = locations.value.map(l => ({
            ...l,
            isDefault: false
          }))
        }
        locations.value.push(location)
        return location
      }
      return null
    } catch (err: unknown) {
      error.value = handleApiError(err, 'Failed to create location')
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateLocation(locationId: string, updateData: UpdateLocationData): Promise<Location | null> {
    loading.value = true
    error.value = null

    try {
      const response = await api.patch(`/api/locations/${locationId}`, updateData)
      const location = response.data?.data?.location

      if (location) {
        // If this is set as default, update other locations
        if (location.isDefault) {
          locations.value = locations.value.map(l => ({
            ...l,
            isDefault: l.id === locationId
          }))
        }

        // Update in locations array
        const index = locations.value.findIndex(l => l.id === locationId)
        if (index !== -1) {
          locations.value[index] = location
        }
        return location
      }
      return null
    } catch (err: unknown) {
      error.value = handleApiError(err, 'Failed to update location')
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteLocation(locationId: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      await api.delete(`/api/locations/${locationId}`)
      locations.value = locations.value.filter(l => l.id !== locationId)
      return true
    } catch (err: unknown) {
      error.value = handleApiError(err, 'Failed to delete location')
      return false
    } finally {
      loading.value = false
    }
  }

  async function setDefaultLocation(locationId: string): Promise<boolean> {
    return !!(await updateLocation(locationId, { isDefault: true }))
  }

  function selectLocation(location: Location | null): void {
    currentLocation.value = location
  }

  function clearLocations(): void {
    locations.value = []
    currentLocation.value = null
  }

  function clearError(): void {
    error.value = null
  }

  return {
    // State
    locations,
    currentLocation,
    loading,
    error,
    // Getters
    activeLocations,
    defaultLocation,
    hasLocations,
    // Actions
    fetchLocations,
    fetchLocationById,
    createLocation,
    updateLocation,
    deleteLocation,
    setDefaultLocation,
    selectLocation,
    clearLocations,
    clearError
  }
})
