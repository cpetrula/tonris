<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import axios from 'axios'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputMask from 'primevue/inputmask'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'

const currentStep = ref(1)
const totalSteps = 4
const loading = ref(false)
const error = ref('')
const submitted = ref(false)

// Step 1: Child Info
const childFirstName = ref('')
const childLastName = ref('')
const childDateOfBirth = ref('')
const childGender = ref('')
const programPreference = ref('')
const preferredLocation = ref('')
const schedulePreference = ref('')
const preferredStartDate = ref('')

// Step 2: Guardian Info
const guardianFirstName = ref('')
const guardianLastName = ref('')
const guardianEmail = ref('')
const guardianPhone = ref('')
const guardianRelationship = ref('')
const guardianAddress = ref('')
const hasSecondaryGuardian = ref(false)
const secondaryGuardianFirstName = ref('')
const secondaryGuardianLastName = ref('')
const secondaryGuardianPhone = ref('')
const secondaryGuardianRelationship = ref('')

// Step 3: Medical
const allergies = ref('')
const medicalNotes = ref('')
const specialNeeds = ref('')
const immunizationStatus = ref('')
const additionalNotes = ref('')

// Options
const programOptions = [
  { label: 'Infants (3 – 18 months)', value: 'infant' },
  { label: 'Toddlers (18 – 24+ months)', value: 'toddler' },
  { label: 'Early Preschool (2 – 3 years)', value: 'early-preschool' },
  { label: 'Preschool (3 – 4 years)', value: 'preschool' },
  { label: 'Pre-Kindergarten (4 – 5 years)', value: 'pre-k' },
  { label: 'School Age (TK – 12 years)', value: 'school-age' },
]

const scheduleOptions = [
  { label: '5 Days (Mon–Fri)', value: 'five_days' },
  { label: '3 Days (Mon/Wed/Fri)', value: 'three_days' },
  { label: '2 Days (Tue/Thu)', value: 'two_days' },
]

const locationOptions = [
  { label: 'Montebello', value: 'MTB' },
  { label: 'Alhambra', value: 'ALH' },
  { label: 'Both locations', value: 'BOTH' },
]

// School Age is Montebello-only — hide the Location select entirely when selected
const locationApplies = computed(() => programPreference.value !== 'school-age')

watch(programPreference, (val) => {
  if (val === 'school-age') preferredLocation.value = ''
})

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
]

const relationshipOptions = [
  { label: 'Mother', value: 'mother' },
  { label: 'Father', value: 'father' },
  { label: 'Guardian', value: 'guardian' },
  { label: 'Grandparent', value: 'grandparent' },
  { label: 'Other', value: 'other' },
]

const immunizationOptions = [
  { label: 'Up to Date', value: 'up_to_date' },
  { label: 'Partial', value: 'partial' },
  { label: 'Medical Exemption', value: 'exempt' },
]

const stepLabels = ['Child Info', 'Guardian', 'Medical', 'Review']

const programLabel = computed(() => {
  return programOptions.find(p => p.value === programPreference.value)?.label || programPreference.value
})

const scheduleLabel = computed(() => {
  return scheduleOptions.find(s => s.value === schedulePreference.value)?.label || schedulePreference.value
})

const locationLabel = computed(() => {
  return locationOptions.find(l => l.value === preferredLocation.value)?.label || preferredLocation.value
})

function validateStep(step: number): boolean {
  error.value = ''
  if (step === 1) {
    if (!childFirstName.value.trim() || !childLastName.value.trim()) {
      error.value = "Child's first and last name are required"
      return false
    }
    if (!childDateOfBirth.value) {
      error.value = "Child's date of birth is required"
      return false
    }
    if (!programPreference.value) {
      error.value = 'Please select a program'
      return false
    }
    if (locationApplies.value && !preferredLocation.value) {
      error.value = 'Please select a preferred location'
      return false
    }
  } else if (step === 2) {
    if (!guardianFirstName.value.trim() || !guardianLastName.value.trim()) {
      error.value = 'Guardian first and last name are required'
      return false
    }
    if (!guardianEmail.value.trim()) {
      error.value = 'Email is required'
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(guardianEmail.value)) {
      error.value = 'Please enter a valid email address'
      return false
    }
    if (!guardianPhone.value.trim()) {
      error.value = 'Phone number is required'
      return false
    }
  }
  return true
}

function nextStep() {
  if (validateStep(currentStep.value)) {
    currentStep.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function prevStep() {
  error.value = ''
  currentStep.value--
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function handleSubmit() {
  error.value = ''
  loading.value = true

  try {
    const apiBase = import.meta.env.VITE_API_URL || ''
    await axios.post(`${apiBase}/api/public/enrollments?tenant=kawai-kids`, {
      childFirstName: childFirstName.value,
      childLastName: childLastName.value,
      childDateOfBirth: childDateOfBirth.value,
      childGender: childGender.value || undefined,
      programPreference: programPreference.value,
      preferredLocation: preferredLocation.value || undefined,
      schedulePreference: schedulePreference.value || undefined,
      preferredStartDate: preferredStartDate.value || undefined,
      guardianFirstName: guardianFirstName.value,
      guardianLastName: guardianLastName.value,
      guardianEmail: guardianEmail.value,
      guardianPhone: guardianPhone.value,
      guardianRelationship: guardianRelationship.value || undefined,
      guardianAddress: guardianAddress.value || undefined,
      secondaryGuardianFirstName: secondaryGuardianFirstName.value || undefined,
      secondaryGuardianLastName: secondaryGuardianLastName.value || undefined,
      secondaryGuardianPhone: secondaryGuardianPhone.value || undefined,
      secondaryGuardianRelationship: secondaryGuardianRelationship.value || undefined,
      allergies: allergies.value || undefined,
      medicalNotes: medicalNotes.value || undefined,
      specialNeeds: specialNeeds.value || undefined,
      immunizationStatus: immunizationStatus.value || undefined,
      additionalNotes: additionalNotes.value || undefined,
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
  <div class="kawai-enroll-page min-h-screen bg-gray-50">
    <!-- Google Fonts -->
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
          You're on the Waitlist!
        </h1>
        <p class="text-lg text-gray-600 mb-2">
          Thank you for adding <strong>{{ childFirstName }} {{ childLastName }}</strong> to the Kawai Kids waitlist!
        </p>
        <p class="text-gray-500 mb-8">
          We will review your request and contact you within <strong>24–72 hours</strong> with next steps.
        </p>
        <div class="bg-purple-50 rounded-xl p-6 mb-8 text-left">
          <h3 class="font-semibold text-purple-900 mb-3" style="font-family: 'Fredoka', sans-serif;">What happens next?</h3>
          <ol class="space-y-2 text-sm text-purple-800">
            <li class="flex items-start gap-2">
              <span class="bg-purple-200 text-purple-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
              Our Director will review your waitlist request
            </li>
            <li class="flex items-start gap-2">
              <span class="bg-purple-200 text-purple-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
              We'll contact you when a spot becomes available
            </li>
            <li class="flex items-start gap-2">
              <span class="bg-purple-200 text-purple-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
              Complete enrollment once your spot is confirmed
            </li>
          </ol>
        </div>
        <a
          href="/kawaikids"
          class="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors"
          style="font-family: 'Fredoka', sans-serif;"
        >
          <i class="pi pi-arrow-left"></i>
          Back to Kawai Kids
        </a>
      </div>
    </div>

    <!-- Enrollment Form -->
    <div v-else class="max-w-3xl mx-auto px-4 py-8 md:py-12">
      <!-- Header -->
      <div class="text-center mb-8">
        <p class="text-purple-500 font-bold mb-1" style="font-family: 'Caveat', cursive; font-size: 1.4rem;">Start the journey</p>
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2" style="font-family: 'Fredoka', sans-serif;">
          Join Our Waitlist
        </h1>
        <p class="text-gray-500">Fill out the form below and we'll be in touch within 24–72 hours.</p>
      </div>

      <!-- Step Indicator -->
      <div class="flex items-center justify-center gap-2 mb-8">
        <template v-for="step in totalSteps" :key="step">
          <div class="flex items-center gap-2">
            <div
              :class="[
                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                currentStep === step ? 'bg-purple-600 text-white scale-110' :
                currentStep > step ? 'bg-green-500 text-white' :
                'bg-gray-200 text-gray-500'
              ]"
            >
              <i v-if="currentStep > step" class="pi pi-check text-xs"></i>
              <span v-else>{{ step }}</span>
            </div>
            <span
              :class="['text-xs font-medium hidden sm:inline', currentStep >= step ? 'text-purple-700' : 'text-gray-400']"
              style="font-family: 'Fredoka', sans-serif;"
            >
              {{ stepLabels[step - 1] }}
            </span>
          </div>
          <div
            v-if="step < totalSteps"
            :class="['w-8 md:w-12 h-0.5', currentStep > step ? 'bg-green-500' : 'bg-gray-200']"
          ></div>
        </template>
      </div>

      <!-- Error Message -->
      <Message v-if="error" severity="error" class="mb-6">
        {{ error }}
      </Message>

      <!-- Form Card -->
      <div class="bg-white rounded-2xl shadow-lg p-6 md:p-10">

        <!-- Step 1: Child Information -->
        <div v-if="currentStep === 1">
          <h2 class="text-xl font-bold text-gray-900 mb-1" style="font-family: 'Fredoka', sans-serif;">
            <i class="pi pi-user text-purple-500 mr-2"></i>Child Information
          </h2>
          <p class="text-sm text-gray-500 mb-6">Tell us about your child</p>

          <div class="space-y-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <InputText v-model="childFirstName" placeholder="Child's first name" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <InputText v-model="childLastName" placeholder="Child's last name" class="w-full" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                <InputText v-model="childDateOfBirth" type="date" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <Select v-model="childGender" :options="genderOptions" optionLabel="label" optionValue="value" placeholder="Select" class="w-full" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Program *</label>
              <Select v-model="programPreference" :options="programOptions" optionLabel="label" optionValue="value" placeholder="Select a program" class="w-full" />
            </div>

            <div v-if="locationApplies">
              <label class="block text-sm font-medium text-gray-700 mb-1">Preferred Location *</label>
              <Select v-model="preferredLocation" :options="locationOptions" optionLabel="label" optionValue="value" placeholder="Select a location" class="w-full" />
              <p class="text-xs text-gray-500 mt-1">Choose <strong>Both locations</strong> if you're open to whichever has availability.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Schedule Preference</label>
                <Select v-model="schedulePreference" :options="scheduleOptions" optionLabel="label" optionValue="value" placeholder="Select schedule" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Preferred Start Date</label>
                <InputText v-model="preferredStartDate" type="date" class="w-full" />
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Guardian Information -->
        <div v-if="currentStep === 2">
          <h2 class="text-xl font-bold text-gray-900 mb-1" style="font-family: 'Fredoka', sans-serif;">
            <i class="pi pi-users text-purple-500 mr-2"></i>Guardian Information
          </h2>
          <p class="text-sm text-gray-500 mb-6">Primary parent or guardian</p>

          <div class="space-y-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <InputText v-model="guardianFirstName" placeholder="First name" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <InputText v-model="guardianLastName" placeholder="Last name" class="w-full" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <InputText v-model="guardianEmail" type="email" placeholder="email@example.com" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <InputMask v-model="guardianPhone" mask="(999) 999-9999" placeholder="(555) 555-5555" class="w-full" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Relationship to Child</label>
                <Select v-model="guardianRelationship" :options="relationshipOptions" optionLabel="label" optionValue="value" placeholder="Select" class="w-full" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <Textarea v-model="guardianAddress" rows="2" placeholder="Street address, city, state, ZIP" class="w-full" />
            </div>

            <!-- Secondary Guardian Toggle -->
            <div class="border-t border-gray-200 pt-5">
              <button
                type="button"
                class="flex items-center gap-2 text-purple-600 font-medium hover:text-purple-700"
                @click="hasSecondaryGuardian = !hasSecondaryGuardian"
              >
                <i :class="hasSecondaryGuardian ? 'pi pi-minus-circle' : 'pi pi-plus-circle'"></i>
                {{ hasSecondaryGuardian ? 'Remove' : 'Add' }} Secondary Guardian
              </button>
            </div>

            <div v-if="hasSecondaryGuardian" class="space-y-4 bg-purple-50 rounded-xl p-5">
              <p class="text-sm font-medium text-purple-700">Secondary Guardian</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <InputText v-model="secondaryGuardianFirstName" placeholder="First name" class="w-full" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <InputText v-model="secondaryGuardianLastName" placeholder="Last name" class="w-full" />
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <InputMask v-model="secondaryGuardianPhone" mask="(999) 999-9999" placeholder="(555) 555-5555" class="w-full" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                  <Select v-model="secondaryGuardianRelationship" :options="relationshipOptions" optionLabel="label" optionValue="value" placeholder="Select" class="w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Medical -->
        <div v-if="currentStep === 3">
          <h2 class="text-xl font-bold text-gray-900 mb-1" style="font-family: 'Fredoka', sans-serif;">
            <i class="pi pi-heart text-purple-500 mr-2"></i>Medical Information
          </h2>
          <p class="text-sm text-gray-500 mb-6">This helps us keep your child safe</p>

          <div class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
              <Textarea v-model="allergies" rows="2" placeholder="List any food or environmental allergies, or type 'None'" class="w-full" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Medical Notes</label>
              <Textarea v-model="medicalNotes" rows="2" placeholder="Any medical conditions, medications, or special instructions" class="w-full" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Special Needs</label>
              <Textarea v-model="specialNeeds" rows="2" placeholder="Any developmental or special needs we should be aware of" class="w-full" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Immunization Status</label>
                <Select v-model="immunizationStatus" :options="immunizationOptions" optionLabel="label" optionValue="value" placeholder="Select" class="w-full" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <Textarea v-model="additionalNotes" rows="2" placeholder="Anything else you'd like us to know" class="w-full" />
            </div>
          </div>
        </div>

        <!-- Step 4: Review -->
        <div v-if="currentStep === 4">
          <h2 class="text-xl font-bold text-gray-900 mb-1" style="font-family: 'Fredoka', sans-serif;">
            <i class="pi pi-check-circle text-purple-500 mr-2"></i>Review & Submit
          </h2>
          <p class="text-sm text-gray-500 mb-6">Please review the information below before submitting</p>

          <div class="space-y-6">
            <!-- Child Summary -->
            <div class="bg-purple-50 rounded-xl p-5">
              <h3 class="font-semibold text-purple-900 mb-3 text-sm" style="font-family: 'Fredoka', sans-serif;">Child Information</h3>
              <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div><span class="text-gray-500">Name:</span> <span class="font-medium text-gray-900">{{ childFirstName }} {{ childLastName }}</span></div>
                <div><span class="text-gray-500">DOB:</span> <span class="font-medium text-gray-900">{{ childDateOfBirth }}</span></div>
                <div><span class="text-gray-500">Program:</span> <span class="font-medium text-gray-900">{{ programLabel }}</span></div>
                <div v-if="preferredLocation"><span class="text-gray-500">Location:</span> <span class="font-medium text-gray-900">{{ locationLabel }}</span></div>
                <div v-if="schedulePreference"><span class="text-gray-500">Schedule:</span> <span class="font-medium text-gray-900">{{ scheduleLabel }}</span></div>
                <div v-if="preferredStartDate"><span class="text-gray-500">Start Date:</span> <span class="font-medium text-gray-900">{{ preferredStartDate }}</span></div>
                <div v-if="childGender"><span class="text-gray-500">Gender:</span> <span class="font-medium text-gray-900 capitalize">{{ childGender }}</span></div>
              </div>
            </div>

            <!-- Guardian Summary -->
            <div class="bg-blue-50 rounded-xl p-5">
              <h3 class="font-semibold text-blue-900 mb-3 text-sm" style="font-family: 'Fredoka', sans-serif;">Guardian Information</h3>
              <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div><span class="text-gray-500">Name:</span> <span class="font-medium text-gray-900">{{ guardianFirstName }} {{ guardianLastName }}</span></div>
                <div><span class="text-gray-500">Email:</span> <span class="font-medium text-gray-900">{{ guardianEmail }}</span></div>
                <div><span class="text-gray-500">Phone:</span> <span class="font-medium text-gray-900">{{ guardianPhone }}</span></div>
                <div v-if="guardianRelationship"><span class="text-gray-500">Relationship:</span> <span class="font-medium text-gray-900 capitalize">{{ guardianRelationship }}</span></div>
              </div>
              <div v-if="hasSecondaryGuardian && secondaryGuardianFirstName" class="mt-3 pt-3 border-t border-blue-200">
                <p class="text-xs text-blue-600 font-medium mb-1">Secondary Guardian</p>
                <div class="text-sm">
                  {{ secondaryGuardianFirstName }} {{ secondaryGuardianLastName }}
                  <span v-if="secondaryGuardianPhone"> — {{ secondaryGuardianPhone }}</span>
                </div>
              </div>
            </div>

            <!-- Medical Summary -->
            <div class="bg-amber-50 rounded-xl p-5">
              <h3 class="font-semibold text-amber-900 mb-3 text-sm" style="font-family: 'Fredoka', sans-serif;">Medical Information</h3>
              <div class="space-y-2 text-sm">
                <div v-if="allergies"><span class="text-gray-500">Allergies:</span> <span class="font-medium text-gray-900">{{ allergies }}</span></div>
                <div v-if="medicalNotes"><span class="text-gray-500">Medical Notes:</span> <span class="font-medium text-gray-900">{{ medicalNotes }}</span></div>
                <div v-if="specialNeeds"><span class="text-gray-500">Special Needs:</span> <span class="font-medium text-gray-900">{{ specialNeeds }}</span></div>
                <div v-if="immunizationStatus"><span class="text-gray-500">Immunizations:</span> <span class="font-medium text-gray-900 capitalize">{{ immunizationStatus.replace('_', ' ') }}</span></div>
                <div v-if="!allergies && !medicalNotes && !specialNeeds && !immunizationStatus" class="text-gray-400 italic">
                  No medical information provided
                </div>
              </div>
            </div>

            <div v-if="additionalNotes" class="bg-gray-50 rounded-xl p-5">
              <h3 class="font-semibold text-gray-700 mb-2 text-sm" style="font-family: 'Fredoka', sans-serif;">Additional Notes</h3>
              <p class="text-sm text-gray-600">{{ additionalNotes }}</p>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
          <Button
            v-if="currentStep > 1"
            label="Back"
            icon="pi pi-arrow-left"
            severity="secondary"
            outlined
            @click="prevStep"
          />
          <div v-else></div>

          <Button
            v-if="currentStep < totalSteps"
            label="Continue"
            icon="pi pi-arrow-right"
            icon-pos="right"
            class="!bg-purple-600 !border-purple-600 hover:!bg-purple-700"
            @click="nextStep"
          />
          <Button
            v-else
            label="Submit Enrollment"
            icon="pi pi-check"
            icon-pos="right"
            class="!bg-green-600 !border-green-600 hover:!bg-green-700"
            :loading="loading"
            @click="handleSubmit"
          />
        </div>
      </div>

      <!-- Footer note -->
      <p class="text-center text-xs text-gray-400 mt-6">
        Powered by <a href="/" class="text-purple-400 hover:text-purple-500">CRITON.AI</a>
      </p>
    </div>
  </div>
</template>

<style scoped>
.kawai-enroll-page {
  font-family: 'Fredoka', -apple-system, BlinkMacSystemFont, sans-serif;
}
</style>
