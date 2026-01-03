<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import api from '@/services/api'

interface CallLog {
  id: string
  phoneNumber: string
  callerName: string
  date: Date
  duration: number // in seconds
  outcome: 'appointment_booked' | 'inquiry' | 'voicemail' | 'transferred' | 'missed'
  notes: string
  // ElevenLabs enrichment
  elevenLabsConversationId?: string
  elevenLabsData?: {
    conversationId: string
    agentId: string
    status: string
    callSuccessful?: string
    callDurationSecs?: number
    messageCount?: number
    transcriptSummary?: string
    userSatisfactionRating?: number
    endReason?: string
  }
}

interface AppointmentStat {
  period: string
  booked: number
  completed: number
  cancelled: number
  noShow: number
}

const loading = ref(false)

// Date range filter
const dateRange = ref<Date[] | null>(null)
const periodFilter = ref('last30days')

const periodOptions = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 days', value: 'last7days' },
  { label: 'Last 30 days', value: 'last30days' },
  { label: 'Last 90 days', value: 'last90days' },
  { label: 'This month', value: 'thisMonth' },
  { label: 'Last month', value: 'lastMonth' },
  { label: 'Custom range', value: 'custom' }
]

// Overview stats - will be calculated from call logs
const overviewStats = ref({
  totalCalls: 0,
  avgCallDuration: 0, // seconds
  appointmentsBooked: 0,
  conversionRate: 0
})

// Call logs - fetched from API
const callLogs = ref<CallLog[]>([])

// Appointment statistics by period - will be fetched from API
const appointmentStats = ref<AppointmentStat[]>([])

// Top services - will be calculated
const topServices = ref<{ name: string; count: number; revenue: number }[]>([])

function formatDuration(seconds: number): string {
  if (seconds === 0) return '-'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

function formatPrice(price: number): string {
  return `$${price.toLocaleString()}`
}

function getOutcomeColor(outcome: string): string {
  const colors: Record<string, string> = {
    appointment_booked: 'bg-green-100 text-green-700',
    inquiry: 'bg-blue-100 text-blue-700',
    voicemail: 'bg-yellow-100 text-yellow-700',
    transferred: 'bg-purple-100 text-purple-700',
    missed: 'bg-red-100 text-red-700'
  }
  return colors[outcome] || 'bg-gray-100 text-gray-700'
}

function getOutcomeLabel(outcome: string): string {
  const labels: Record<string, string> = {
    appointment_booked: 'Appointment Booked',
    inquiry: 'Inquiry',
    voicemail: 'Voicemail',
    transferred: 'Transferred',
    missed: 'Missed'
  }
  return labels[outcome] || outcome
}

function exportReport() {
  alert('Report export functionality would be implemented here')
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchCallLogs(),
      fetchAppointmentStats()
    ])
  } catch (err) {
    console.error('Error loading reports:', err)
  } finally {
    loading.value = false
  }
})

// Watch for changes to period filter and refetch data
watch(periodFilter, async () => {
  if (periodFilter.value !== 'custom') {
    loading.value = true
    try {
      await fetchCallLogs()
    } catch (err) {
      console.error('Error refetching call logs:', err)
    } finally {
      loading.value = false
    }
  }
})

// Watch for changes to custom date range
watch(dateRange, async () => {
  if (periodFilter.value === 'custom' && dateRange.value && dateRange.value.length === 2) {
    loading.value = true
    try {
      await fetchCallLogs()
    } catch (err) {
      console.error('Error refetching call logs:', err)
    } finally {
      loading.value = false
    }
  }
})

async function fetchCallLogs() {
  try {
    // Build query parameters based on date filter
    const params = new URLSearchParams()
    
    // Calculate date range based on periodFilter
    let startDate: Date | null = null
    let endDate: Date | null = null
    
    const now = new Date()
    
    switch (periodFilter.value) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
        break
      case 'last7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'last30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'last90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
        break
      case 'custom':
        if (dateRange.value && dateRange.value.length === 2) {
          startDate = dateRange.value[0]
          endDate = dateRange.value[1]
        }
        break
    }
    
    if (startDate) {
      params.append('startDate', startDate.toISOString())
    }
    if (endDate) {
      params.append('endDate', endDate.toISOString())
    }
    
    params.append('includeElevenLabsData', 'true')
    
    const response = await api.get(`/api/telephony/call-logs?${params.toString()}`)
    if (response.data.success && response.data.data) {
      // The response now contains { logs: [], total: number, limit: number, offset: number }
      const logs = response.data.data.logs || []
      callLogs.value = logs.map((log: any) => ({
        id: log.id,
        phoneNumber: log.fromNumber || log.toNumber || 'Unknown',
        callerName: log.callerName || 'Unknown',
        date: new Date(log.createdAt),
        duration: typeof log.duration === 'string' ? parseInt(log.duration, 10) : (log.duration || (log.elevenLabsData?.callDurationSecs ? (typeof log.elevenLabsData.callDurationSecs === 'string' ? parseInt(log.elevenLabsData.callDurationSecs, 10) : log.elevenLabsData.callDurationSecs) : 0)),
        outcome: mapCallStatus(log.status, log.elevenLabsData),
        notes: log.elevenLabsData?.transcriptSummary || log.notes || '',
        elevenLabsConversationId: log.elevenLabsConversationId,
        elevenLabsData: log.elevenLabsData
      }))
      
      // Calculate overview stats from call logs
      calculateOverviewStats()
    }
  } catch (err) {
    console.error('Error fetching call logs:', err)
  }
}

async function fetchAppointmentStats() {
  try {
    const response = await api.get('/api/appointments')
    if (response.data.success && response.data.data) {
      calculateAppointmentStats(response.data.data)
      calculateTopServices(response.data.data)
    }
  } catch (err) {
    console.error('Error fetching appointment stats:', err)
  }
}

function mapCallStatus(status: string, elevenLabsData?: any): CallLog['outcome'] {
  // If we have ElevenLabs data, use more nuanced logic
  if (elevenLabsData) {
    // Check end reason for more accurate outcome determination
    const endReason = elevenLabsData.endReason?.toLowerCase() || '';
    
    // If call was successful and ended normally, consider it an inquiry or potentially booked
    if (elevenLabsData.callSuccessful === 'success') {
      // Check for appointment-related keywords in transcript summary
      const summary = (elevenLabsData.transcriptSummary || '').toLowerCase();
      if (summary.includes('booked') || summary.includes('appointment') || summary.includes('scheduled')) {
        return 'appointment_booked'
      }
      // Default to inquiry for successful calls
      return 'inquiry'
    }
    
    // Handle specific end reasons
    if (endReason.includes('voicemail')) {
      return 'voicemail'
    } else if (endReason.includes('transfer')) {
      return 'transferred'
    } else if (elevenLabsData.callSuccessful === 'failure') {
      // Could be missed, but if there were messages exchanged, it's an inquiry
      if (elevenLabsData.messageCount > 1) {
        return 'inquiry'
      }
      return 'missed'
    }
  }
  
  // Fall back to Twilio status mapping
  const statusMap: Record<string, CallLog['outcome']> = {
    'completed': 'inquiry', // Changed from appointment_booked - need more info to determine
    'in-progress': 'inquiry',
    'busy': 'missed',
    'no-answer': 'missed',
    'failed': 'missed',
    'voicemail': 'voicemail'
  }
  return statusMap[status] || 'inquiry'
}

function calculateOverviewStats() {
  const logs = callLogs.value
  overviewStats.value.totalCalls = logs.length
  
  if (logs.length > 0) {
    const totalDuration = logs.reduce((sum, log) => sum + log.duration, 0)
    overviewStats.value.avgCallDuration = Math.round(totalDuration / logs.length)
    
    overviewStats.value.appointmentsBooked = logs.filter(log => log.outcome === 'appointment_booked').length
    overviewStats.value.conversionRate = parseFloat(((overviewStats.value.appointmentsBooked / logs.length) * 100).toFixed(1))
  }
}

function calculateAppointmentStats(appointments: any[]) {
  // Group by week
  const weeklyStats: Record<string, { booked: number; completed: number; cancelled: number; noShow: number }> = {}
  
  appointments.forEach(apt => {
    const date = new Date(apt.startTime)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const weekKey = weekStart.toISOString().split('T')[0]!
    
    if (!weeklyStats[weekKey]) {
      weeklyStats[weekKey] = { booked: 0, completed: 0, cancelled: 0, noShow: 0 }
    }
    
    weeklyStats[weekKey]!.booked++
    if (apt.status === 'completed') weeklyStats[weekKey]!.completed++
    if (apt.status === 'cancelled') weeklyStats[weekKey]!.cancelled++
    if (apt.status === 'no-show') weeklyStats[weekKey]!.noShow++
  })
  
  appointmentStats.value = Object.entries(weeklyStats)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-4) // Last 4 weeks
    .map(([, stats], index) => ({
      period: `Week ${index + 1}`,
      ...stats
    }))
}

function calculateTopServices(appointments: any[]) {
  const serviceCounts: Record<string, { count: number; revenue: number }> = {}
  
  appointments.forEach(apt => {
    const serviceName = apt.service?.name || 'Unknown'
    if (!serviceCounts[serviceName]) {
      serviceCounts[serviceName] = { count: 0, revenue: 0 }
    }
    serviceCounts[serviceName].count++
    serviceCounts[serviceName].revenue += apt.service?.price || 0
  })
  
  topServices.value = Object.entries(serviceCounts)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5) // Top 5
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Reports</h1>
        <p class="text-gray-600 mt-1">View call logs, statistics, and appointment analytics</p>
      </div>
      <div class="mt-4 sm:mt-0 flex gap-2">
        <Dropdown
          v-model="periodFilter"
          :options="periodOptions"
          optionLabel="label"
          optionValue="value"
          class="w-40"
        />
        <Button
          label="Export"
          icon="pi pi-download"
          outlined
          @click="exportReport"
        />
      </div>
    </div>

    <!-- Custom Date Range (shown when custom is selected) -->
    <Card v-if="periodFilter === 'custom'" class="mb-6 shadow-sm">
      <template #content>
        <div class="flex items-center gap-4">
          <label class="text-sm font-medium text-gray-700">Date Range:</label>
          <Calendar
            v-model="dateRange"
            selectionMode="range"
            dateFormat="mm/dd/yy"
            placeholder="Select date range"
            class="w-64"
          />
        </div>
      </template>
    </Card>

    <!-- Overview Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card class="shadow-sm">
        <template #content>
          <div class="text-center">
            <p class="text-3xl font-bold text-violet-600">{{ overviewStats.totalCalls }}</p>
            <p class="text-sm text-gray-500">Total Calls</p>
          </div>
        </template>
      </Card>
      <Card class="shadow-sm">
        <template #content>
          <div class="text-center">
            <p class="text-3xl font-bold text-cyan-600">{{ formatDuration(overviewStats.avgCallDuration) }}</p>
            <p class="text-sm text-gray-500">Avg Duration</p>
          </div>
        </template>
      </Card>
      <Card class="shadow-sm">
        <template #content>
          <div class="text-center">
            <p class="text-3xl font-bold text-green-600">{{ overviewStats.appointmentsBooked }}</p>
            <p class="text-sm text-gray-500">Appointments</p>
          </div>
        </template>
      </Card>
      <Card class="shadow-sm">
        <template #content>
          <div class="text-center">
            <p class="text-3xl font-bold text-blue-600">{{ overviewStats.conversionRate }}%</p>
            <p class="text-sm text-gray-500">Conversion Rate</p>
          </div>
        </template>
      </Card>
    </div>

    <TabView>
      <!-- Call Logs Tab -->
      <TabPanel value="0" header="Call Logs">
        <Card class="shadow-sm">
          <template #content>
            <DataTable
              :value="callLogs"
              :loading="loading"
              paginator
              :rows="10"
              :rowsPerPageOptions="[5, 10, 20]"
              responsiveLayout="scroll"
              class="p-datatable-sm"
              sortField="date"
              :sortOrder="-1"
            >
              <template #empty>
                <div class="text-center py-8 text-gray-500">
                  No call logs found
                </div>
              </template>

              <Column field="date" header="Date/Time" sortable>
                <template #body="{ data }">
                  <span>{{ formatDate(data.date) }}</span>
                </template>
              </Column>

              <Column field="phoneNumber" header="Caller" sortable>
                <template #body="{ data }">
                  <span>{{ data.phoneNumber }}</span>
                </template>
              </Column>

              <Column field="duration" header="Duration" sortable>
                <template #body="{ data }">
                  <span>{{ formatDuration(data.duration) }}</span>
                </template>
              </Column>

              <Column field="outcome" header="Outcome" sortable>
                <template #body="{ data }">
                  <span :class="['px-2 py-1 rounded-full text-xs font-medium', getOutcomeColor(data.outcome)]">
                    {{ getOutcomeLabel(data.outcome) }}
                  </span>
                </template>
              </Column>

              <Column field="notes" header="AI Summary" style="max-width: 300px">
                <template #body="{ data }">
                  <div class="text-gray-500 text-sm">
                    <span v-if="data.notes">{{ data.notes }}</span>
                    <span v-else class="text-gray-400">-</span>
                  </div>
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>
      </TabPanel>

      <!-- Appointment Analytics Tab -->
      <TabPanel value="1" header="Appointment Analytics">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Weekly Statistics -->
          <Card class="shadow-sm">
            <template #title>Weekly Appointment Statistics</template>
            <template #content>
              <DataTable
                :value="appointmentStats"
                responsiveLayout="scroll"
                class="p-datatable-sm"
              >
                <Column field="period" header="Period" />
                <Column field="booked" header="Booked">
                  <template #body="{ data }">
                    <span class="font-medium text-blue-600">{{ data.booked }}</span>
                  </template>
                </Column>
                <Column field="completed" header="Completed">
                  <template #body="{ data }">
                    <span class="font-medium text-green-600">{{ data.completed }}</span>
                  </template>
                </Column>
                <Column field="cancelled" header="Cancelled">
                  <template #body="{ data }">
                    <span class="font-medium text-red-600">{{ data.cancelled }}</span>
                  </template>
                </Column>
                <Column field="noShow" header="No Show">
                  <template #body="{ data }">
                    <span class="font-medium text-orange-600">{{ data.noShow }}</span>
                  </template>
                </Column>
              </DataTable>
            </template>
          </Card>

          <!-- Top Services -->
          <Card class="shadow-sm">
            <template #title>Top Services</template>
            <template #content>
              <div class="space-y-4">
                <div
                  v-for="(service, index) in topServices"
                  :key="service.name"
                  class="flex items-center justify-between"
                >
                  <div class="flex items-center">
                    <span class="w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-sm font-medium mr-3">
                      {{ index + 1 }}
                    </span>
                    <div>
                      <p class="font-medium text-gray-900">{{ service.name }}</p>
                      <p class="text-sm text-gray-500">{{ service.count }} bookings</p>
                    </div>
                  </div>
                  <span class="font-medium text-green-600">{{ formatPrice(service.revenue) }}</span>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card class="shadow-sm">
            <template #content>
              <div class="text-center">
                <p class="text-3xl font-bold text-blue-600">
                  {{ appointmentStats.reduce((sum, s) => sum + s.booked, 0) }}
                </p>
                <p class="text-sm text-gray-500">Total Booked</p>
              </div>
            </template>
          </Card>
          <Card class="shadow-sm">
            <template #content>
              <div class="text-center">
                <p class="text-3xl font-bold text-green-600">
                  {{ appointmentStats.reduce((sum, s) => sum + s.completed, 0) }}
                </p>
                <p class="text-sm text-gray-500">Completed</p>
              </div>
            </template>
          </Card>
          <Card class="shadow-sm">
            <template #content>
              <div class="text-center">
                <p class="text-3xl font-bold text-red-600">
                  {{ appointmentStats.reduce((sum, s) => sum + s.cancelled, 0) }}
                </p>
                <p class="text-sm text-gray-500">Cancelled</p>
              </div>
            </template>
          </Card>
          <Card class="shadow-sm">
            <template #content>
              <div class="text-center">
                <p class="text-3xl font-bold text-orange-600">
                  {{ appointmentStats.reduce((sum, s) => sum + s.noShow, 0) }}
                </p>
                <p class="text-sm text-gray-500">No Shows</p>
              </div>
            </template>
          </Card>
        </div>
      </TabPanel>
    </TabView>
  </div>
</template>
