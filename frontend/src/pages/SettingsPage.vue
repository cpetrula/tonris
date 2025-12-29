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
import api from '@/services/api'

const toast = useToast()

const loading = ref(false)
const saving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

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

// AI Voice Settings
const aiSettings = ref({
  voiceType: 'female_professional',
  greetingMessage: '',
  appointmentReminders: true,
  reminderHours: 24,
  followUpCalls: false,
  language: 'en-US'
})

// Notification preferences
const notifications = ref({
  email: {
    newAppointments: true,
    cancellations: true,
    dailyDigest: false
  },
  sms: {
    newAppointments: false,
    cancellations: false,
    reminders: true
  }
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

async function loadSettings() {
  loading.value = true
  errorMessage.value = ''

  try {
    // Load all settings in parallel
    const [profileRes, hoursRes, aiRes, notifRes] = await Promise.all([
      api.get('/api/tenant/profile'),
      api.get('/api/tenant/hours'),
      api.get('/api/tenant/ai-settings'),
      api.get('/api/tenant/notifications')
    ])

    if (profileRes.data.success) {
      businessProfile.value = profileRes.data.data
    }
    if (hoursRes.data.success) {
      businessHours.value = hoursRes.data.data
    }
    if (aiRes.data.success) {
      aiSettings.value = aiRes.data.data
    }
    if (notifRes.data.success) {
      notifications.value = notifRes.data.data
    }
  } catch (err: any) {
    console.error('Error loading settings:', err)
    errorMessage.value = 'Failed to load settings. Please try again.'
  } finally {
    loading.value = false
  }
}

async function saveBusinessProfile() {
  saving.value = true
  try {
    const response = await api.patch('/api/tenant/profile', businessProfile.value)
    if (response.data.success) {
      toast.add({ severity: 'success', summary: 'Success', detail: 'Business profile saved', life: 3000 })
    }
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.error || 'Failed to save profile', life: 3000 })
  } finally {
    saving.value = false
  }
}

async function saveBusinessHours() {
  saving.value = true
  try {
    const response = await api.patch('/api/tenant/hours', { hours: businessHours.value })
    if (response.data.success) {
      toast.add({ severity: 'success', summary: 'Success', detail: 'Business hours saved', life: 3000 })
    }
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.error || 'Failed to save hours', life: 3000 })
  } finally {
    saving.value = false
  }
}

async function saveAISettings() {
  saving.value = true
  try {
    const response = await api.patch('/api/tenant/ai-settings', aiSettings.value)
    if (response.data.success) {
      toast.add({ severity: 'success', summary: 'Success', detail: 'AI settings saved', life: 3000 })
    }
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.error || 'Failed to save settings', life: 3000 })
  } finally {
    saving.value = false
  }
}

async function saveNotifications() {
  saving.value = true
  try {
    const response = await api.patch('/api/tenant/notifications', notifications.value)
    if (response.data.success) {
      toast.add({ severity: 'success', summary: 'Success', detail: 'Notification preferences saved', life: 3000 })
    }
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.error || 'Failed to save preferences', life: 3000 })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadSettings()
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
    <Message v-if="errorMessage" severity="error" class="mb-6">{{ errorMessage }}</Message>

    <div v-if="loading" class="flex justify-center py-12">
      <i class="pi pi-spin pi-spinner text-4xl text-gray-400"></i>
    </div>

    <TabView v-else>
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
                <Textarea v-model="aiSettings.greetingMessage" rows="2" class="w-full" />
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
                    <InputSwitch v-model="notifications.email.newAppointments" />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-gray-700">Cancellations</p>
                      <p class="text-sm text-gray-500">Receive email when an appointment is cancelled</p>
                    </div>
                    <InputSwitch v-model="notifications.email.cancellations" />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-gray-700">Daily Digest</p>
                      <p class="text-sm text-gray-500">Receive a daily summary of activity</p>
                    </div>
                    <InputSwitch v-model="notifications.email.dailyDigest" />
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
                    <InputSwitch v-model="notifications.sms.newAppointments" />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-gray-700">Cancellations</p>
                      <p class="text-sm text-gray-500">Receive SMS when an appointment is cancelled</p>
                    </div>
                    <InputSwitch v-model="notifications.sms.cancellations" />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-gray-700">Appointment Reminders</p>
                      <p class="text-sm text-gray-500">Send SMS reminders to customers</p>
                    </div>
                    <InputSwitch v-model="notifications.sms.reminders" />
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
