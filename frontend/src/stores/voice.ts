import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export interface Voice {
  id: string
  label: string
  elevenlabsVoiceId: string
  description?: string
}

export const useVoiceStore = defineStore('voice', () => {
  // State
  const voices = ref<Voice[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Helper function to handle API errors
  function handleApiError(err: unknown, defaultMessage: string): string {
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      return axiosError.response?.data?.message || defaultMessage
    }
    return defaultMessage
  }

  // Actions
  async function fetchVoices(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const response = await api.get('/api/voices')
      const fetchedVoices = response.data?.data?.voices

      if (!fetchedVoices) {
        throw new Error('Invalid response structure')
      }

      voices.value = fetchedVoices
    } catch (err: unknown) {
      error.value = handleApiError(err, 'Failed to fetch voices')
    } finally {
      loading.value = false
    }
  }

  function clearError(): void {
    error.value = null
  }

  return {
    // State
    voices,
    loading,
    error,
    // Actions
    fetchVoices,
    clearError
  }
})
