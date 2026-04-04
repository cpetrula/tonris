<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputMask from 'primevue/inputmask'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'

const loading = ref(false)
const error = ref('')
const submitted = ref(false)

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const preferredDate = ref('')
const preferredTime = ref('')
const childAge = ref('')
const programInterest = ref('')
const notes = ref('')

const timeOptions = [
  { label: '9:00 AM', value: '09:00' },
  { label: '10:00 AM', value: '10:00' },
  { label: '11:00 AM', value: '11:00' },
  { label: '12:00 PM', value: '12:00' },
  { label: '1:00 PM', value: '13:00' },
  { label: '2:00 PM', value: '14:00' },
  { label: '3:00 PM', value: '15:00' },
  { label: '4:00 PM', value: '16:00' },
]

const programOptions = [
  { label: 'Infants (0 – 12 months)', value: 'infant' },
  { label: 'Toddlers (12 – 24 months)', value: 'toddler' },
  { label: 'Early Preschool (2 – 3 years)', value: 'early-preschool' },
  { label: 'Preschool (3 – 4 years)', value: 'preschool' },
  { label: 'Pre-Kindergarten (4 – 5 years)', value: 'pre-k' },
  { label: 'School Age (TK – 12 years)', value: 'school-age' },
  { label: 'Not sure yet', value: 'undecided' },
]

function validate(): boolean {
  error.value = ''
  if (!firstName.value.trim() || !lastName.value.trim()) {
    error.value = 'Please enter your first and last name'
    return false
  }
  if (!phone.value.trim()) {
    error.value = 'Phone number is required'
    return false
  }
  if (!email.value.trim()) {
    error.value = 'Email is required'
    return false
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    error.value = 'Please enter a valid email address'
    return false
  }
  return true
}

async function handleSubmit() {
  if (!validate()) return

  error.value = ''
  loading.value = true

  try {
    const apiBase = import.meta.env.VITE_API_URL || ''
    await axios.post(`${apiBase}/api/public/enrollments/tour?tenant=kawai-kids`, {
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      phone: phone.value,
      preferredDate: preferredDate.value || undefined,
      preferredTime: preferredTime.value || undefined,
      childAge: childAge.value || undefined,
      programInterest: programInterest.value || undefined,
      notes: notes.value || undefined,
    })

    submitted.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosError = err as { response?: { data?: { error?: string } } }
      error.value = axiosError.response?.data?.error || 'Something went wrong. Please try again.'
    } else {
      error.value = 'Something went wrong. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="kawai-tour-page min-h-screen bg-gray-50">
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Caveat:wght@400;700&display=swap" rel="stylesheet" />

    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <a href="/kawaikids" class="flex items-center gap-3">
            <img
              src="https://kawaikids.com/wp-content/uploads/2025/03/logo-2025-trans.png"
              alt="Kawai Kids"
              class="h-12 w-auto"
            />
          </a>
          <a
            href="tel:3237285437"
            class="inline-flex items-center gap-2 text-purple-600 font-medium hover:text-purple-700"
            style="font-family: 'Fredoka', sans-serif;"
          >
            <i class="pi pi-phone text-sm"></i>
            (323) 728-KIDS
          </a>
        </div>
      </div>
    </nav>

    <!-- Success State -->
    <div v-if="submitted" class="max-w-2xl mx-auto px-4 py-20 text-center">
      <div class="bg-white rounded-3xl p-12 shadow-lg">
        <div class="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
          <i class="pi pi-check text-4xl text-green-600"></i>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-4" style="font-family: 'Fredoka', sans-serif;">
          Tour Request Submitted!
        </h1>
        <p class="text-lg text-gray-600 mb-2">
          Thank you, <strong>{{ firstName }}</strong>! We're excited to show you around.
        </p>
        <p class="text-gray-500 mb-8">
          We'll call you within <strong>24 hours</strong> to confirm your tour date and time.
        </p>
        <div class="bg-purple-50 rounded-xl p-6 mb-8 text-left">
          <h3 class="font-semibold text-purple-900 mb-3" style="font-family: 'Fredoka', sans-serif;">What to expect on your tour</h3>
          <ul class="space-y-2 text-sm text-purple-800">
            <li class="flex items-start gap-2">
              <i class="pi pi-check-circle text-purple-500 mt-0.5"></i>
              Meet our Director, Ms. Jenna, and our teaching team
            </li>
            <li class="flex items-start gap-2">
              <i class="pi pi-check-circle text-purple-500 mt-0.5"></i>
              Walk through our classrooms and outdoor play areas
            </li>
            <li class="flex items-start gap-2">
              <i class="pi pi-check-circle text-purple-500 mt-0.5"></i>
              Learn about our curriculum and daily routines
            </li>
            <li class="flex items-start gap-2">
              <i class="pi pi-check-circle text-purple-500 mt-0.5"></i>
              Get answers to all your questions
            </li>
            <li class="flex items-start gap-2">
              <i class="pi pi-check-circle text-purple-500 mt-0.5"></i>
              Tours typically last 20–30 minutes
            </li>
          </ul>
        </div>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/kawaikids"
            class="inline-flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors"
            style="font-family: 'Fredoka', sans-serif;"
          >
            <i class="pi pi-arrow-left"></i>
            Back to Kawai Kids
          </a>
          <a
            href="/kawaikids/enroll"
            class="inline-flex items-center justify-center gap-2 bg-amber-400 text-purple-900 px-6 py-3 rounded-full font-semibold hover:bg-amber-300 transition-colors"
            style="font-family: 'Fredoka', sans-serif;"
          >
            Ready to Enroll?
            <i class="pi pi-arrow-right"></i>
          </a>
        </div>
      </div>
    </div>

    <!-- Tour Form -->
    <div v-else class="max-w-2xl mx-auto px-4 py-8 md:py-12">
      <!-- Header -->
      <div class="text-center mb-8">
        <p class="text-purple-500 font-bold mb-1" style="font-family: 'Caveat', cursive; font-size: 1.4rem;">Come see us!</p>
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2" style="font-family: 'Fredoka', sans-serif;">
          Schedule a Tour
        </h1>
        <p class="text-gray-500">See our facility, meet our staff, and learn why families love Kawai Kids.</p>
      </div>

      <!-- Tour Highlights -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        <div class="text-center bg-white rounded-xl p-4 shadow-sm">
          <div class="w-10 h-10 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
            <i class="pi pi-clock text-purple-600"></i>
          </div>
          <p class="text-xs font-medium text-gray-700" style="font-family: 'Fredoka', sans-serif;">20–30 min</p>
        </div>
        <div class="text-center bg-white rounded-xl p-4 shadow-sm">
          <div class="w-10 h-10 mx-auto mb-2 bg-amber-100 rounded-full flex items-center justify-center">
            <i class="pi pi-users text-amber-600"></i>
          </div>
          <p class="text-xs font-medium text-gray-700" style="font-family: 'Fredoka', sans-serif;">Meet the team</p>
        </div>
        <div class="text-center bg-white rounded-xl p-4 shadow-sm">
          <div class="w-10 h-10 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
            <i class="pi pi-heart text-green-600"></i>
          </div>
          <p class="text-xs font-medium text-gray-700" style="font-family: 'Fredoka', sans-serif;">No obligation</p>
        </div>
      </div>

      <Message v-if="error" severity="error" class="mb-6">
        {{ error }}
      </Message>

      <!-- Form -->
      <div class="bg-white rounded-2xl shadow-lg p-6 md:p-10">
        <div class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <InputText v-model="firstName" placeholder="Your first name" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <InputText v-model="lastName" placeholder="Your last name" class="w-full" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <InputText v-model="email" type="email" placeholder="email@example.com" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <InputMask v-model="phone" mask="(999) 999-9999" placeholder="(555) 555-5555" class="w-full" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
              <InputText v-model="preferredDate" type="date" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
              <Select v-model="preferredTime" :options="timeOptions" optionLabel="label" optionValue="value" placeholder="Select a time" class="w-full" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Child's Age</label>
              <InputText v-model="childAge" placeholder="e.g., 2 years old" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Program Interest</label>
              <Select v-model="programInterest" :options="programOptions" optionLabel="label" optionValue="value" placeholder="Select program" class="w-full" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Questions or Notes</label>
            <Textarea v-model="notes" rows="3" placeholder="Anything specific you'd like to see or ask about?" class="w-full" />
          </div>

          <div class="pt-2">
            <Button
              label="Request Tour"
              icon="pi pi-calendar"
              icon-pos="right"
              class="w-full !bg-purple-600 !border-purple-600 hover:!bg-purple-700 !py-3 !text-lg"
              :loading="loading"
              @click="handleSubmit"
              style="font-family: 'Fredoka', sans-serif;"
            />
          </div>

          <p class="text-center text-sm text-gray-400">
            We'll call you within 24 hours to confirm. No commitment required.
          </p>
        </div>
      </div>

      <!-- Already want to enroll? -->
      <div class="text-center mt-8 bg-white rounded-xl p-6 shadow-sm">
        <p class="text-gray-600 mb-3">Already know Kawai Kids is right for your family?</p>
        <a
          href="/kawaikids/enroll"
          class="inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-700"
          style="font-family: 'Fredoka', sans-serif;"
        >
          Skip to Enrollment
          <i class="pi pi-arrow-right"></i>
        </a>
      </div>

      <p class="text-center text-xs text-gray-400 mt-6">
        Powered by <a href="/" class="text-purple-400 hover:text-purple-500">CRITON.AI</a>
      </p>
    </div>
  </div>
</template>

<style scoped>
.kawai-tour-page {
  font-family: 'Fredoka', -apple-system, BlinkMacSystemFont, sans-serif;
}
</style>
