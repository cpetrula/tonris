<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Button from 'primevue/button'
import QrcodeVue from 'qrcode.vue'

const demoPhoneNumber = '1-424-283-9238'
const demoPhoneNumberFormatted = '1-424-283-9238'
const demoPhoneTelLink = 'tel:+14242839238'

const benefits = [
  {
    icon: 'pi pi-clock',
    title: 'Never Miss a Call Again',
    description: 'AI answers 24/7, even during holidays and after hours'
  },
  {
    icon: 'pi pi-calendar',
    title: 'Instant Appointment Booking',
    description: 'Customers book appointments directly during the call'
  },
  {
    icon: 'pi pi-dollar',
    title: 'Save Thousands Monthly',
    description: 'A fraction of the cost of hiring a full-time receptionist'
  },
  {
    icon: 'pi pi-star',
    title: 'Professional First Impression',
    description: 'Every caller gets a friendly, consistent experience'
  }
]

const employeeCostComparison = {
  employee: {
    hourlyWage: 15,
    hoursPerWeek: 40,
    weeksPerYear: 52,
    get annualCost() {
      return this.hourlyWage * this.hoursPerWeek * this.weeksPerYear
    },
    get monthlyCost() {
      return Math.round(this.annualCost / 12)
    }
  },
  critonAI: {
    monthlyCost: 149, // Professional plan price
    get annualCost() {
      return this.monthlyCost * 12
    }
  }
}
</script>

<template>
  <div>
    <!-- Hero Section - Above the Fold -->
    <section class="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-violet-700 text-white py-12 md:py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Left Column - Value Props -->
          <div>
            <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
              Your AI Phone Receptionist That Never Sleeps
            </h1>
            <p class="text-lg md:text-xl text-violet-100 mb-8">
              Stop losing customers to missed calls. CRITON.AI answers every call professionally, books appointments, and saves you thousands.
            </p>
            
            <!-- Benefits List -->
            <ul class="space-y-4 mb-8">
              <li v-for="benefit in benefits" :key="benefit.title" class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i :class="[benefit.icon, 'text-white']"></i>
                </div>
                <div>
                  <span class="font-semibold text-white">{{ benefit.title }}</span>
                  <p class="text-sm text-violet-200">{{ benefit.description }}</p>
                </div>
              </li>
            </ul>

            <div class="flex flex-col sm:flex-row gap-4">
              <RouterLink to="/signup">
                <Button
                  label="Start 15-Day Free Trial"
                  icon="pi pi-arrow-right"
                  icon-pos="right"
                  size="large"
                  class="px-8 py-3 w-full sm:w-auto"
                />
              </RouterLink>
              <RouterLink to="/how-it-works">
                <Button
                  label="See How It Works"
                  severity="secondary"
                  outlined
                  size="large"
                  class="px-8 py-3 w-full sm:w-auto !text-white !border-white hover:!bg-white/10"
                />
              </RouterLink>
            </div>
          </div>

          <!-- Right Column - Demo Phone CTA -->
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div class="text-center">
              <div class="w-20 h-20 mx-auto mb-6 bg-white rounded-full flex items-center justify-center">
                <i class="pi pi-phone text-4xl text-violet-600"></i>
              </div>
              <h2 class="text-2xl md:text-3xl font-bold mb-3">
                Try It Right Now!
              </h2>
              <p class="text-violet-100 mb-6">
                Call now to hear exactly what your customers will experience!
              </p>
              
              <!-- Demo Phone Number -->
              <a 
                :href="`tel:${demoPhoneNumberFormatted.replace(/-/g, '')}`"
                class="block bg-white text-violet-600 rounded-xl p-6 hover:bg-violet-50 transition-colors mb-4"
              >
                <span class="text-sm text-gray-500 block mb-1">Demo Phone Number</span>
                <span class="text-3xl md:text-4xl font-bold tracking-wide">{{ demoPhoneNumber }}</span>
                <!-- <span class="text-sm text-gray-500 block mt-1">({{ demoPhoneNumberFormatted }})</span> -->
              </a>

              <!-- QR Code -->
              <div class="bg-white rounded-xl p-4 inline-block mb-4">
                <QrcodeVue 
                  :value="demoPhoneTelLink" 
                  :size="120"
                  level="M"
                  render-as="svg"
                />
                <p class="text-xs text-gray-500 mt-2">Scan to call</p>
              </div>
              
              <p class="text-sm text-violet-200">
                <i class="pi pi-info-circle mr-1"></i>
                Free demo call • No signup required
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 md:py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            Everything Your Business Needs
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Professional call handling that works around the clock, so you can focus on what matters.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div class="w-16 h-16 mx-auto mb-4 bg-violet-100 rounded-full flex items-center justify-center">
              <i class="pi pi-phone text-3xl text-violet-600"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">24/7 Call Answering</h3>
            <p class="text-gray-600">
              Never miss another call. Our AI answers professionally day and night, weekends and holidays.
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div class="w-16 h-16 mx-auto mb-4 bg-cyan-100 rounded-full flex items-center justify-center">
              <i class="pi pi-calendar-plus text-3xl text-cyan-600"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Smart Scheduling</h3>
            <p class="text-gray-600">
              Callers book appointments directly. Manage everything from your dashboard.
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div class="w-16 h-16 mx-auto mb-4 bg-fuchsia-100 rounded-full flex items-center justify-center">
              <i class="pi pi-comments text-3xl text-fuchsia-600"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Natural Conversations</h3>
            <p class="text-gray-600">
              Human-like interactions that leave callers impressed. Customized to your business.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section - Teaser -->
    <section class="py-16 md:py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Professional call handling at a fraction of the cost of hiring staff. Plans starting at just $79/month.
          </p>
        </div>

        <!-- Pricing Teaser Cards -->
        <div class="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          <div class="bg-white rounded-xl p-6 text-center border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Starter</h3>
            <div class="mb-3">
              <span class="text-3xl font-bold text-gray-900">$79</span>
              <span class="text-gray-500">/mo</span>
            </div>
            <p class="text-sm text-gray-600">200 minutes included</p>
          </div>
          
          <div class="bg-white rounded-xl p-6 text-center border-2 border-violet-500 relative">
            <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-violet-500 text-white text-xs px-3 py-1 rounded-full">
              Most Popular
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Professional</h3>
            <div class="mb-3">
              <span class="text-3xl font-bold text-gray-900">$149</span>
              <span class="text-gray-500">/mo</span>
            </div>
            <p class="text-sm text-gray-600">500 minutes included</p>
          </div>
          
          <div class="bg-white rounded-xl p-6 text-center border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Business</h3>
            <div class="mb-3">
              <span class="text-3xl font-bold text-gray-900">$299</span>
              <span class="text-gray-500">/mo</span>
            </div>
            <p class="text-sm text-gray-600">1,500 minutes included</p>
          </div>
        </div>

        <div class="text-center">
          <RouterLink to="/pricing">
            <Button
              label="View Full Pricing & Features"
              icon="pi pi-arrow-right"
              icon-pos="right"
              size="large"
              class="px-8"
            />
          </RouterLink>
          <p class="text-sm text-gray-500 mt-4">
            15-day free trial • No credit card required • Cancel anytime
          </p>
        </div>

        <!-- Cost Comparison Section -->
        <div class="bg-white rounded-2xl p-8 md:p-12 shadow-lg max-w-4xl mx-auto">
          <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">
            Compare the Savings
          </h3>
          <div class="grid md:grid-cols-2 gap-8">
            <!-- Employee Cost -->
            <div class="bg-red-50 rounded-xl p-6 border-2 border-red-200">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <i class="pi pi-user text-2xl text-red-500"></i>
                </div>
                <h4 class="text-lg font-semibold text-gray-900">Full-Time Receptionist</h4>
              </div>
              <div class="space-y-2 text-gray-700 mb-4">
                <p class="flex justify-between">
                  <span>Hourly wage (min wage)</span>
                  <span>${{ employeeCostComparison.employee.hourlyWage }}/hr</span>
                </p>
                <p class="flex justify-between">
                  <span>Hours per week</span>
                  <span>{{ employeeCostComparison.employee.hoursPerWeek }} hrs</span>
                </p>
                <p class="flex justify-between">
                  <span>+ Benefits, taxes, PTO</span>
                  <span>~20%</span>
                </p>
              </div>
              <div class="border-t border-red-200 pt-4">
                <p class="flex justify-between items-center">
                  <span class="font-semibold text-black">Monthly cost</span>
                  <span class="text-2xl font-bold text-red-600">${{ employeeCostComparison.employee.monthlyCost.toLocaleString() }}+</span>
                </p>
              </div>
              <p class="text-sm text-red-600 mt-2">
                <i class="pi pi-exclamation-circle mr-1"></i>
                Only covers 40 hrs/week, not 24/7
              </p>
            </div>

            <!-- CRITON.AI Cost -->
            <div class="bg-green-50 rounded-xl p-6 border-2 border-green-200">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <i class="pi pi-bolt text-2xl text-green-500"></i>
                </div>
                <h4 class="text-lg font-semibold text-gray-900">CRITON.AI Assistant</h4>
              </div>
              <div class="space-y-2 text-gray-700 mb-4">
                <p class="flex justify-between">
                  <span>24/7 coverage</span>
                  <span class="text-green-600">✓</span>
                </p>
                <p class="flex justify-between">
                  <span>No sick days or PTO</span>
                  <span class="text-green-600">✓</span>
                </p>
                <p class="flex justify-between">
                  <span>Instant appointment booking</span>
                  <span class="text-green-600">✓</span>
                </p>
              </div>
              <div class="border-t border-green-200 pt-4">
                <p class="flex justify-between items-center">
                  <span class="font-semibold text-black">Monthly cost</span>
                  <span class="text-2xl font-bold text-green-600">${{ employeeCostComparison.critonAI.monthlyCost }}</span>
                </p>
              </div>
              <p class="text-sm text-green-600 mt-2">
                <i class="pi pi-check-circle mr-1"></i>
                Full 24/7/365 coverage included
              </p>
            </div>
          </div>

          <div class="mt-8 text-center">
            <p class="text-2xl font-bold text-violet-600 mb-4">
              Save over ${{ (employeeCostComparison.employee.monthlyCost - employeeCostComparison.critonAI.monthlyCost).toLocaleString() }}/month
            </p>
            <RouterLink to="/signup">
              <Button
                label="Start Saving Today"
                icon="pi pi-arrow-right"
                icon-pos="right"
                size="large"
                class="px-8"
              />
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 md:py-20 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">
          Ready to Never Miss Another Call?
        </h2>
        <p class="text-lg text-violet-100 mb-8 max-w-2xl mx-auto">
          Join hundreds of businesses who trust CRITON.AI to handle their calls professionally, 24/7.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <RouterLink to="/signup">
            <Button
              label="Start Your Free Trial"
              icon="pi pi-arrow-right"
              icon-pos="right"
              size="large"
              class="px-8 py-3 !bg-white !text-violet-600 hover:!bg-violet-50"
            />
          </RouterLink>
          <a 
            :href="`tel:${demoPhoneNumberFormatted.replace(/-/g, '')}`"
            class="inline-flex items-center gap-2 text-white hover:text-violet-100 transition-colors"
          >
            <i class="pi pi-phone"></i>
            <span>Or call our demo: {{ demoPhoneNumber }}</span>
          </a>
        </div>
      </div>
    </section>
  </div>
</template>
<style scoped>
.pi-phone {
  font-size:2rem;
}
</style>