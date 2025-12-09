import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * Helper function to decode JWT token and extract tenantId
 * @param token - JWT token string
 * @returns tenantId from token payload or null
 */
function extractTenantIdFromToken(token: string): string | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3 || !parts[1]) {
      return null
    }
    
    // JWT uses base64url encoding - replace URL-safe characters with standard base64
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(base64))
    return payload.tenantId || null
  } catch {
    return null
  }
}

// Request interceptor - add JWT token and tenant ID to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      
      // Extract tenant ID from token and set as header
      const tenantId = extractTenantIdFromToken(token)
      if (tenantId) {
        config.headers['X-Tenant-ID'] = tenantId
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle token expiration
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      localStorage.removeItem('token')
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
