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

const toast = useToast()
const router = useRouter()

const loading = ref(false)
const saving = ref(false)
const successMessage = ref('')

// Business profile
const businessProfile = ref({
  name: 'Sample Salon',
  email: 'contact@samplesalon.com',
  phone: '(555) 123-4567',
  address: '123 Main Street',
  city: 'New York',
  state: 'NY',
  zipCode: '10001',
  website: 'https://samplesalon.com',
  description: 'A premier hair salon offering a wide range of services including haircuts, coloring, and styling.'
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

// AI Voice Settings
const aiSettings = ref({
  voiceType: 'female_professional',
  greeting: 'Thank you for calling Sample Salon. How can I help you today?',
  appointmentReminders: true,
  reminderHours: 24,
  followUpCalls: true,
  language: 'en-US'
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

// Integration settings
const integrations = ref({
  googleCalendar: { connected: true, email: 'business@gmail.com' },
  outlookCalendar: { connected: false, email: '' },
  stripe: { connected: true, accountId: 'acct_xxx' }
})

const voiceOptions = [
  { label: 'Female Professional', value: 'female_professional' },
  { label: 'Female Friendly', value: 'female_friendly' },
  { label: 'Male Professional', value: 'male_professional' },
  { label: 'Male Friendly', value: 'male_friendly' }
]

const languageOptions = [
  { label: 'English (US)', value: 'en-US' },
  { label: 'English (UK)', value: 'en-GB' },
  { label: 'Spanish', value: 'es-ES' },
  { label: 'French', value: 'fr-FR' }
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
    // In a real app, save to API
    // await api.patch(`/api/tenants/${tenantStore.tenantId}/profile`, businessProfile.value)
    await new Promise(resolve => setTimeout(resolve, 500))
    toast.add({ severity: 'success', summary: 'Success', detail: 'Business profile saved', life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save profile', life: 3000 })
  } finally {
    saving.value = false
  }
}

async function saveBusinessHours() {
  saving.value = true
  try {
    // In a real app, save to API
    // await api.patch(`/api/tenants/${tenantStore.tenantId}/hours`, businessHours.value)
    await new Promise(resolve => setTimeout(resolve, 500))
    toast.add({ severity: 'success', summary: 'Success', detail: 'Business hours saved', life: 3000 })
  } catch {
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

function connectGoogleCalendar() {
  // In a real app, initiate OAuth flow
  alert('Google Calendar OAuth flow would start here')
}

function disconnectGoogleCalendar() {
  if (confirm('Are you sure you want to disconnect Google Calendar?')) {
    integrations.value.googleCalendar.connected = false
    integrations.value.googleCalendar.email = ''
  }
}

function connectOutlookCalendar() {
  // In a real app, initiate OAuth flow
  alert('Outlook Calendar OAuth flow would start here')
}

onMounted(async () => {
  loading.value = true
  // In a real app, fetch settings from API using tenantStore.tenantId
  // await api.get(`/api/tenants/${tenantStore.tenantId}/settings`)
  loading.value = false
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

    <TabView>
      <!-- Business Profile Tab -->
      <TabPanel value="0" header="Business Profile">
        <Card class="shadow-sm">
          <template #content>
            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <InputText v-model="businessProfile.name" class="w-full" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <InputText v-model="businessProfile.email" type="email" class="w-full" />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <InputText v-model="businessProfile.phone" class="w-full" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <InputText v-model="businessProfile.website" class="w-full" placeholder="https://" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <InputText v-model="businessProfile.address" class="w-full" />
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <InputText v-model="businessProfile.city" class="w-full" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <InputText v-model="businessProfile.state" class="w-full" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <InputText v-model="businessProfile.zipCode" class="w-full" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
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
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Voice Type</label>
                  <Dropdown
                    v-model="aiSettings.voiceType"
                    :options="voiceOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <Dropdown
                    v-model="aiSettings.language"
                    :options="languageOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Greeting Message</label>
                <Textarea v-model="aiSettings.greeting" rows="2" class="w-full" />
                <p class="text-sm text-gray-500 mt-1">This message will be used to greet callers</p>
              </div>

              <div class="border-t border-gray-200 pt-4">
                <h3 class="font-medium text-gray-900 mb-4">Automated Actions</h3>
                
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-gray-700">Appointment Reminders</p>
                      <p class="text-sm text-gray-500">Automatically call customers to remind them of appointments</p>
                    </div>
                    <InputSwitch v-model="aiSettings.appointmentReminders" />
                  </div>

                  <div v-if="aiSettings.appointmentReminders" class="ml-4 pl-4 border-l-2 border-gray-200">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Remind customers (hours before)</label>
                    <Dropdown
                      v-model="aiSettings.reminderHours"
                      :options="[12, 24, 48]"
                      class="w-32"
                    />
                  </div>

                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-gray-700">Follow-up Calls</p>
                      <p class="text-sm text-gray-500">Call customers after appointments for feedback</p>
                    </div>
                    <InputSwitch v-model="aiSettings.followUpCalls" />
                  </div>
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
                <h3 class="font-medium text-gray-900 mb-4">Email Notifications</h3>
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-gray-700">New Appointments</p>
                      <p class="text-sm text-gray-500">Receive email when a new appointment is booked</p>
                    </div>
                    <InputSwitch v-model="notifications.emailNewAppointment" />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-gray-700">Cancellations</p>
                      <p class="text-sm text-gray-500">Receive email when an appointment is cancelled</p>
                    </div>
                    <InputSwitch v-model="notifications.emailCancellation" />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-gray-700">Daily Digest</p>
                      <p class="text-sm text-gray-500">Receive a daily summary of activity</p>
                    </div>
                    <InputSwitch v-model="notifications.emailDailyDigest" />
                  </div>
                </div>
              </div>

              <div class="border-t border-gray-200 pt-6">
                <h3 class="font-medium text-gray-900 mb-4">SMS Notifications</h3>
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-gray-700">New Appointments</p>
                      <p class="text-sm text-gray-500">Receive SMS when a new appointment is booked</p>
                    </div>
                    <InputSwitch v-model="notifications.smsNewAppointment" />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-gray-700">Cancellations</p>
                      <p class="text-sm text-gray-500">Receive SMS when an appointment is cancelled</p>
                    </div>
                    <InputSwitch v-model="notifications.smsCancellation" />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-gray-700">Appointment Reminders</p>
                      <p class="text-sm text-gray-500">Send SMS reminders to customers</p>
                    </div>
                    <InputSwitch v-model="notifications.smsReminder" />
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
        <div class="space-y-6">
          <!-- Google Calendar -->
          <Card class="shadow-sm">
            <template #content>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                    <i class="pi pi-google text-2xl text-red-600"></i>
                  </div>
                  <div>
                    <h3 class="font-medium text-gray-900">Google Calendar</h3>
                    <p v-if="integrations.googleCalendar.connected" class="text-sm text-green-600">
                      Connected as {{ integrations.googleCalendar.email }}
                    </p>
                    <p v-else class="text-sm text-gray-500">
                      Sync appointments with Google Calendar
                    </p>
                  </div>
                </div>
                <Button
                  v-if="integrations.googleCalendar.connected"
                  label="Disconnect"
                  severity="danger"
                  outlined
                  @click="disconnectGoogleCalendar"
                />
                <Button
                  v-else
                  label="Connect"
                  @click="connectGoogleCalendar"
                />
              </div>
            </template>
          </Card>

          <!-- Outlook Calendar -->
          <Card class="shadow-sm">
            <template #content>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <i class="pi pi-microsoft text-2xl text-blue-600"></i>
                  </div>
                  <div>
                    <h3 class="font-medium text-gray-900">Outlook Calendar</h3>
                    <p v-if="integrations.outlookCalendar.connected" class="text-sm text-green-600">
                      Connected as {{ integrations.outlookCalendar.email }}
                    </p>
                    <p v-else class="text-sm text-gray-500">
                      Sync appointments with Outlook Calendar
                    </p>
                  </div>
                </div>
                <Button
                  v-if="!integrations.outlookCalendar.connected"
                  label="Connect"
                  @click="connectOutlookCalendar"
                />
              </div>
            </template>
          </Card>

          <!-- Stripe -->
          <Card class="shadow-sm">
            <template #content>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <i class="pi pi-credit-card text-2xl text-purple-600"></i>
                  </div>
                  <div>
                    <h3 class="font-medium text-gray-900">Stripe</h3>
                    <p v-if="integrations.stripe.connected" class="text-sm text-green-600">
                      Connected - Payments enabled
                    </p>
                    <p v-else class="text-sm text-gray-500">
                      Accept payments from customers
                    </p>
                  </div>
                </div>
                <Button
                  v-if="integrations.stripe.connected"
                  label="Manage"
                  outlined
                  @click="router.push('/app/billing')"
                />
              </div>
            </template>
          </Card>
        </div>
      </TabPanel>
    </TabView>
  </div>
</template>
