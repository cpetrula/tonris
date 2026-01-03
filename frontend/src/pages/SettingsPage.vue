<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import InputSwitch from 'primevue/inputswitch'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import { useTenantStore } from '@/stores/tenant'

const toast = useToast()
const router = useRouter()
const tenantStore = useTenantStore()

const loading = ref(false)
const saving = ref(false)
const successMessage = ref('')

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
  voiceType: 'female_professional',
  greeting: 'Thank you for calling Sample Salon. How can I help you today?',
  appointmentReminders: true,
  reminderHours: 24,
  followUpCalls: true,
  followUpText: true
})

// Notification preferences
const notifications = ref({
  emailNewAppointment: true,
  emailCancellation: true,
  emailDailyDigest: true,
  smsNewAppointment: false,
  smsCancellation: true,
  smsReminder: true
})

const voiceOptions = [
  { label: 'Female Professional', value: 'female_professional' },
  { label: 'Female Friendly', value: 'female_friendly' },
  { label: 'Male Professional', value: 'male_professional' },
  { label: 'Male Friendly', value: 'male_friendly' }
]

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
    // In a real app, save to API
    // await api.patch(`/api/tenants/${tenantStore.tenantId}/ai-settings`, aiSettings.value)
    await new Promise(resolve => setTimeout(resolve, 500))
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
    // In a real app, save to API
    // await api.patch(`/api/tenants/${tenantStore.tenantId}/notifications`, notifications.value)
    await new Promise(resolve => setTimeout(resolve, 500))
    toast.add({ severity: 'success', summary: 'Success', detail: 'Notification preferences saved', life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save preferences', life: 3000 })
  } finally {
    saving.value = false
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
                  <Dropdown
                    v-model="hours.open"
                    :options="timeSlots"
                    placeholder="Open"
                    class="w-32"
                  />
                  <span class="text-gray-500">to</span>
                  <Dropdown
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
                <Dropdown
                  v-model="aiSettings.voiceType"
                  :options="voiceOptions"
                  optionLabel="label"
                  optionValue="value"
                  class="w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-medium  mb-1">Greeting Message</label>
                <Textarea v-model="aiSettings.greeting" rows="2" class="w-full" />
                <p class="text-sm mt-1">This message will be used to greet callers</p>
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
          
                <div class="space-y-4">
                   
                  <div class="flex items-center justify-between">
                    <div>
                     
                      <p class="text-sm">Receive email when a new appointment is booked</p>
                    </div>
                    <InputSwitch v-model="notifications.emailNewAppointment" />
                  </div>
                   <div class="flex items-center justify-between">
                    <div>
                    
                      <p class="text-sm">Receive SMS when a new appointment is booked</p>
                    </div>
                    <InputSwitch v-model="notifications.smsNewAppointment" />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      
                      <p class="text-sm">Receive email when an appointment is cancelled</p>
                    </div>
                    <InputSwitch v-model="notifications.emailCancellation" />
                  </div>
                   <div class="flex items-center justify-between">
                    <div>
                    
                      <p class="text-sm">Receive SMS when an appointment is cancelled</p>
                    </div>
                    <InputSwitch v-model="notifications.smsCancellation" />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                     
                      <p class="text-sm">Receive a daily summary email of activity</p>
                    </div>
                    <InputSwitch v-model="notifications.emailDailyDigest" />
                  </div>
                </div>
              </div>

              

              <div class="border-t border-gray-200 pt-6">
                <h3 class="font-medium text-gray-900 mb-4">Automated Actions</h3>
                
                <div class="space-y-4">
                  
                    <div class="flex items-center justify-between">
                    <div>
                
                      <p class="text-sm">Send SMS reminders to customers</p>
                    </div>
                    <InputSwitch v-model="notifications.smsReminder" />
                  </div>
                 

                  <div v-if="aiSettings.appointmentReminders" class="ml-4 pl-4 border-l-2 border-gray-200">
                    <label class="block text-sm font-medium  mb-1">Remind customers (hours before)</label>
                    <Dropdown
                      v-model="aiSettings.reminderHours"
                      :options="[12, 24, 48]"
                      class="w-32"
                    />
                  </div>

                  <div class="flex items-center justify-between">
                    <div>
            
                      <p class="text-sm">Text customers after appointments for feedback</p>
                    </div>
                    <InputSwitch v-model="aiSettings.followUpText" />
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


    </TabView>
  </div>
</template>
