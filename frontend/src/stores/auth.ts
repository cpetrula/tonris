import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const fullName = computed(() => {
    if (!user.value) return ''
    return `${user.value.firstName} ${user.value.lastName}`
  })

  // Actions
  async function login(credentials: LoginCredentials): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/api/auth/login', credentials)
      const { tokens, user: userData } = response.data.data

      token.value = tokens.accessToken
      user.value = userData
      localStorage.setItem('token', tokens.accessToken)

      return true
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } }
        error.value = axiosError.response?.data?.message || 'Login failed'
      } else {
        error.value = 'Login failed'
      }
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(data: RegisterData): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/api/auth/register', data)
      const { tokens, user: userData } = response.data.data

      token.value = tokens.accessToken
      user.value = userData
      localStorage.setItem('token', tokens.accessToken)

      return true
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } }
        error.value = axiosError.response?.data?.message || 'Registration failed'
      } else {
        error.value = 'Registration failed'
      }
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout(): Promise<void> {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  async function fetchUser(): Promise<void> {
    if (!token.value) return

    try {
      const response = await api.get('/api/auth/me')
      user.value = response.data.data.user
    } catch {
      // Token is invalid, clear auth state
      await logout()
    }
  }

  function clearError(): void {
    error.value = null
  }

  return {
    // State
    user,
    token,
    loading,
    error,
    // Getters
    isAuthenticated,
    fullName,
    // Actions
    login,
    register,
    logout,
    fetchUser,
    clearError
  }
})
