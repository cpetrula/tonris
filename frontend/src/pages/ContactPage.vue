<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const name = ref('')
const email = ref('')
const company = ref('')
const industry = ref('')
const message = ref('')
const submitting = ref(false)
const submitted = ref(false)
const error = ref('')

async function handleSubmit() {
  if (!name.value || !email.value || !message.value) return

  submitting.value = true
  error.value = ''

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        company: company.value,
        industry: industry.value,
        message: message.value
      })
    })

    if (!response.ok) throw new Error('Failed to send message')

    submitted.value = true
  } catch (e) {
    error.value = 'Something went wrong. Please email us directly at info@criton.ai.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white py-16 md:py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
        <p class="text-xl text-violet-100 max-w-3xl mx-auto">
          Tell us about your business and what you're looking to build. We'll get back to you within 24 hours.
        </p>
      </div>
    </section>

    <!-- Contact Form + Info -->
    <section class="py-16 md:py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-3 gap-12">
          <!-- Form -->
          <div class="lg:col-span-2">
            <!-- Success State -->
            <div v-if="submitted" class="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
              <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <i class="pi pi-check text-3xl text-green-600"></i>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Thanks! We'll be in touch soon.</h2>
              <p class="text-gray-600">We typically respond within one business day.</p>
            </div>

            <!-- Form -->
            <form v-else @submit.prevent="handleSubmit" class="space-y-6">
              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <InputText v-model="name" placeholder="Your name" class="w-full" required />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <InputText v-model="email" type="email" placeholder="you@company.com" class="w-full" required />
                </div>
              </div>
              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <InputText v-model="company" placeholder="Your company" class="w-full" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                  <InputText v-model="industry" placeholder="e.g. Film Production, Automotive, Healthcare" class="w-full" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <textarea
                  v-model="message"
                  rows="5"
                  required
                  placeholder="Tell us about your business and what you're looking to build..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-y"
                ></textarea>
              </div>

              <p v-if="error" class="text-red-600 text-sm">
                <i class="pi pi-exclamation-circle mr-1"></i>{{ error }}
              </p>

              <Button
                type="submit"
                :label="submitting ? 'Sending...' : 'Send Message'"
                icon="pi pi-send"
                icon-pos="right"
                size="large"
                class="px-8"
                :disabled="submitting"
                :loading="submitting"
              />
            </form>
          </div>

          <!-- Contact Info -->
          <div>
            <div class="bg-gray-50 rounded-xl p-8 border border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900 mb-6">Contact Info</h3>
              <div class="space-y-5">
                <a href="mailto:info@criton.ai" class="flex items-start gap-3 text-gray-600 hover:text-violet-600 transition-colors">
                  <div class="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i class="pi pi-envelope text-violet-600"></i>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Email</p>
                    <p class="font-medium text-gray-900">info@criton.ai</p>
                  </div>
                </a>
                <a href="tel:+18185316200" class="flex items-start gap-3 text-gray-600 hover:text-violet-600 transition-colors">
                  <div class="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i class="pi pi-phone text-violet-600"></i>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Phone</p>
                    <p class="font-medium text-gray-900">(818) 531-6200</p>
                  </div>
                </a>
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i class="pi pi-map-marker text-violet-600"></i>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Location</p>
                    <p class="font-medium text-gray-900">Los Angeles, CA</p>
                  </div>
                </div>
              </div>
            </div>
            <p class="text-sm text-gray-500 mt-4 px-2">
              <i class="pi pi-clock mr-1"></i>
              We typically respond within one business day.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
