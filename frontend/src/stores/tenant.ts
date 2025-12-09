import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export interface Tenant {
  id: string
  name: string
  slug: string
  plan: string
  status: 'active' | 'inactive' | 'suspended'
  twilioPhoneNumber?: string
  createdAt: string
}

export interface TenantSettings {
  timezone: string
  language: string
  dateFormat: string
  features: Record<string, boolean>
}

export const useTenantStore = defineStore('tenant', () => {
  // State
  const currentTenant = ref<Tenant | null>(null)
  const tenants = ref<Tenant[]>([])
  const settings = ref<TenantSettings | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const hasTenant = computed(() => !!currentTenant.value)
  const tenantId = computed(() => currentTenant.value?.id || null)
  const tenantName = computed(() => currentTenant.value?.name || '')
  const isActiveTenant = computed(() => currentTenant.value?.status === 'active')

  // Actions
  async function fetchTenants(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      // Fetch the current tenant information
      const response = await api.get('/api/tenant')
      const tenant = response.data?.data?.tenant

      if (!tenant) {
        throw new Error('Invalid response structure')
      }

      // Set current tenant and add to tenants array
      currentTenant.value = tenant
      tenants.value = [tenant]
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } }
        error.value = axiosError.response?.data?.message || 'Failed to fetch tenant'
      } else {
        error.value = 'Failed to fetch tenant'
      }
    } finally {
      loading.value = false
    }
  }

  async function selectTenant(tenantId: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const tenant = tenants.value.find(t => t.id === tenantId)
      if (!tenant) {
        error.value = 'Tenant not found'
        return false
      }

      currentTenant.value = tenant
      
      // Fetch tenant settings
      await fetchSettings()
      
      return true
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } }
        error.value = axiosError.response?.data?.message || 'Failed to select tenant'
      } else {
        error.value = 'Failed to select tenant'
      }
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchSettings(): Promise<void> {
    if (!currentTenant.value) return

    try {
      const response = await api.get('/api/tenant/settings')
      settings.value = response.data.settings
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } }
        error.value = axiosError.response?.data?.message || 'Failed to fetch settings'
      } else {
        error.value = 'Failed to fetch settings'
      }
    }
  }

  async function updateSettings(newSettings: Partial<TenantSettings>): Promise<boolean> {
    if (!currentTenant.value) return false

    loading.value = true
    error.value = null

    try {
      const response = await api.patch(
        '/api/tenant/settings',
        newSettings
      )
      settings.value = response.data.settings
      return true
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } }
        error.value = axiosError.response?.data?.message || 'Failed to update settings'
      } else {
        error.value = 'Failed to update settings'
      }
      return false
    } finally {
      loading.value = false
    }
  }

  function clearTenant(): void {
    currentTenant.value = null
    settings.value = null
    tenants.value = []
  }

  function clearError(): void {
    error.value = null
  }

  return {
    // State
    currentTenant,
    tenants,
    settings,
    loading,
    error,
    // Getters
    hasTenant,
    tenantId,
    tenantName,
    isActiveTenant,
    // Actions
    fetchTenants,
    selectTenant,
    fetchSettings,
    updateSettings,
    clearTenant,
    clearError
  }
})
