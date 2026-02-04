import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export interface Integration {
  id: string
  tenantId: string
  provider: 'vagaro'
  status: 'pending' | 'active' | 'error' | 'disabled'
  webhookToken: string
  webhookTokenMasked?: string
  config: {
    clientId?: string
    clientSecretKey?: string
    region?: string
    businessId?: string
    businessName?: string
  }
  syncSettings: {
    syncAppointments: boolean
    syncCustomers: boolean
    syncEmployees: boolean
  }
  lastWebhookAt: string | null
  webhookCount: number
  lastError: string | null
  metadata?: {
    lastServicesImport?: string
    lastStaffImport?: string
    servicesImportResults?: ImportResults
    staffImportResults?: ImportResults
  }
  createdAt: string
  updatedAt: string
}

export interface VagaroLocation {
  businessId: string
  businessName: string
  businessGroupId?: string
  businessAlias?: string
  city?: string
  regionCode?: string
  postalCode?: string
}

export interface ImportResults {
  total: number
  imported: number
  updated: number
  skipped: number
  errors: Array<{ service?: string; employee?: string; error: string }>
}

export interface TestConnectionResult {
  success: boolean
  message: string
  locations: VagaroLocation[]
}

export const useIntegrationStore = defineStore('integrations', () => {
  // State
  const integrations = ref<Integration[]>([])
  const currentIntegration = ref<Integration | null>(null)
  const webhookUrl = ref<string | null>(null)
  const vagaroLocations = ref<VagaroLocation[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Helper function to handle API errors
  function handleApiError(err: unknown, defaultMessage: string): string {
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosError = err as { response?: { data?: { error?: string } } }
      return axiosError.response?.data?.error || defaultMessage
    }
    return defaultMessage
  }

  // Actions
  async function fetchIntegrations(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const response = await api.get('/api/integrations')
      integrations.value = response.data?.data?.integrations || []
    } catch (err: unknown) {
      error.value = handleApiError(err, 'Failed to fetch integrations')
    } finally {
      loading.value = false
    }
  }

  async function fetchIntegration(provider: string): Promise<Integration | null> {
    loading.value = true
    error.value = null

    try {
      const response = await api.get(`/api/integrations/${provider}`)
      currentIntegration.value = response.data?.data?.integration || null
      webhookUrl.value = response.data?.data?.webhookUrl || null
      return currentIntegration.value
    } catch (err: unknown) {
      // 404 is expected if integration doesn't exist yet
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number } }
        if (axiosError.response?.status === 404) {
          currentIntegration.value = null
          webhookUrl.value = null
          return null
        }
      }
      error.value = handleApiError(err, 'Failed to fetch integration')
      return null
    } finally {
      loading.value = false
    }
  }

  async function setupVagaroIntegration(config?: Record<string, unknown>, syncSettings?: Integration['syncSettings']): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/api/integrations/vagaro', { config, syncSettings })
      currentIntegration.value = response.data?.data?.integration || null
      webhookUrl.value = response.data?.data?.webhookUrl || null
      
      // Refresh integrations list
      await fetchIntegrations()
      
      return true
    } catch (err: unknown) {
      error.value = handleApiError(err, 'Failed to setup integration')
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateIntegration(provider: string, data: { config?: Record<string, unknown>; syncSettings?: Integration['syncSettings']; enabled?: boolean }): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const response = await api.patch(`/api/integrations/${provider}`, data)
      currentIntegration.value = response.data?.data?.integration || null
      webhookUrl.value = response.data?.data?.webhookUrl || null
      
      // Refresh integrations list
      await fetchIntegrations()
      
      return true
    } catch (err: unknown) {
      error.value = handleApiError(err, 'Failed to update integration')
      return false
    } finally {
      loading.value = false
    }
  }

  async function regenerateToken(provider: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const response = await api.post(`/api/integrations/${provider}/regenerate-token`)
      currentIntegration.value = response.data?.data?.integration || null
      webhookUrl.value = response.data?.data?.webhookUrl || null
      return true
    } catch (err: unknown) {
      error.value = handleApiError(err, 'Failed to regenerate token')
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteIntegration(provider: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      await api.delete(`/api/integrations/${provider}`)
      currentIntegration.value = null
      webhookUrl.value = null
      vagaroLocations.value = []
      
      // Refresh integrations list
      await fetchIntegrations()
      
      return true
    } catch (err: unknown) {
      error.value = handleApiError(err, 'Failed to delete integration')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Test Vagaro API connection with provided credentials
   */
  async function testVagaroConnection(credentials: { clientId: string; clientSecretKey: string; region?: string }): Promise<TestConnectionResult> {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/api/integrations/vagaro/test-connection', credentials)
      const result = response.data?.data || { success: false, message: 'Unknown error', locations: [] }
      
      if (result.success && result.locations) {
        vagaroLocations.value = result.locations
      }
      
      return result
    } catch (err: unknown) {
      const errorMessage = handleApiError(err, 'Failed to test connection')
      error.value = errorMessage
      return { success: false, message: errorMessage, locations: [] }
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch Vagaro business locations
   */
  async function fetchVagaroLocations(credentials?: { clientId: string; clientSecretKey: string; region?: string }): Promise<VagaroLocation[]> {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/api/integrations/vagaro/locations', credentials || {})
      vagaroLocations.value = response.data?.data?.locations || []
      return vagaroLocations.value
    } catch (err: unknown) {
      error.value = handleApiError(err, 'Failed to fetch locations')
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Import services from Vagaro
   */
  async function importVagaroServices(): Promise<{ success: boolean; message: string; results?: ImportResults }> {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/api/integrations/vagaro/import-services')
      const data = response.data?.data || {}
      
      // Refresh integration to get updated metadata
      await fetchIntegration('vagaro')
      
      return {
        success: true,
        message: data.message || 'Import completed',
        results: data.results,
      }
    } catch (err: unknown) {
      const errorMessage = handleApiError(err, 'Failed to import services')
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Import staff from Vagaro
   */
  async function importVagaroStaff(): Promise<{ success: boolean; message: string; results?: ImportResults }> {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/api/integrations/vagaro/import-staff')
      const data = response.data?.data || {}
      
      // Refresh integration to get updated metadata
      await fetchIntegration('vagaro')
      
      return {
        success: true,
        message: data.message || 'Import completed',
        results: data.results,
      }
    } catch (err: unknown) {
      const errorMessage = handleApiError(err, 'Failed to import staff')
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  function clearError(): void {
    error.value = null
  }

  return {
    // State
    integrations,
    currentIntegration,
    webhookUrl,
    vagaroLocations,
    loading,
    error,
    // Actions
    fetchIntegrations,
    fetchIntegration,
    setupVagaroIntegration,
    updateIntegration,
    regenerateToken,
    deleteIntegration,
    testVagaroConnection,
    fetchVagaroLocations,
    importVagaroServices,
    importVagaroStaff,
    clearError,
  }
})
