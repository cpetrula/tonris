<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Button from 'primevue/button'

const steps = [
  {
    number: 1,
    title: 'Sign Up & Set Up',
    description: 'Create your account and tell us about your business. Customize your AI assistant with your business name, hours, services, and preferred greeting.',
    icon: 'pi pi-user-plus',
    color: 'bg-violet-500'
  },
  {
    number: 2,
    title: 'Forward Your Calls',
    description: 'Forward your business phone to your new CRITON.AI number. Your AI assistant is ready to answer calls 24/7, even when you are busy or after hours.',
    icon: 'pi pi-phone',
    color: 'bg-cyan-500'
  },
  {
    number: 3,
    title: 'AI Handles Everything',
    description: 'Our AI assistant answers calls professionally, provides information about your services, and books appointments directly into your calendar.',
    icon: 'pi pi-bolt',
    color: 'bg-fuchsia-500'
  },
  {
    number: 4,
    title: 'You Focus on Business',
    description: 'Receive notifications of new bookings and messages. Review call transcripts and recordings. Never miss a customer opportunity again.',
    icon: 'pi pi-chart-line',
    color: 'bg-green-500'
  }
]

const features = [
  {
    title: 'Natural Language Understanding',
    description: 'Our AI understands context and can handle complex conversations, just like a human receptionist.',
    icon: 'pi pi-comments'
  },
  {
    title: 'Custom Business Rules',
    description: 'Set your business hours, services, pricing, and any special instructions for the AI to follow.',
    icon: 'pi pi-sliders-h'
  },
  {
    title: 'Smart Appointment Scheduling',
    description: 'Syncs with Google Calendar, Outlook, and other popular calendar apps in real-time.',
    icon: 'pi pi-calendar'
  },
  {
    title: 'Call Recording & Transcripts',
    description: 'Every call is recorded and transcribed, so you have a complete record of all interactions.',
    icon: 'pi pi-file-word'
  },
  {
    title: 'Instant Notifications',
    description: 'Get SMS or email alerts for new appointments, urgent messages, or specific keywords.',
    icon: 'pi pi-bell'
  },
  {
    title: 'Multi-Language Support',
    description: 'Serve customers in English and Spanish, with more languages coming soon.',
    icon: 'pi pi-globe'
  }
]

const demoPhoneNumber = '1-800-CRITON-1'
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white py-16 md:py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-6">
          How CRITON.AI Works
        </h1>
        <p class="text-xl text-violet-100 mb-8 max-w-3xl mx-auto">
          Get your AI-powered phone receptionist up and running in minutes. No technical expertise required.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <RouterLink to="/signup">
            <Button
              label="Start Free Trial"
              icon="pi pi-arrow-right"
              icon-pos="right"
              size="large"
              class="px-8 py-3"
            />
          </RouterLink>
          <a :href="`tel:18008667471`">
            <Button
              label="Call Demo Line"
              icon="pi pi-phone"
              severity="secondary"
              outlined
              size="large"
              class="px-8 py-3 !text-white !border-white hover:!bg-white/10"
            />
          </a>
        </div>
      </div>
    </section>

    <!-- Steps Section -->
    <section class="py-16 md:py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            Get Started in 4 Simple Steps
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            From sign-up to your first AI-answered call in under 10 minutes.
          </p>
        </div>

        <div class="space-y-12 md:space-y-0 md:grid md:grid-cols-4 md:gap-8">
          <div 
            v-for="(step, index) in steps" 
            :key="step.number"
            class="relative"
          >
            <!-- Connector Line (hidden on last item and mobile) -->
            <div 
              v-if="index < steps.length - 1"
              class="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-200"
            ></div>
            
            <div class="relative flex flex-col items-center text-center">
              <!-- Step Number -->
              <div 
                :class="[
                  'w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold z-10',
                  step.color
                ]"
              >
                <i :class="[step.icon, 'text-2xl']"></i>
              </div>
              
              <h3 class="mt-4 text-xl font-semibold text-gray-900">
                {{ step.title }}
              </h3>
              <p class="mt-2 text-gray-600">
                {{ step.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Demo Call Section -->
    <section class="py-16 md:py-20 bg-gray-50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl p-8 md:p-12 text-white text-center">
          <div class="w-20 h-20 mx-auto mb-6 bg-white rounded-full flex items-center justify-center">
            <i class="pi pi-phone text-4xl text-violet-600"></i>
          </div>
          <h2 class="text-3xl font-bold mb-4">
            Try It Yourself!
          </h2>
          <p class="text-violet-100 mb-6 max-w-xl mx-auto">
            Experience exactly what your customers will hear when they call your business. 
            Our demo line showcases the full AI assistant experience.
          </p>
          <a 
            href="tel:18008667471"
            class="inline-block bg-white text-violet-600 rounded-xl px-8 py-4 font-bold text-2xl hover:bg-violet-50 transition-colors"
          >
            {{ demoPhoneNumber }}
          </a>
          <p class="text-sm text-violet-200 mt-4">
            <i class="pi pi-info-circle mr-1"></i>
            Free call • No signup required • Available 24/7
          </p>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="py-16 md:py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            Powerful Features Built-In
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to provide exceptional customer service, automatically.
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            v-for="feature in features" 
            :key="feature.title"
            class="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div class="w-12 h-12 mb-4 bg-violet-100 rounded-lg flex items-center justify-center">
              <i :class="[feature.icon, 'text-xl text-violet-600']"></i>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              {{ feature.title }}
            </h3>
            <p class="text-gray-600">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Integration Section -->
    <section class="py-16 md:py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 mb-6">
              Works With Your Existing Setup
            </h2>
            <p class="text-lg text-gray-600 mb-6">
              CRITON.AI integrates seamlessly with your current phone system and business tools. 
              No need to change your phone number or learn new software.
            </p>
            <ul class="space-y-4">
              <li class="flex items-start gap-3">
                <div class="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i class="pi pi-check text-green-600 text-sm"></i>
                </div>
                <span class="text-gray-700">Keep your existing business phone number</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i class="pi pi-check text-green-600 text-sm"></i>
                </div>
                <span class="text-gray-700">Syncs with Google Calendar and Outlook</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i class="pi pi-check text-green-600 text-sm"></i>
                </div>
                <span class="text-gray-700">Works with any phone carrier or VoIP system</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i class="pi pi-check text-green-600 text-sm"></i>
                </div>
                <span class="text-gray-700">Set up in minutes, not days</span>
              </li>
            </ul>
          </div>
          <div class="bg-white rounded-2xl shadow-xl p-8">
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Popular Integrations</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 bg-gray-50 rounded-lg text-center">
                <i class="pi pi-google text-3xl text-gray-700 mb-2 block"></i>
                <span class="text-sm text-gray-600">Google Calendar</span>
              </div>
              <div class="p-4 bg-gray-50 rounded-lg text-center">
                <i class="pi pi-microsoft text-3xl text-gray-700 mb-2 block"></i>
                <span class="text-sm text-gray-600">Outlook</span>
              </div>
              <div class="p-4 bg-gray-50 rounded-lg text-center">
                <i class="pi pi-slack text-3xl text-gray-700 mb-2 block"></i>
                <span class="text-sm text-gray-600">Slack</span>
              </div>
              <div class="p-4 bg-gray-50 rounded-lg text-center">
                <i class="pi pi-envelope text-3xl text-gray-700 mb-2 block"></i>
                <span class="text-sm text-gray-600">Email</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 md:py-20 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">
          Ready to Get Started?
        </h2>
        <p class="text-lg text-violet-100 mb-8 max-w-2xl mx-auto">
          Join hundreds of businesses already using CRITON.AI to handle their calls professionally.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <RouterLink to="/signup">
            <Button
              label="Start Your Free Trial"
              icon="pi pi-arrow-right"
              icon-pos="right"
              size="large"
              class="px-8 py-3 !bg-white !text-violet-600 hover:!bg-violet-50"
            />
          </RouterLink>
          <RouterLink to="/faq">
            <Button
              label="View FAQ"
              severity="secondary"
              outlined
              size="large"
              class="px-8 py-3 !text-white !border-white hover:!bg-white/10"
            />
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>
