<script setup lang="ts">
import { ref } from 'vue'

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
  <div class="bg-[color:var(--criton-bg)] text-[color:var(--criton-text)]">
    <!-- HERO -->
    <section class="criton-hero-bg relative overflow-hidden">
      <div class="max-w-6xl mx-auto px-6 lg:px-8 pt-28 pb-16 md:pt-36 md:pb-20 text-center">
        <div class="criton-pill mb-8">Let's Talk</div>
        <h1
          class="font-display font-bold text-4xl md:text-6xl lg:text-7xl leading-[1.08] tracking-tight mb-7 max-w-4xl mx-auto"
        >
          Have something<br />
          <span class="italic criton-accent">worth building?</span>
        </h1>
        <p
          class="text-lg md:text-xl text-[color:var(--criton-text-muted)] max-w-2xl mx-auto leading-relaxed"
        >
          Tell us about your business and what you're looking to build. We'll get back to you within 24 hours.
        </p>
      </div>
    </section>

    <!-- FORM SECTION -->
    <section class="py-16 md:py-24 border-t border-[color:var(--criton-border)]">
      <div class="max-w-6xl mx-auto px-6 lg:px-8">
        <div class="grid lg:grid-cols-3 gap-12 lg:gap-16">
          <!-- Form -->
          <div class="lg:col-span-2">
            <!-- Success State -->
            <div v-if="submitted" class="criton-card rounded-xl p-10 text-center">
              <div class="w-16 h-16 mx-auto mb-6 bg-[color:var(--criton-surface-2)] border border-[color:var(--criton-gold)] rounded-full flex items-center justify-center">
                <i class="pi pi-check text-3xl text-[color:var(--criton-gold)]"></i>
              </div>
              <h2 class="font-display text-2xl font-bold text-[color:var(--criton-ivory)] mb-3">Thanks! We'll be in touch soon.</h2>
              <p class="text-[color:var(--criton-text-muted)]">We typically respond within one business day.</p>
            </div>

            <!-- Form -->
            <form v-else @submit.prevent="handleSubmit" class="space-y-6">
              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-[color:var(--criton-text-muted)] mb-2">Name *</label>
                  <input
                    v-model="name"
                    type="text"
                    placeholder="Your name"
                    required
                    class="w-full px-4 py-3 bg-[color:var(--criton-surface)] border border-[color:var(--criton-border)] rounded-lg text-[color:var(--criton-text)] placeholder-[color:var(--criton-text-dim)] focus:outline-none focus:border-[color:var(--criton-gold)] transition-colors"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-[color:var(--criton-text-muted)] mb-2">Email *</label>
                  <input
                    v-model="email"
                    type="email"
                    placeholder="you@company.com"
                    required
                    class="w-full px-4 py-3 bg-[color:var(--criton-surface)] border border-[color:var(--criton-border)] rounded-lg text-[color:var(--criton-text)] placeholder-[color:var(--criton-text-dim)] focus:outline-none focus:border-[color:var(--criton-gold)] transition-colors"
                  />
                </div>
              </div>
              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-[color:var(--criton-text-muted)] mb-2">Company</label>
                  <input
                    v-model="company"
                    type="text"
                    placeholder="Your company"
                    class="w-full px-4 py-3 bg-[color:var(--criton-surface)] border border-[color:var(--criton-border)] rounded-lg text-[color:var(--criton-text)] placeholder-[color:var(--criton-text-dim)] focus:outline-none focus:border-[color:var(--criton-gold)] transition-colors"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-[color:var(--criton-text-muted)] mb-2">Industry</label>
                  <input
                    v-model="industry"
                    type="text"
                    placeholder="e.g. Film Production, Automotive"
                    class="w-full px-4 py-3 bg-[color:var(--criton-surface)] border border-[color:var(--criton-border)] rounded-lg text-[color:var(--criton-text)] placeholder-[color:var(--criton-text-dim)] focus:outline-none focus:border-[color:var(--criton-gold)] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-[color:var(--criton-text-muted)] mb-2">Message *</label>
                <textarea
                  v-model="message"
                  rows="5"
                  required
                  placeholder="Tell us about your business and what you're looking to build..."
                  class="w-full px-4 py-3 bg-[color:var(--criton-surface)] border border-[color:var(--criton-border)] rounded-lg text-[color:var(--criton-text)] placeholder-[color:var(--criton-text-dim)] focus:outline-none focus:border-[color:var(--criton-gold)] transition-colors resize-y"
                ></textarea>
              </div>

              <p v-if="error" class="text-red-400 text-sm flex items-center gap-2">
                <i class="pi pi-exclamation-circle"></i>{{ error }}
              </p>

              <button
                type="submit"
                :disabled="submitting"
                class="criton-btn-primary"
              >
                <span v-if="submitting">Sending...</span>
                <span v-else>Send Message</span>
                <i class="pi pi-send text-xs"></i>
              </button>
            </form>
          </div>

          <!-- Contact Info Sidebar -->
          <div>
            <div class="criton-card rounded-xl p-8">
              <h3 class="font-display text-lg font-bold text-[color:var(--criton-ivory)] mb-6">Contact Info</h3>
              <div class="space-y-5">
                <a href="mailto:info@criton.ai" class="flex items-start gap-4 group">
                  <div class="w-10 h-10 bg-[color:var(--criton-surface-2)] border border-[color:var(--criton-border)] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:border-[color:var(--criton-gold)] transition-colors">
                    <i class="pi pi-envelope text-[color:var(--criton-gold)]"></i>
                  </div>
                  <div>
                    <p class="text-sm text-[color:var(--criton-text-dim)]">Email</p>
                    <p class="font-medium text-[color:var(--criton-ivory)] group-hover:text-[color:var(--criton-gold)] transition-colors">info@criton.ai</p>
                  </div>
                </a>
                <a href="tel:+18185316200" class="flex items-start gap-4 group">
                  <div class="w-10 h-10 bg-[color:var(--criton-surface-2)] border border-[color:var(--criton-border)] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:border-[color:var(--criton-gold)] transition-colors">
                    <i class="pi pi-phone text-[color:var(--criton-gold)]"></i>
                  </div>
                  <div>
                    <p class="text-sm text-[color:var(--criton-text-dim)]">Phone</p>
                    <p class="font-medium text-[color:var(--criton-ivory)] group-hover:text-[color:var(--criton-gold)] transition-colors">(818) 531-6200</p>
                  </div>
                </a>
                <div class="flex items-start gap-4">
                  <div class="w-10 h-10 bg-[color:var(--criton-surface-2)] border border-[color:var(--criton-border)] rounded-lg flex items-center justify-center flex-shrink-0">
                    <i class="pi pi-map-marker text-[color:var(--criton-gold)]"></i>
                  </div>
                  <div>
                    <p class="text-sm text-[color:var(--criton-text-dim)]">Location</p>
                    <p class="font-medium text-[color:var(--criton-ivory)]">Los Angeles, CA</p>
                  </div>
                </div>
              </div>
            </div>
            <p class="text-sm text-[color:var(--criton-text-dim)] mt-4 px-2 flex items-center gap-2">
              <i class="pi pi-clock"></i>
              We typically respond within one business day.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
