<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Message from 'primevue/message'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Card from 'primevue/card'
import ProgressSpinner from 'primevue/progressspinner'
import axios from 'axios'

const router = useRouter()

// Types
interface UsageMetrics {
  calls: {
    total: number
    totalMinutes: number
    completed: number
    missed: number
  }
  appointments: {
    total: number
    completed: number
    cancelled: number
    noShow: number
    upcoming: number
  }
}

interface Client {
  id: string
  name: string
  slug: string
  status: string
  planType: string
  contactEmail: string
  signUpDate: string
  lastUpdated: string
  usage: UsageMetrics
}

interface MonthlyTrend {
  month: string
  calls: number
  minutes: number
  appointments: number
}

interface ClientDetails {
  client: Client
  currentMonth: UsageMetrics
  monthlyTrend: MonthlyTrend[]
  recentCalls: any[]
  recentAppointments: any[]
}

// State
const loading = ref(false)
const error = ref('')
const clients = ref<Client[]>([])
const expandedRows = ref<any>({})
const clientDetails = ref<Record<string, ClientDetails>>({})
const loadingDetails = ref<Record<string, boolean>>({})

// Computed
const totalClients = computed(() => clients.value.length)
const totalCallsThisMonth = computed(() =>
  clients.value.reduce((sum, c) => sum + (c.usage?.calls?.total || 0), 0)
)
const totalMinutesThisMonth = computed(() =>
  clients.value.reduce((sum, c) => sum + (c.usage?.calls?.totalMinutes || 0), 0)
)
const totalAppointmentsThisMonth = computed(() =>
  clients.value.reduce((sum, c) => sum + (c.usage?.appointments?.total || 0), 0)
)

// Store password in session storage (cleared on browser close)
const ADMIN_PASSWORD_KEY = 'admin_password'
const ADMIN_AUTH_KEY = 'admin_authenticated'

// Check if authenticated on mount
onMounted(async () => {
  const isAuth = sessionStorage.getItem(ADMIN_AUTH_KEY)
  const storedPassword = sessionStorage.getItem(ADMIN_PASSWORD_KEY)

  if (isAuth !== 'true' || !storedPassword) {
    router.push('/criton-admin')
    return
  }

  await loadClients()
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
    if (err.response?.status === 401) {
      logout()
    }
  } finally {
    loading.value = false
  }
}

// Load detailed usage for expanded row
async function loadClientDetails(clientId: string) {
  if (clientDetails.value[clientId]) return // Already loaded

  loadingDetails.value[clientId] = true
  const storedPassword = sessionStorage.getItem(ADMIN_PASSWORD_KEY)

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL || ''}/api/admin/clients/${clientId}/usage`,
      {
        headers: {
          'X-Admin-Password': storedPassword || ''
        }
      }
    )
    clientDetails.value[clientId] = response.data.data
  } catch (err: any) {
    console.error('Failed to load client details:', err)
  } finally {
    loadingDetails.value[clientId] = false
  }
}

// Handle row expand
function onRowExpand(event: any) {
  loadClientDetails(event.data.id)
}

// Safe access to client details
function getDetails(clientId: string): ClientDetails | null {
  return clientDetails.value[clientId] || null
}

// Logout
function logout() {
  sessionStorage.removeItem(ADMIN_PASSWORD_KEY)
  sessionStorage.removeItem(ADMIN_AUTH_KEY)
  router.push('/criton-admin')
}

// Refresh data
async function refreshData() {
  clientDetails.value = {}
  expandedRows.value = {}
  await loadClients()
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

// Format duration in minutes to readable format
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

// Format duration in seconds
function formatSeconds(seconds: number | null): string {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
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

// Get call status severity
function getCallStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | undefined {
  const severityMap: Record<string, 'success' | 'info' | 'warn' | 'danger'> = {
    completed: 'success',
    'in-progress': 'info',
    'no-answer': 'warn',
    busy: 'warn',
    failed: 'danger',
    canceled: 'danger'
  }
  return severityMap[status] || 'secondary'
}

// Get appointment status severity
function getAppointmentStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | undefined {
  const severityMap: Record<string, 'success' | 'info' | 'warn' | 'danger'> = {
    completed: 'success',
    confirmed: 'success',
    scheduled: 'info',
    in_progress: 'info',
    cancelled: 'warn',
    no_show: 'danger'
  }
  return severityMap[status] || 'secondary'
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
              <p class="text-sm text-gray-600">Manage and monitor all clients with usage metrics</p>
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
        <!-- Stats Cards -->
        <Card>
          <template #content>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
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
              <div class="text-center p-4 bg-violet-50 rounded-lg">
                <div class="text-3xl font-bold text-violet-600">{{ totalCallsThisMonth }}</div>
                <div class="text-sm text-gray-600 mt-1">Calls This Month</div>
              </div>
              <div class="text-center p-4 bg-cyan-50 rounded-lg">
                <div class="text-3xl font-bold text-cyan-600">{{ formatDuration(totalMinutesThisMonth) }}</div>
                <div class="text-sm text-gray-600 mt-1">Minutes Used</div>
              </div>
              <div class="text-center p-4 bg-orange-50 rounded-lg">
                <div class="text-3xl font-bold text-orange-600">{{ totalAppointmentsThisMonth }}</div>
                <div class="text-sm text-gray-600 mt-1">Appointments</div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Clients Table with Expandable Rows -->
        <Card>
          <template #title>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <i class="pi pi-users text-gray-600"></i>
                <span>All Clients</span>
              </div>
              <span class="text-sm font-normal text-gray-600">
                Click a row to view detailed usage metrics
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
              class="text-sm"
              dataKey="id"
              @rowExpand="onRowExpand"
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

              <!-- Usage Columns -->
              <Column header="Calls" sortable :sortField="(d: any) => d.usage?.calls?.total || 0">
                <template #body="{ data }">
                  <div class="text-center">
                    <div class="font-semibold text-violet-600">{{ data.usage?.calls?.total || 0 }}</div>
                    <div class="text-xs text-gray-500">this month</div>
                  </div>
                </template>
              </Column>

              <Column header="Minutes" sortable :sortField="(d: any) => d.usage?.calls?.totalMinutes || 0">
                <template #body="{ data }">
                  <div class="text-center">
                    <div class="font-semibold text-cyan-600">{{ formatDuration(data.usage?.calls?.totalMinutes || 0) }}</div>
                    <div class="text-xs text-gray-500">this month</div>
                  </div>
                </template>
              </Column>

              <Column header="Appointments" sortable :sortField="(d: any) => d.usage?.appointments?.total || 0">
                <template #body="{ data }">
                  <div class="text-center">
                    <div class="font-semibold text-orange-600">{{ data.usage?.appointments?.total || 0 }}</div>
                    <div class="text-xs text-gray-500">this month</div>
                  </div>
                </template>
              </Column>

              <Column field="signUpDate" header="Sign Up" sortable>
                <template #body="{ data }">
                  <div class="text-sm text-gray-600">{{ formatDate(data.signUpDate) }}</div>
                </template>
              </Column>

              <!-- Expanded Row Template -->
              <template #expansion="{ data }">
                <div class="p-4 bg-gray-50">
                  <div v-if="loadingDetails[data.id]" class="flex justify-center py-8">
                    <ProgressSpinner style="width: 50px; height: 50px" />
                  </div>

                  <div v-else-if="getDetails(data.id)" class="space-y-6">
                    <!-- Current Month Summary -->
                    <div>
                      <h4 class="font-semibold text-gray-900 mb-3">Current Month Summary</h4>
                      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                        <div class="bg-white p-3 rounded-lg border">
                          <div class="text-lg font-bold text-violet-600">
                            {{ getDetails(data.id)?.currentMonth.calls.total }}
                          </div>
                          <div class="text-xs text-gray-500">Total Calls</div>
                        </div>
                        <div class="bg-white p-3 rounded-lg border">
                          <div class="text-lg font-bold text-green-600">
                            {{ getDetails(data.id)?.currentMonth.calls.completed }}
                          </div>
                          <div class="text-xs text-gray-500">Completed</div>
                        </div>
                        <div class="bg-white p-3 rounded-lg border">
                          <div class="text-lg font-bold text-red-600">
                            {{ getDetails(data.id)?.currentMonth.calls.missed }}
                          </div>
                          <div class="text-xs text-gray-500">Missed</div>
                        </div>
                        <div class="bg-white p-3 rounded-lg border">
                          <div class="text-lg font-bold text-cyan-600">
                            {{ formatDuration(getDetails(data.id)?.currentMonth.calls.totalMinutes || 0) }}
                          </div>
                          <div class="text-xs text-gray-500">Minutes Used</div>
                        </div>
                        <div class="bg-white p-3 rounded-lg border">
                          <div class="text-lg font-bold text-orange-600">
                            {{ getDetails(data.id)?.currentMonth.appointments.total }}
                          </div>
                          <div class="text-xs text-gray-500">Appointments</div>
                        </div>
                        <div class="bg-white p-3 rounded-lg border">
                          <div class="text-lg font-bold text-green-600">
                            {{ getDetails(data.id)?.currentMonth.appointments.completed }}
                          </div>
                          <div class="text-xs text-gray-500">Completed</div>
                        </div>
                        <div class="bg-white p-3 rounded-lg border">
                          <div class="text-lg font-bold text-yellow-600">
                            {{ getDetails(data.id)?.currentMonth.appointments.cancelled }}
                          </div>
                          <div class="text-xs text-gray-500">Cancelled</div>
                        </div>
                        <div class="bg-white p-3 rounded-lg border">
                          <div class="text-lg font-bold text-blue-600">
                            {{ getDetails(data.id)?.currentMonth.appointments.upcoming }}
                          </div>
                          <div class="text-xs text-gray-500">Upcoming</div>
                        </div>
                      </div>
                    </div>

                    <!-- 6-Month Trend -->
                    <div>
                      <h4 class="font-semibold text-gray-900 mb-3">6-Month Trend</h4>
                      <div class="overflow-x-auto">
                        <table class="min-w-full bg-white rounded-lg border">
                          <thead class="bg-gray-100">
                            <tr>
                              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Month</th>
                              <th class="px-4 py-2 text-center text-xs font-medium text-gray-500">Calls</th>
                              <th class="px-4 py-2 text-center text-xs font-medium text-gray-500">Minutes</th>
                              <th class="px-4 py-2 text-center text-xs font-medium text-gray-500">Appointments</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="trend in getDetails(data.id)?.monthlyTrend || []"
                              :key="trend.month"
                              class="border-t"
                            >
                              <td class="px-4 py-2 text-sm font-medium text-gray-900">{{ trend.month }}</td>
                              <td class="px-4 py-2 text-sm text-center text-violet-600">{{ trend.calls }}</td>
                              <td class="px-4 py-2 text-sm text-center text-cyan-600">{{ formatDuration(trend.minutes) }}</td>
                              <td class="px-4 py-2 text-sm text-center text-orange-600">{{ trend.appointments }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <!-- Recent Activity Grid -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <!-- Recent Calls -->
                      <div>
                        <h4 class="font-semibold text-gray-900 mb-3">Recent Calls</h4>
                        <div class="bg-white rounded-lg border overflow-hidden">
                          <table class="min-w-full">
                            <thead class="bg-gray-100">
                              <tr>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Direction</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Duration</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                v-for="call in getDetails(data.id)?.recentCalls || []"
                                :key="call.id"
                                class="border-t"
                              >
                                <td class="px-3 py-2">
                                  <span :class="call.direction === 'inbound' ? 'text-green-600' : 'text-blue-600'">
                                    <i :class="call.direction === 'inbound' ? 'pi pi-phone' : 'pi pi-phone'"></i>
                                    {{ call.direction }}
                                  </span>
                                </td>
                                <td class="px-3 py-2">
                                  <Tag
                                    :value="call.status"
                                    :severity="getCallStatusSeverity(call.status)"
                                    class="text-xs"
                                  />
                                </td>
                                <td class="px-3 py-2 text-sm text-gray-600">{{ formatSeconds(call.duration) }}</td>
                                <td class="px-3 py-2 text-sm text-gray-500">{{ formatDate(call.date) }}</td>
                              </tr>
                              <tr v-if="(getDetails(data.id)?.recentCalls || []).length === 0">
                                <td colspan="4" class="px-3 py-4 text-center text-gray-500 text-sm">
                                  No recent calls
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <!-- Recent Appointments -->
                      <div>
                        <h4 class="font-semibold text-gray-900 mb-3">Recent Appointments</h4>
                        <div class="bg-white rounded-lg border overflow-hidden">
                          <table class="min-w-full">
                            <thead class="bg-gray-100">
                              <tr>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Customer</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                v-for="apt in getDetails(data.id)?.recentAppointments || []"
                                :key="apt.id"
                                class="border-t"
                              >
                                <td class="px-3 py-2 text-sm font-medium text-gray-900">{{ apt.customerName }}</td>
                                <td class="px-3 py-2">
                                  <Tag
                                    :value="apt.status.replace('_', ' ')"
                                    :severity="getAppointmentStatusSeverity(apt.status)"
                                    class="text-xs"
                                  />
                                </td>
                                <td class="px-3 py-2 text-sm text-gray-600">${{ apt.totalPrice }}</td>
                                <td class="px-3 py-2 text-sm text-gray-500">{{ formatDate(apt.date) }}</td>
                              </tr>
                              <tr v-if="(getDetails(data.id)?.recentAppointments || []).length === 0">
                                <td colspan="4" class="px-3 py-4 text-center text-gray-500 text-sm">
                                  No recent appointments
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-else class="text-center py-8 text-gray-500">
                    Failed to load details
                  </div>
                </div>
              </template>

              <template #empty>
                <div class="text-center py-8 text-gray-500">
                  <i class="pi pi-users text-4xl mb-3"></i>
                  <p>No clients found</p>
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
