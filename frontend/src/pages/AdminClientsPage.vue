<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Message from 'primevue/message'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Card from 'primevue/card'
import axios from 'axios'

const router = useRouter()

// State
const loading = ref(false)
const metricsLoading = ref(false)
const error = ref('')
const clients = ref<any[]>([])
const expandedRows = ref<any[]>([])
const metrics = ref<any>({
  calls: { total: 0, totalMinutes: 0 },
  appointments: { total: 0 },
  employees: { total: 0 },
  services: { total: 0 },
  trials: { active: 0, avgDaysRemaining: 0 },
  paidClients: 0
})

// Computed
const totalClients = computed(() => clients.value.length)

// Store password in session storage (cleared on browser close)
const ADMIN_PASSWORD_KEY = 'admin_password'
const ADMIN_AUTH_KEY = 'admin_authenticated'

// Check if authenticated on mount
onMounted(async () => {
  const isAuth = sessionStorage.getItem(ADMIN_AUTH_KEY)
  const storedPassword = sessionStorage.getItem(ADMIN_PASSWORD_KEY)

  if (isAuth !== 'true' || !storedPassword) {
    // Not authenticated, redirect to login
    router.push('/criton-admin')
    return
  }

  // Load clients data and metrics in parallel
  await Promise.all([loadClients(), loadMetrics()])
})

// Load clients data
async function loadClients() {
  loading.value = true
  error.value = ''
  
  const storedPassword = sessionStorage.getItem(ADMIN_PASSWORD_KEY)
  
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL || ''}/api/admin/clients`,
      {
        headers: {
          'X-Admin-Password': storedPassword || ''
        }
      }
    )

    clients.value = response.data.data.clients
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to load clients'
    // If unauthorized, clear auth and redirect to login
    if (err.response?.status === 401) {
      logout()
    }
  } finally {
    loading.value = false
  }
}

// Logout
function logout() {
  sessionStorage.removeItem(ADMIN_PASSWORD_KEY)
  sessionStorage.removeItem(ADMIN_AUTH_KEY)
  router.push('/criton-admin')
}

// Load aggregate metrics
async function loadMetrics() {
  metricsLoading.value = true

  const storedPassword = sessionStorage.getItem(ADMIN_PASSWORD_KEY)

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL || ''}/api/admin/metrics`,
      {
        headers: {
          'X-Admin-Password': storedPassword || ''
        }
      }
    )

    metrics.value = response.data.data
  } catch (err: any) {
    console.error('Failed to load metrics:', err.response?.data?.error || err.message)
  } finally {
    metricsLoading.value = false
  }
}

// Refresh data
async function refreshData() {
  await Promise.all([loadClients(), loadMetrics()])
}

// Format date
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Format date and time
function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

// Get status severity for Tag component
function getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
  const severityMap: Record<string, 'success' | 'info' | 'warn' | 'danger'> = {
    active: 'success',
    pending: 'info',
    suspended: 'warn',
    cancelled: 'danger'
  }
  return severityMap[status] || 'secondary'
}

// Get plan type severity
function getPlanSeverity(planType: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
  const severityMap: Record<string, 'success' | 'info' | 'warn' | 'secondary'> = {
    enterprise: 'success',
    professional: 'info',
    basic: 'warn',
    free: 'secondary'
  }
  return severityMap[planType] || 'secondary'
}

// Navigate back to home
function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <i class="pi pi-shield text-blue-600 text-2xl"></i>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p class="text-sm text-gray-600">Manage and view all registered clients</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Button
              label="Refresh"
              icon="pi pi-refresh"
              @click="refreshData"
              :loading="loading"
              outlined
              size="small"
            />
            <Button
              label="Logout"
              icon="pi pi-sign-out"
              @click="logout"
              severity="secondary"
              size="small"
            />
            <Button
              label="Back to Home"
              icon="pi pi-home"
              @click="goBack"
              text
              size="small"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Error Message -->
      <Message v-if="error" severity="error" class="mb-6">{{ error }}</Message>

      <!-- Client Dashboard -->
      <div class="space-y-6">
        <!-- Summary Metrics Tiles -->
        <Card>
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-chart-bar text-gray-600"></i>
              <span>Platform Summary</span>
            </div>
          </template>
          <template #content>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <!-- Client Stats -->
              <div class="text-center p-4 bg-blue-50 rounded-lg">
                <div class="text-3xl font-bold text-blue-600">{{ totalClients }}</div>
                <div class="text-sm text-gray-600 mt-1">Total Clients</div>
              </div>
              <div class="text-center p-4 bg-green-50 rounded-lg">
                <div class="text-3xl font-bold text-green-600">
                  {{ clients.filter(c => c.status === 'active').length }}
                </div>
                <div class="text-sm text-gray-600 mt-1">Active Clients</div>
              </div>
              <div class="text-center p-4 bg-purple-50 rounded-lg">
                <div class="text-3xl font-bold text-purple-600">{{ metrics.paidClients }}</div>
                <div class="text-sm text-gray-600 mt-1">Paid Plans</div>
              </div>

              <!-- Trial Stats -->
              <div class="text-center p-4 bg-orange-50 rounded-lg">
                <div class="text-3xl font-bold text-orange-600">{{ metrics.trials?.active || 0 }}</div>
                <div class="text-sm text-gray-600 mt-1">Active Trials</div>
              </div>

              <!-- Call Stats -->
              <div class="text-center p-4 bg-indigo-50 rounded-lg">
                <div class="text-3xl font-bold text-indigo-600">{{ metrics.calls?.total || 0 }}</div>
                <div class="text-sm text-gray-600 mt-1">Total Calls</div>
              </div>
              <div class="text-center p-4 bg-cyan-50 rounded-lg">
                <div class="text-3xl font-bold text-cyan-600">{{ metrics.calls?.totalMinutes || 0 }}</div>
                <div class="text-sm text-gray-600 mt-1">Call Minutes</div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Clients Table -->
        <Card>
          <template #title>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <i class="pi pi-users text-gray-600"></i>
                <span>All Clients</span>
              </div>
              <span class="text-sm font-normal text-gray-600">
                {{ totalClients }} {{ totalClients === 1 ? 'client' : 'clients' }}
              </span>
            </div>
          </template>
          <template #content>
            <DataTable
              v-model:expandedRows="expandedRows"
              :value="clients"
              :rows="10"
              :paginator="clients.length > 10"
              responsiveLayout="scroll"
              :loading="loading"
              stripedRows
              dataKey="id"
              class="text-sm"
            >
              <Column expander style="width: 3rem" />
              <Column field="name" header="Business Name" sortable>
                <template #body="{ data }">
                  <div>
                    <div class="font-semibold text-gray-900">{{ data.name }}</div>
                    <div class="text-xs text-gray-500">{{ data.slug }}</div>
                  </div>
                </template>
              </Column>
              
              <Column field="contactEmail" header="Contact Email" sortable>
                <template #body="{ data }">
                  <a :href="`mailto:${data.contactEmail}`" class="text-blue-600 hover:underline">
                    {{ data.contactEmail }}
                  </a>
                </template>
              </Column>
              
              <Column field="status" header="Status" sortable>
                <template #body="{ data }">
                  <Tag
                    :value="data.status"
                    :severity="getStatusSeverity(data.status)"
                    class="uppercase text-xs"
                  />
                </template>
              </Column>
              
              <Column field="planType" header="Plan" sortable>
                <template #body="{ data }">
                  <Tag
                    :value="data.planType"
                    :severity="getPlanSeverity(data.planType)"
                    class="uppercase text-xs"
                  />
                </template>
              </Column>
              
              <Column field="signUpDate" header="Sign Up Date" sortable>
                <template #body="{ data }">
                  <div>
                    <div class="font-medium text-gray-900">{{ formatDate(data.signUpDate) }}</div>
                    <div class="text-xs text-gray-500">{{ formatDateTime(data.signUpDate) }}</div>
                  </div>
                </template>
              </Column>
              
              <Column field="lastUpdated" header="Last Updated" sortable>
                <template #body="{ data }">
                  <div class="text-sm text-gray-600">{{ formatDate(data.lastUpdated) }}</div>
                </template>
              </Column>

              <template #empty>
                <div class="text-center py-8 text-gray-500">
                  <i class="pi pi-users text-4xl mb-3"></i>
                  <p>No clients found</p>
                </div>
              </template>

              <!-- Expandable Row Content -->
              <template #expansion="{ data }">
                <div class="p-4 bg-gray-50">
                  <h4 class="text-lg font-semibold mb-4 text-gray-800">{{ data.name }} - Metrics</h4>

                  <div v-if="data.metrics" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <!-- Tenant ID -->
                    <div class="bg-white p-3 rounded-lg shadow-sm border col-span-2">
                      <div class="flex items-center gap-2 mb-1">
                        <i class="pi pi-key text-gray-500"></i>
                        <span class="text-xs text-gray-500 uppercase">Tenant ID</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <code class="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded break-all">{{ data.id }}</code>
                        <button
                          @click="navigator.clipboard.writeText(data.id)"
                          class="text-blue-500 hover:text-blue-700 p-1"
                          title="Copy to clipboard"
                        >
                          <i class="pi pi-copy text-sm"></i>
                        </button>
                      </div>
                    </div>

                    <!-- Call Metrics -->
                    <div class="bg-white p-3 rounded-lg shadow-sm border">
                      <div class="flex items-center gap-2 mb-1">
                        <i class="pi pi-phone text-indigo-500"></i>
                        <span class="text-xs text-gray-500 uppercase">Calls</span>
                      </div>
                      <div class="text-2xl font-bold text-gray-800">{{ data.metrics.calls?.total || 0 }}</div>
                    </div>

                    <div class="bg-white p-3 rounded-lg shadow-sm border">
                      <div class="flex items-center gap-2 mb-1">
                        <i class="pi pi-clock text-cyan-500"></i>
                        <span class="text-xs text-gray-500 uppercase">Call Minutes</span>
                      </div>
                      <div class="text-2xl font-bold text-gray-800">{{ data.metrics.calls?.totalMinutes || 0 }}</div>
                    </div>

                    <!-- Appointment Metrics -->
                    <div class="bg-white p-3 rounded-lg shadow-sm border">
                      <div class="flex items-center gap-2 mb-1">
                        <i class="pi pi-calendar text-teal-500"></i>
                        <span class="text-xs text-gray-500 uppercase">Appointments</span>
                      </div>
                      <div class="text-2xl font-bold text-gray-800">{{ data.metrics.appointments?.total || 0 }}</div>
                      <div class="text-xs text-gray-500 mt-1">
                        {{ data.metrics.appointments?.upcoming || 0 }} upcoming
                      </div>
                    </div>

                    <div class="bg-white p-3 rounded-lg shadow-sm border">
                      <div class="flex items-center gap-2 mb-1">
                        <i class="pi pi-check-circle text-green-500"></i>
                        <span class="text-xs text-gray-500 uppercase">Completed</span>
                      </div>
                      <div class="text-2xl font-bold text-gray-800">{{ data.metrics.appointments?.completed || 0 }}</div>
                    </div>

                    <div class="bg-white p-3 rounded-lg shadow-sm border">
                      <div class="flex items-center gap-2 mb-1">
                        <i class="pi pi-times-circle text-red-500"></i>
                        <span class="text-xs text-gray-500 uppercase">Cancelled</span>
                      </div>
                      <div class="text-2xl font-bold text-gray-800">{{ data.metrics.appointments?.cancelled || 0 }}</div>
                    </div>

                    <!-- Employee/Service Metrics -->
                    <div class="bg-white p-3 rounded-lg shadow-sm border">
                      <div class="flex items-center gap-2 mb-1">
                        <i class="pi pi-users text-pink-500"></i>
                        <span class="text-xs text-gray-500 uppercase">Employees</span>
                      </div>
                      <div class="text-2xl font-bold text-gray-800">{{ data.metrics.employees || 0 }}</div>
                    </div>

                    <div class="bg-white p-3 rounded-lg shadow-sm border">
                      <div class="flex items-center gap-2 mb-1">
                        <i class="pi pi-list text-amber-500"></i>
                        <span class="text-xs text-gray-500 uppercase">Services</span>
                      </div>
                      <div class="text-2xl font-bold text-gray-800">{{ data.metrics.services || 0 }}</div>
                    </div>

                    <!-- Phone & Trial Info -->
                    <div class="bg-white p-3 rounded-lg shadow-sm border">
                      <div class="flex items-center gap-2 mb-1">
                        <i class="pi pi-mobile text-blue-500"></i>
                        <span class="text-xs text-gray-500 uppercase">Phone Number</span>
                      </div>
                      <div class="text-sm font-medium text-gray-800">
                        {{ data.metrics.phoneNumber || data.phoneNumber || 'Not assigned' }}
                      </div>
                    </div>

                    <div v-if="data.metrics.trialDaysRemaining !== null" class="bg-white p-3 rounded-lg shadow-sm border">
                      <div class="flex items-center gap-2 mb-1">
                        <i class="pi pi-hourglass text-orange-500"></i>
                        <span class="text-xs text-gray-500 uppercase">Trial Days Left</span>
                      </div>
                      <div class="text-2xl font-bold" :class="data.metrics.trialDaysRemaining <= 3 ? 'text-red-600' : 'text-orange-600'">
                        {{ data.metrics.trialDaysRemaining }}
                      </div>
                    </div>

                    <div class="bg-white p-3 rounded-lg shadow-sm border">
                      <div class="flex items-center gap-2 mb-1">
                        <i class="pi pi-credit-card text-purple-500"></i>
                        <span class="text-xs text-gray-500 uppercase">Plan</span>
                      </div>
                      <Tag
                        :value="data.metrics.planType || data.planType || 'free'"
                        :severity="getPlanSeverity(data.metrics.planType || data.planType || 'free')"
                        class="uppercase text-xs"
                      />
                    </div>

                  </div>

                  <div v-else class="text-center py-4 text-gray-500">
                    <i class="pi pi-info-circle mr-2"></i>
                    No metrics available for this client
                  </div>
                </div>
              </template>
            </DataTable>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional styling if needed */
</style>
