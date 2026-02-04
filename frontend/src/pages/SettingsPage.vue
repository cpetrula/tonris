<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import InputSwitch from 'primevue/inputswitch'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Message from 'primevue/message'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordionpanel'
import Password from 'primevue/password'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import { useTenantStore } from '@/stores/tenant'
import { useVoiceStore } from '@/stores/voice'
import { useIntegrationStore, type VagaroLocation } from '@/stores/integrations'

const toast = useToast()
const router = useRouter()
const tenantStore = useTenantStore()
const voiceStore = useVoiceStore()
const integrationStore = useIntegrationStore()

const loading = ref(false)
const saving = ref(false)
const successMessage = ref('')
const testingVoice = ref(false)

// Business profile
const businessProfile = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  website: '',
  description: ''
})

// Business hours
const businessHours = ref({
  monday: { open: '9:00 AM', close: '6:00 PM', closed: false },
  tuesday: { open: '9:00 AM', close: '6:00 PM', closed: false },
  wednesday: { open: '9:00 AM', close: '6:00 PM', closed: false },
  thursday: { open: '9:00 AM', close: '6:00 PM', closed: false },
  friday: { open: '9:00 AM', close: '6:00 PM', closed: false },
  saturday: { open: '10:00 AM', close: '4:00 PM', closed: false },
  sunday: { open: '', close: '', closed: true }
})

// Helper function to convert 24h time to 12h format with AM/PM
function convert24hTo12h(time: string): string {
  if (!time) return ''
  const parts = time.split(':')
  if (parts.length < 2 || !parts[0] || !parts[1]) {
    console.warn('Invalid time format:', time)
    return ''
  }
  const hours = parts[0]
  const minutes = parts[1]
  const hour = parseInt(hours, 10)
  
  // Validate that hour is a valid number
  if (isNaN(hour) || hour < 0 || hour > 23) {
    console.warn('Invalid hour value:', hours)
    return ''
  }
  
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

// Helper function to convert 12h format to 24h format
function convert12hTo24h(time: string): string {
  if (!time) return ''
  const match = time.match(/^(\d+):(\d+)\s*(AM|PM)$/i)
  if (!match) {
    console.warn('Invalid 12h time format:', time)
    return ''
  }
  
  const hourStr = match[1]
  const minutes = match[2]
  const ampm = match[3]?.toUpperCase()
  
  if (!hourStr || !ampm) return ''
  
  let hours = parseInt(hourStr, 10)
  
  // Validate that hours is a valid number
  if (isNaN(hours) || hours < 1 || hours > 12) {
    console.warn('Invalid hour value:', hourStr)
    return ''
  }
  
  if (ampm === 'PM' && hours !== 12) hours += 12
  if (ampm === 'AM' && hours === 12) hours = 0
  
  return `${hours.toString().padStart(2, '0')}:${minutes}`
}

// AI Voice Settings
const aiSettings = ref({
  voiceId: '' as string,
  greeting: 'Thank you for calling Sample Salon. How can I help you today?',
  appointmentReminders: true,
  reminderHours: 24,
  followUpCalls: true,
  followUpText: true
})

// Notification preferences (matches backend NotificationSettings)
const notifications = ref({
  emailNewAppointment: true,
  emailCancellation: true,
  emailDailyDigest: true,
  smsNewAppointment: true,
  smsCancellation: true,
  smsReminderEnabled: true,
  smsReminderHours: 24
})

// Vagaro Integration
const vagaroSyncSettings = ref({
  syncAppointments: true,
  syncCustomers: true,
  syncEmployees: false
})
const vagaroSetupLoading = ref(false)
const vagaroTestLoading = ref(false)
const vagaroImportLoading = ref(false)
const copySuccess = ref(false)

// Vagaro API credentials
const vagaroCredentials = ref({
  clientId: '',
  clientSecretKey: '',
  region: 'us02',
  businessId: '',
  businessName: ''
})

// Vagaro regions
const vagaroRegions = [
  { label: 'US East (us02)', value: 'us02' },
  { label: 'US West (us04)', value: 'us04' }
]

// Test connection result
const testConnectionResult = ref<{ success: boolean; message: string } | null>(null)

// Computed property for Vagaro integration status
const vagaroIntegration = computed(() => integrationStore.currentIntegration)
const vagaroWebhookUrl = computed(() => integrationStore.webhookUrl)
const vagaroLocations = computed(() => integrationStore.vagaroLocations)
const isVagaroConnected = computed(() => 
  vagaroIntegration.value && 
  (vagaroIntegration.value.status === 'active' || vagaroIntegration.value.status === 'pending')
)
const hasVagaroCredentials = computed(() => 
  vagaroIntegration.value?.config?.clientId && 
  vagaroIntegration.value?.config?.clientSecretKey &&
  vagaroIntegration.value?.config?.businessId
)

const timeSlots = [
  '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM',
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM',
  '9:00 PM', '9:30 PM', '10:00 PM'
]

async function saveBusinessProfile() {
  saving.value = true
  try {
    // Prepare the update data
    const updateData = {
      name: businessProfile.value.name,
      contactEmail: businessProfile.value.email,
      contactPhone: businessProfile.value.phone,
      address: {
        street: businessProfile.value.address,
        city: businessProfile.value.city,
        state: businessProfile.value.state,
        // Send both 'zip' and 'zipCode' for backward compatibility with existing data
        // This ensures data can be read by both old and new code versions
        zip: businessProfile.value.zipCode,
        zipCode: businessProfile.value.zipCode
      },
      metadata: {
        website: businessProfile.value.website,
        description: businessProfile.value.description
      }
    }

    // Call the backend API
    await tenantStore.updateTenant(updateData)
    
    toast.add({ severity: 'success', summary: 'Success', detail: 'Business profile saved', life: 3000 })
  } catch (error) {
    console.error('Failed to save business profile:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save profile', life: 3000 })
  } finally {
    saving.value = false
  }
}

async function saveBusinessHours() {
  saving.value = true
  try {
    // Convert business hours to backend format (24h time, enabled flag)
    const backendHours: Record<string, { open: string; close: string; enabled: boolean }> = {}
    
    for (const [day, hours] of Object.entries(businessHours.value)) {
      backendHours[day] = {
        open: convert12hTo24h(hours.open),
        close: convert12hTo24h(hours.close),
        enabled: !hours.closed
      }
    }

    // Call the dedicated business hours endpoint
    await tenantStore.updateBusinessHours(backendHours)
    
    toast.add({ severity: 'success', summary: 'Success', detail: 'Business hours saved', life: 3000 })
  } catch (error) {
    console.error('Failed to save business hours:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save hours', life: 3000 })
  } finally {
    saving.value = false
  }
}

async function saveAISettings() {
  saving.value = true
  try {
    // Save the greeting message to the backend
    await tenantStore.updateTenant({ firstMessage: aiSettings.value.greeting })
    // Save voiceId to tenant
    await tenantStore.updateTenant({ voiceId: aiSettings.value.voiceId })
    toast.add({ severity: 'success', summary: 'Success', detail: 'AI settings saved', life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save settings', life: 3000 })
  } finally {
    saving.value = false
  }
}

async function saveNotifications() {
  saving.value = true
  try {
    await tenantStore.updateNotificationSettings(notifications.value)
    toast.add({ severity: 'success', summary: 'Success', detail: 'Notification preferences saved', life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save preferences', life: 3000 })
  } finally {
    saving.value = false
  }
}

// Vagaro Integration Functions
async function setupVagaroIntegration() {
  vagaroSetupLoading.value = true
  try {
    const success = await integrationStore.setupVagaroIntegration({}, vagaroSyncSettings.value)
    if (success) {
      toast.add({ severity: 'success', summary: 'Success', detail: 'Vagaro integration created! Copy the webhook URL and add it to Vagaro.', life: 5000 })
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: integrationStore.error || 'Failed to setup integration', life: 3000 })
    }
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to setup integration', life: 3000 })
  } finally {
    vagaroSetupLoading.value = false
  }
}

async function updateVagaroSyncSettings() {
  vagaroSetupLoading.value = true
  try {
    const success = await integrationStore.updateIntegration('vagaro', { syncSettings: vagaroSyncSettings.value })
    if (success) {
      toast.add({ severity: 'success', summary: 'Success', detail: 'Sync settings updated', life: 3000 })
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: integrationStore.error || 'Failed to update settings', life: 3000 })
    }
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update settings', life: 3000 })
  } finally {
    vagaroSetupLoading.value = false
  }
}

async function regenerateVagaroToken() {
  if (!confirm('Are you sure? You will need to update the webhook URL in Vagaro.')) {
    return
  }
  vagaroSetupLoading.value = true
  try {
    const success = await integrationStore.regenerateToken('vagaro')
    if (success) {
      toast.add({ severity: 'success', summary: 'Success', detail: 'New webhook URL generated. Update it in Vagaro.', life: 5000 })
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: integrationStore.error || 'Failed to regenerate token', life: 3000 })
    }
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to regenerate token', life: 3000 })
  } finally {
    vagaroSetupLoading.value = false
  }
}

async function disconnectVagaro() {
  if (!confirm('Are you sure you want to disconnect Vagaro? You will stop receiving updates from Vagaro.')) {
    return
  }
  vagaroSetupLoading.value = true
  try {
    const success = await integrationStore.deleteIntegration('vagaro')
    if (success) {
      toast.add({ severity: 'success', summary: 'Success', detail: 'Vagaro disconnected', life: 3000 })
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: integrationStore.error || 'Failed to disconnect', life: 3000 })
    }
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to disconnect', life: 3000 })
  } finally {
    vagaroSetupLoading.value = false
  }
}

function copyWebhookUrl() {
  if (vagaroWebhookUrl.value) {
    navigator.clipboard.writeText(vagaroWebhookUrl.value)
    copySuccess.value = true
    toast.add({ severity: 'success', summary: 'Copied!', detail: 'Webhook URL copied to clipboard', life: 2000 })
    setTimeout(() => { copySuccess.value = false }, 2000)
  }
}

// Test Vagaro API connection
async function testVagaroConnection() {
  if (!vagaroCredentials.value.clientId || !vagaroCredentials.value.clientSecretKey) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Please enter Client ID and Client Secret', life: 3000 })
    return
  }
  
  vagaroTestLoading.value = true
  testConnectionResult.value = null
  
  try {
    const result = await integrationStore.testVagaroConnection({
      clientId: vagaroCredentials.value.clientId,
      clientSecretKey: vagaroCredentials.value.clientSecretKey,
      region: vagaroCredentials.value.region
    })
    
    testConnectionResult.value = { success: result.success, message: result.message }
    
    if (result.success) {
      toast.add({ severity: 'success', summary: 'Success', detail: result.message, life: 5000 })
      // If there's only one location, auto-select it
      if (result.locations.length === 1) {
        vagaroCredentials.value.businessId = result.locations[0].businessId
        vagaroCredentials.value.businessName = result.locations[0].businessName
      }
    } else {
      toast.add({ severity: 'error', summary: 'Connection Failed', detail: result.message, life: 5000 })
    }
  } catch {
    testConnectionResult.value = { success: false, message: 'Connection test failed' }
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to test connection', life: 3000 })
  } finally {
    vagaroTestLoading.value = false
  }
}

// Save Vagaro credentials
async function saveVagaroCredentials() {
  if (!vagaroCredentials.value.clientId || !vagaroCredentials.value.clientSecretKey || !vagaroCredentials.value.businessId) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Please fill in all required fields and select a business location', life: 3000 })
    return
  }
  
  vagaroSetupLoading.value = true
  try {
    const config = {
      clientId: vagaroCredentials.value.clientId,
      clientSecretKey: vagaroCredentials.value.clientSecretKey,
      region: vagaroCredentials.value.region,
      businessId: vagaroCredentials.value.businessId,
      businessName: vagaroCredentials.value.businessName
    }
    
    const success = await integrationStore.setupVagaroIntegration(config, vagaroSyncSettings.value)
    if (success) {
      toast.add({ severity: 'success', summary: 'Success', detail: 'Vagaro credentials saved successfully', life: 3000 })
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: integrationStore.error || 'Failed to save credentials', life: 3000 })
    }
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save credentials', life: 3000 })
  } finally {
    vagaroSetupLoading.value = false
  }
}

// Select a business location
function selectVagaroLocation(location: { businessId: string; businessName: string }) {
  vagaroCredentials.value.businessId = location.businessId
  vagaroCredentials.value.businessName = location.businessName
}

// Import services from Vagaro
async function importVagaroServices() {
  if (!hasVagaroCredentials.value) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Please save your Vagaro credentials first', life: 3000 })
    return
  }
  
  if (!confirm('This will import services from Vagaro. Existing services with the same name will be updated. Continue?')) {
    return
  }
  
  vagaroImportLoading.value = true
  try {
    const result = await integrationStore.importVagaroServices()
    if (result.success) {
      toast.add({ severity: 'success', summary: 'Import Completed', detail: result.message, life: 5000 })
    } else {
      toast.add({ severity: 'error', summary: 'Import Failed', detail: result.message, life: 5000 })
    }
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to import services', life: 3000 })
  } finally {
    vagaroImportLoading.value = false
  }
}

// Import staff from Vagaro
async function importVagaroStaff() {
  if (!hasVagaroCredentials.value) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Please save your Vagaro credentials first', life: 3000 })
    return
  }
  
  if (!confirm('This will import staff/employees from Vagaro. Existing staff with the same email will be updated. Continue?')) {
    return
  }
  
  vagaroImportLoading.value = true
  try {
    const result = await integrationStore.importVagaroStaff()
    if (result.success) {
      toast.add({ severity: 'success', summary: 'Import Completed', detail: result.message, life: 5000 })
    } else {
      toast.add({ severity: 'error', summary: 'Import Failed', detail: result.message, life: 5000 })
    }
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to import staff', life: 3000 })
  } finally {
    vagaroImportLoading.value = false
  }
}

async function testGreetingMessage() {
  if (!aiSettings.value.voiceId) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a voice first', life: 3000 })
    return
  }

  if (!aiSettings.value.greeting || aiSettings.value.greeting.trim() === '') {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Please enter a greeting message', life: 3000 })
    return
  }

  testingVoice.value = true
  let audioUrl: string | null = null
  
  try {
    const audioBlob = await voiceStore.testVoice(aiSettings.value.voiceId, aiSettings.value.greeting)
    
    // Create audio element and play
    audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)
    
    audio.onended = () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
    
    audio.onerror = () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to play audio', life: 3000 })
    }
    
    await audio.play()
  } catch (error) {
    console.error('Failed to test voice:', error)
    // Clean up in case of error
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to generate voice preview', life: 3000 })
  } finally {
    testingVoice.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    // Fetch tenant profile
    await tenantStore.fetchTenants()
    const tenant = tenantStore.currentTenant
    
    if (tenant) {
      // Populate business profile from tenant data
      businessProfile.value.name = tenant.name || ''
      businessProfile.value.email = tenant.contactEmail || ''
      businessProfile.value.phone = tenant.contactPhone || ''
      businessProfile.value.address = tenant.address?.street || ''
      businessProfile.value.city = tenant.address?.city || ''
      businessProfile.value.state = tenant.address?.state || ''
      // Handle both 'zip' and 'zipCode' for backward compatibility
      // Prefer 'zipCode' if present, fallback to 'zip' for existing data
      businessProfile.value.zipCode = tenant.address?.zipCode || tenant.address?.zip || ''
      businessProfile.value.website = tenant.metadata?.website || ''
      businessProfile.value.description = tenant.metadata?.description || ''
      
      // Populate AI settings from tenant data
      // If tenant has a custom first message, use it; otherwise use a default with business name
      if (tenant.firstMessage) {
        aiSettings.value.greeting = tenant.firstMessage
      } else if (tenant.name) {
        // Set a default greeting that matches the backend fallback
        aiSettings.value.greeting = `Hi, thanks for calling ${tenant.name}! How can I help you today?`
      }
      // Set voice ID
      aiSettings.value.voiceId = tenant.voiceId || ''
    }

    // Fetch business hours using dedicated endpoint
    const hours = await tenantStore.fetchBusinessHours()
    
    if (hours) {
      // Convert backend format (24h time, enabled flag) to frontend format (12h time, closed flag)
      for (const [day, dayHours] of Object.entries(hours)) {
        if (businessHours.value[day as keyof typeof businessHours.value]) {
          businessHours.value[day as keyof typeof businessHours.value] = {
            open: convert24hTo12h(dayHours.open),
            close: convert24hTo12h(dayHours.close),
            closed: !dayHours.enabled
          }
        }
      }
    }
    
    // Fetch voices
    await voiceStore.fetchVoices()

    // Fetch notification settings
    const notifSettings = await tenantStore.fetchNotificationSettings()
    if (notifSettings) {
      notifications.value = {
        emailNewAppointment: notifSettings.emailNewAppointment ?? true,
        emailCancellation: notifSettings.emailCancellation ?? true,
        emailDailyDigest: notifSettings.emailDailyDigest ?? true,
        smsNewAppointment: notifSettings.smsNewAppointment ?? true,
        smsCancellation: notifSettings.smsCancellation ?? true,
        smsReminderEnabled: notifSettings.smsReminderEnabled ?? true,
        smsReminderHours: notifSettings.smsReminderHours ?? 24
      }
    }

    // Fetch Vagaro integration
    const vagaroInt = await integrationStore.fetchIntegration('vagaro')
    if (vagaroInt?.syncSettings) {
      vagaroSyncSettings.value = {
        syncAppointments: vagaroInt.syncSettings.syncAppointments ?? true,
        syncCustomers: vagaroInt.syncSettings.syncCustomers ?? true,
        syncEmployees: vagaroInt.syncSettings.syncEmployees ?? false
      }
    }
    // Load saved credentials
    if (vagaroInt?.config) {
      vagaroCredentials.value = {
        clientId: (vagaroInt.config.clientId as string) || '',
        clientSecretKey: (vagaroInt.config.clientSecretKey as string) || '',
        region: (vagaroInt.config.region as string) || 'us02',
        businessId: (vagaroInt.config.businessId as string) || '',
        businessName: (vagaroInt.config.businessName as string) || ''
      }
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load settings', life: 3000 })
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
      <p class="text-gray-600 mt-1">Manage your business profile and preferences</p>
    </div>

    <Message v-if="successMessage" severity="success" class="mb-6">{{ successMessage }}</Message>

    <!-- Phone Forwarding Link -->
    <Card class="mb-6 cursor-pointer hover:shadow-md transition-shadow" @click="router.push('/app/phone-forwarding')">
      <template #content>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="bg-violet-100 p-3 rounded-lg">
              <i class="pi pi-phone text-xl text-violet-600"></i>
            </div>
            <div>
              <h3 class="font-medium ">Phone Forwarding Setup</h3>
              <p class="text-sm ">View instructions to forward calls to your Criton.AI number</p>
            </div>
          </div>
          <i class="pi pi-chevron-right text-gray-400"></i>
        </div>
      </template>
    </Card>

    <TabView>
      <!-- Business Profile Tab -->
      <TabPanel value="0" header="Business Profile">
        <Card class="shadow-sm">
          <template #content>
            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium  mb-1">Business Name</label>
                  <InputText v-model="businessProfile.name" class="w-full" />
                </div>
                <div>
                  <label class="block text-sm font-medium  mb-1">Email</label>
                  <InputText v-model="businessProfile.email" type="email" class="w-full" />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium  mb-1">Phone Number</label>
                  <InputText v-model="businessProfile.phone" class="w-full" />
                </div>
                <div>
                  <label class="block text-sm font-medium  mb-1">Website</label>
                  <InputText v-model="businessProfile.website" class="w-full" placeholder="https://" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium  mb-1">Street Address</label>
                <InputText v-model="businessProfile.address" class="w-full" />
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="col-span-2">
                  <label class="block text-sm font-medium  mb-1">City</label>
                  <InputText v-model="businessProfile.city" class="w-full" />
                </div>
                <div>
                  <label class="block text-sm font-medium  mb-1">State</label>
                  <InputText v-model="businessProfile.state" class="w-full" />
                </div>
                <div>
                  <label class="block text-sm font-medium  mb-1">ZIP Code</label>
                  <InputText v-model="businessProfile.zipCode" class="w-full" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium  mb-1">Business Description</label>
                <Textarea v-model="businessProfile.description" rows="3" class="w-full" />
              </div>

              <div class="flex justify-end">
                <Button
                  label="Save Changes"
                  icon="pi pi-check"
                  :loading="saving"
                  @click="saveBusinessProfile"
                />
              </div>
            </div>
          </template>
        </Card>
      </TabPanel>

      <!-- Business Hours Tab -->
      <TabPanel value="1" header="Business Hours">
        <Card class="shadow-sm">
          <template #content>
            <div class="space-y-4">
              <div
                v-for="(hours, day) in businessHours"
                :key="day"
                class="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div class="w-24 font-medium text-gray-900 capitalize">{{ day }}</div>
                
                <div class="flex items-center gap-2">
                  <InputSwitch v-model="hours.closed" />
                  <span class="text-sm text-gray-600">{{ hours.closed ? 'Closed' : 'Open' }}</span>
                </div>

                <div v-if="!hours.closed" class="flex items-center gap-2 flex-1">
                  <Select
                    v-model="hours.open"
                    :options="timeSlots"
                    placeholder="Open"
                    class="w-32"
                  />
                  <span class="text-gray-500">to</span>
                  <Select
                    v-model="hours.close"
                    :options="timeSlots"
                    placeholder="Close"
                    class="w-32"
                  />
                </div>
              </div>

              <div class="flex justify-end pt-4">
                <Button
                  label="Save Hours"
                  icon="pi pi-check"
                  :loading="saving"
                  @click="saveBusinessHours"
                />
              </div>
            </div>
          </template>
        </Card>
      </TabPanel>

      <!-- AI Voice Settings Tab -->
      <TabPanel value="2" header="AI Voice Settings">
        <Card class="shadow-sm">
          <template #content>
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium  mb-1">Voice Type</label>
                <Select
                  v-model="aiSettings.voiceId"
                  :options="voiceStore.voices"
                  optionLabel="label"
                  optionValue="id"
                  placeholder="Select a voice"
                  :loading="voiceStore.loading"
                  :disabled="voiceStore.voices.length === 0"
                  class="w-full"
                />
                <p v-if="voiceStore.voices.length === 0 && !voiceStore.loading" class="text-sm text-red-500 mt-1">
                  No voices available. Please contact support.
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium  mb-1">Greeting Message</label>
                <Textarea v-model="aiSettings.greeting" rows="2" class="w-full" />
                <p class="text-sm mt-1">This message will be used to greet callers</p>
                <div class="mt-2">
                  <Button
                    label="Test Voice"
                    icon="pi pi-play"
                    severity="secondary"
                    outlined
                    :loading="testingVoice"
                    :disabled="!aiSettings.voiceId || !aiSettings.greeting"
                    :aria-label="'Test how the greeting message sounds with the selected voice'"
                    @click="testGreetingMessage"
                  />
                </div>
              </div>

              <div class="flex justify-end pt-4">
                <Button
                  label="Save AI Settings"
                  icon="pi pi-check"
                  :loading="saving"
                  @click="saveAISettings"
                />
              </div>
            </div>
          </template>
        </Card>
      </TabPanel>

      <!-- Notifications Tab -->
      <TabPanel value="3" header="Notifications">
        <Card class="shadow-sm">
          <template #content>
            <div class="space-y-6">
              <div>
                <h3 class="font-medium text-gray-900 mb-4">Business Owner Notifications</h3>
                <p class="text-sm text-gray-500 mb-4">Choose how you want to be notified about new bookings and cancellations.</p>

                <!-- New Appointment Notifications -->
                <div class="mb-6">
                  <h4 class="text-sm font-medium text-gray-700 mb-3">New Appointment</h4>
                  <div class="space-y-3 ml-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm">Email notification</p>
                      </div>
                      <InputSwitch v-model="notifications.emailNewAppointment" />
                    </div>
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm">SMS notification</p>
                      </div>
                      <InputSwitch v-model="notifications.smsNewAppointment" />
                    </div>
                  </div>
                </div>

                <!-- Cancellation Notifications -->
                <div class="mb-6">
                  <h4 class="text-sm font-medium text-gray-700 mb-3">Appointment Cancelled</h4>
                  <div class="space-y-3 ml-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm">Email notification</p>
                      </div>
                      <InputSwitch v-model="notifications.emailCancellation" />
                    </div>
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm">SMS notification</p>
                      </div>
                      <InputSwitch v-model="notifications.smsCancellation" />
                    </div>
                  </div>
                </div>

                <!-- Daily Digest -->
                <div>
                  <h4 class="text-sm font-medium text-gray-700 mb-3">Daily Summary</h4>
                  <div class="space-y-3 ml-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm">Receive a daily summary email of activity</p>
                      </div>
                      <InputSwitch v-model="notifications.emailDailyDigest" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="border-t border-gray-200 pt-6">
                <h3 class="font-medium text-gray-900 mb-4">Customer Notifications</h3>

                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm">Send SMS reminders to customers before appointments</p>
                    </div>
                    <InputSwitch v-model="notifications.smsReminderEnabled" />
                  </div>

                  <div v-if="notifications.smsReminderEnabled" class="ml-4 pl-4 border-l-2 border-gray-200">
                    <label class="block text-sm font-medium mb-1">Remind customers (hours before)</label>
                    <Select
                      v-model="notifications.smsReminderHours"
                      :options="[12, 24, 48]"
                      class="w-32"
                    />
                  </div>

                  <div class="flex items-center justify-between opacity-50">
                    <div>
                      <p class="text-sm">Text customers after appointments for feedback</p>
                      <p class="text-xs text-gray-500">Coming soon</p>
                    </div>
                    <InputSwitch v-model="aiSettings.followUpText" disabled />
                  </div>
                </div>
              </div>

              <div class="flex justify-end pt-4">
                <Button
                  label="Save Preferences"
                  icon="pi pi-check"
                  :loading="saving"
                  @click="saveNotifications"
                />
              </div>
            </div>
          </template>
        </Card>
      </TabPanel>

      <!-- Integrations Tab -->
      <TabPanel value="4" header="Integrations">
        <Card class="shadow-sm">
          <template #content>
            <div class="space-y-6">
              <div class="mb-4">
                <h3 class="text-lg font-medium text-gray-900">Third-Party Integrations</h3>
                <p class="text-sm text-gray-500">Connect your business tools to sync data automatically</p>
              </div>

              <!-- Integrations Accordion -->
              <Accordion :multiple="true" :activeIndex="[0]">
                <!-- Vagaro Integration -->
                <AccordionPanel value="vagaro">
                  <AccordionHeader>
                    <div class="flex items-center gap-3 w-full">
                      <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <i class="pi pi-link text-xl text-purple-600"></i>
                      </div>
                      <div class="flex-1">
                        <h4 class="font-semibold text-gray-900">Vagaro</h4>
                        <p class="text-xs text-gray-500">Salon, spa & fitness scheduling software</p>
                      </div>
                      <span 
                        v-if="hasVagaroCredentials" 
                        class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
                      >
                        <i class="pi pi-check-circle"></i>
                        Connected
                      </span>
                      <span 
                        v-else-if="isVagaroConnected" 
                        class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"
                      >
                        <i class="pi pi-clock"></i>
                        Setup Required
                      </span>
                      <span v-else class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        <i class="pi pi-times-circle"></i>
                        Not Connected
                      </span>
                    </div>
                  </AccordionHeader>
                  <AccordionContent>
                    <div class="space-y-6 pt-4">
                      <!-- API Credentials Section -->
                      <div class="bg-gray-50 rounded-lg p-4">
                        <h5 class="font-medium text-gray-900 mb-3">
                          <i class="pi pi-key mr-2"></i>
                          API Credentials
                        </h5>
                        <p class="text-sm text-gray-600 mb-4">
                          Enter your Vagaro API credentials. You can find these in Vagaro under 
                          Settings → Developers → APIs & Webhooks.
                        </p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Client ID *</label>
                            <InputText 
                              v-model="vagaroCredentials.clientId" 
                              class="w-full" 
                              placeholder="Your Vagaro Client ID"
                            />
                          </div>
                          <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Client Secret *</label>
                            <Password 
                              v-model="vagaroCredentials.clientSecretKey" 
                              class="w-full" 
                              :feedback="false"
                              toggleMask
                              placeholder="Your Client Secret"
                              inputClass="w-full"
                            />
                          </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Region</label>
                            <Select 
                              v-model="vagaroCredentials.region" 
                              :options="vagaroRegions" 
                              optionLabel="label" 
                              optionValue="value"
                              class="w-full" 
                            />
                          </div>
                          <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Business Location *</label>
                            <div v-if="vagaroCredentials.businessName" class="flex items-center gap-2">
                              <InputText 
                                :modelValue="vagaroCredentials.businessName" 
                                class="w-full" 
                                disabled
                              />
                              <Button 
                                icon="pi pi-times" 
                                severity="secondary" 
                                outlined 
                                size="small"
                                @click="vagaroCredentials.businessId = ''; vagaroCredentials.businessName = ''"
                                v-tooltip="'Clear selection'"
                              />
                            </div>
                            <p v-else class="text-sm text-gray-500 italic">
                              Test connection to see available locations
                            </p>
                          </div>
                        </div>
                        
                        <div class="flex items-center gap-3">
                          <Button 
                            label="Test Connection" 
                            icon="pi pi-bolt"
                            severity="secondary"
                            :loading="vagaroTestLoading"
                            @click="testVagaroConnection"
                          />
                          <Button 
                            label="Save Credentials" 
                            icon="pi pi-save"
                            :loading="vagaroSetupLoading"
                            :disabled="!vagaroCredentials.clientId || !vagaroCredentials.clientSecretKey || !vagaroCredentials.businessId"
                            @click="saveVagaroCredentials"
                          />
                        </div>
                        
                        <!-- Test Result -->
                        <div v-if="testConnectionResult" class="mt-4">
                          <Message 
                            :severity="testConnectionResult.success ? 'success' : 'error'" 
                            :closable="false"
                          >
                            {{ testConnectionResult.message }}
                          </Message>
                        </div>
                        
                        <!-- Location Selection -->
                        <div v-if="vagaroLocations.length > 0 && !vagaroCredentials.businessId" class="mt-4">
                          <h6 class="text-sm font-medium text-gray-700 mb-2">Select a Business Location:</h6>
                          <div class="grid gap-2">
                            <div 
                              v-for="location in vagaroLocations" 
                              :key="location.businessId"
                              class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 cursor-pointer transition-colors"
                              @click="selectVagaroLocation(location)"
                            >
                              <div>
                                <p class="font-medium text-gray-900">{{ location.businessName }}</p>
                                <p class="text-xs text-gray-500">{{ location.city }}, {{ location.regionCode }}</p>
                              </div>
                              <i class="pi pi-chevron-right text-gray-400"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Import Section - Only show when credentials are saved -->
                      <div v-if="hasVagaroCredentials" class="bg-white border border-gray-200 rounded-lg p-4">
                        <h5 class="font-medium text-gray-900 mb-3">
                          <i class="pi pi-download mr-2"></i>
                          Import Data from Vagaro
                        </h5>
                        <p class="text-sm text-gray-600 mb-4">
                          Import your staff and services from Vagaro. This will create or update records in Criton.AI.
                        </p>
                        
                        <div class="flex flex-wrap items-center gap-3">
                          <Button 
                            label="Import Staff" 
                            icon="pi pi-users"
                            severity="secondary"
                            outlined
                            :loading="vagaroImportLoading"
                            @click="importVagaroStaff"
                          />
                          <Button 
                            label="Import Services" 
                            icon="pi pi-list"
                            severity="secondary"
                            outlined
                            :loading="vagaroImportLoading"
                            @click="importVagaroServices"
                          />
                        </div>
                        
                        <!-- Last Import Info -->
                        <div v-if="vagaroIntegration?.metadata" class="mt-4 text-xs text-gray-500 space-y-1">
                          <p v-if="vagaroIntegration.metadata.lastStaffImport">
                            <i class="pi pi-users mr-1"></i>
                            Last staff import: {{ new Date(vagaroIntegration.metadata.lastStaffImport).toLocaleString() }}
                            <span v-if="vagaroIntegration.metadata.staffImportResults" class="ml-2">
                              ({{ vagaroIntegration.metadata.staffImportResults.imported }} new, {{ vagaroIntegration.metadata.staffImportResults.updated }} updated)
                            </span>
                          </p>
                          <p v-if="vagaroIntegration.metadata.lastServicesImport">
                            <i class="pi pi-list mr-1"></i>
                            Last services import: {{ new Date(vagaroIntegration.metadata.lastServicesImport).toLocaleString() }}
                            <span v-if="vagaroIntegration.metadata.servicesImportResults" class="ml-2">
                              ({{ vagaroIntegration.metadata.servicesImportResults.imported }} new, {{ vagaroIntegration.metadata.servicesImportResults.updated }} updated)
                            </span>
                          </p>
                        </div>
                      </div>
                      
                      <!-- Webhook Section -->
                      <div v-if="isVagaroConnected" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 class="font-medium text-blue-900 mb-2">
                          <i class="pi pi-bolt mr-2"></i>
                          Real-time Webhooks (Optional)
                        </h5>
                        <p class="text-sm text-blue-700 mb-3">
                          Set up webhooks to receive real-time updates from Vagaro when appointments change.
                        </p>
                        <div class="flex items-center gap-2 mb-3">
                          <code class="flex-1 bg-white px-3 py-2 rounded border border-blue-200 text-xs font-mono text-gray-800 overflow-x-auto">
                            {{ vagaroWebhookUrl }}
                          </code>
                          <Button 
                            :icon="copySuccess ? 'pi pi-check' : 'pi pi-copy'" 
                            :severity="copySuccess ? 'success' : 'secondary'"
                            outlined
                            size="small"
                            @click="copyWebhookUrl"
                            v-tooltip="'Copy to clipboard'"
                          />
                        </div>
                        <p v-if="vagaroIntegration" class="text-xs text-blue-600">
                          <span v-if="vagaroIntegration.lastWebhookAt">
                            Last webhook: {{ new Date(vagaroIntegration.lastWebhookAt).toLocaleString() }} • 
                          </span>
                          Total received: {{ vagaroIntegration.webhookCount }}
                        </p>
                      </div>
                      
                      <!-- Sync Settings -->
                      <div v-if="isVagaroConnected" class="bg-white border border-gray-200 rounded-lg p-4">
                        <h5 class="font-medium text-gray-900 mb-3">Webhook Sync Settings</h5>
                        <div class="space-y-2">
                          <div class="flex items-center gap-2">
                            <InputSwitch v-model="vagaroSyncSettings.syncAppointments" />
                            <span class="text-sm">Sync appointments</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <InputSwitch v-model="vagaroSyncSettings.syncCustomers" />
                            <span class="text-sm">Sync customers</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <InputSwitch v-model="vagaroSyncSettings.syncEmployees" />
                            <span class="text-sm">Sync employees</span>
                          </div>
                        </div>
                        <div class="mt-3">
                          <Button 
                            label="Save Settings" 
                            size="small"
                            :loading="vagaroSetupLoading"
                            @click="updateVagaroSyncSettings" 
                          />
                        </div>
                      </div>
                      
                      <!-- Error Display -->
                      <div v-if="vagaroIntegration?.lastError" class="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p class="text-sm text-red-700">
                          <i class="pi pi-exclamation-triangle mr-2"></i>
                          {{ vagaroIntegration.lastError }}
                        </p>
                      </div>
                      
                      <!-- Disconnect -->
                      <div v-if="isVagaroConnected" class="pt-4 border-t border-gray-200">
                        <Button 
                          label="Disconnect Vagaro" 
                          icon="pi pi-times"
                          severity="danger"
                          outlined
                          size="small"
                          :loading="vagaroSetupLoading"
                          @click="disconnectVagaro"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionPanel>
              </Accordion>

              <!-- Future Integrations Placeholder -->
              <div class="border-t border-gray-200 pt-6">
                <h3 class="font-medium text-gray-900 mb-4">Coming Soon</h3>
                <div class="grid gap-4 md:grid-cols-2">
                  <div class="bg-gray-50 rounded-lg p-4 opacity-60">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <i class="pi pi-calendar text-gray-500"></i>
                      </div>
                      <div>
                        <h4 class="font-medium text-gray-700">Google Calendar</h4>
                        <p class="text-xs text-gray-500">Sync appointments with Google Calendar</p>
                      </div>
                    </div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-4 opacity-60">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <i class="pi pi-credit-card text-gray-500"></i>
                      </div>
                      <div>
                        <h4 class="font-medium text-gray-700">Square</h4>
                        <p class="text-xs text-gray-500">Accept payments and sync appointments</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </TabPanel>


    </TabView>
  </div>
</template>
