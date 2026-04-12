<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Button from 'primevue/button'

const prodcommFeatures = [
  {
    title: 'AI Phone System',
    description: '24/7 intelligent call routing, 70+ languages',
    icon: 'pi pi-phone'
  },
  {
    title: 'Call Sheet Builder',
    description: 'SMS distribution, real-time confirmations',
    icon: 'pi pi-list'
  },
  {
    title: 'Shooting Schedule',
    description: 'Stripboard, auto-generated Day Out of Days',
    icon: 'pi pi-calendar'
  },
  {
    title: 'Crew Onboarding',
    description: 'Deal memos, W-4, I-9, e-signatures',
    icon: 'pi pi-users'
  },
  {
    title: 'Cast Tracker',
    description: 'Real-time 2nd AD status updates',
    icon: 'pi pi-map-marker'
  },
  {
    title: 'Safety & Compliance',
    description: 'Injury reporting, SAG-AFTRA Exhibit G, workers comp',
    icon: 'pi pi-shield'
  }
]

const videoStudioFeatures = [
  {
    title: 'AI Video Generation',
    description: 'Sora-powered, multiple formats and durations',
    icon: 'pi pi-video'
  },
  {
    title: 'Image Generation',
    description: 'DALL-E, Flux, multiple styles and scenes',
    icon: 'pi pi-image'
  },
  {
    title: 'Multi-Platform Publishing',
    description: 'Instagram, Facebook, YouTube, TikTok',
    icon: 'pi pi-share-alt'
  },
  {
    title: 'Content Calendar',
    description: 'Visual scheduling, drag-and-drop',
    icon: 'pi pi-calendar-plus'
  },
  {
    title: 'Analytics Dashboard',
    description: 'Views, engagement, cross-platform metrics',
    icon: 'pi pi-chart-bar'
  },
  {
    title: 'Team Workspaces',
    description: 'Roles, approval workflows, collaboration',
    icon: 'pi pi-sitemap'
  }
]

const capabilities = [
  {
    title: 'AI Voice Agents & Phone Systems',
    description: 'Intelligent call handling, routing, and conversational AI for any industry.',
    icon: 'pi pi-phone'
  },
  {
    title: 'Video & Content Generation',
    description: 'AI-powered video, image, and copy creation at scale.',
    icon: 'pi pi-video'
  },
  {
    title: 'Workflow Automation & Dashboards',
    description: 'Replace manual processes with intelligent automation and real-time visibility.',
    icon: 'pi pi-cog'
  },
  {
    title: 'Social Media Management',
    description: 'Multi-platform scheduling, publishing, and analytics in one place.',
    icon: 'pi pi-share-alt'
  },
  {
    title: 'Document & Compliance Automation',
    description: 'E-signatures, form generation, and regulatory compliance on autopilot.',
    icon: 'pi pi-file-edit'
  },
  {
    title: 'Custom AI Integrations',
    description: 'Connect AI capabilities to your existing tools and workflows.',
    icon: 'pi pi-bolt'
  }
]
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white py-16 md:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-6">
          Our Work
        </h1>
        <p class="text-xl text-violet-100 max-w-3xl mx-auto">
          Custom AI platforms built for real businesses. Here's what we've shipped.
        </p>
      </div>
    </section>

    <!-- Project 1 — ProdComm -->
    <section class="py-16 md:py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="rounded-xl border border-gray-200 overflow-hidden">
          <!-- Project Header -->
          <div class="p-8 md:p-10 border-b border-gray-100">
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <h2 class="text-3xl font-bold text-gray-900">ProdComm</h2>
                <p class="text-lg text-violet-600 font-medium mt-1">The AI Production Office</p>
              </div>
              <span class="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-700 rounded-full text-sm font-medium self-start">
                <i class="pi pi-building text-xs"></i>
                Film & Television Production
              </span>
            </div>

            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">The Problem</h3>
                <p class="text-gray-700 leading-relaxed">
                  Production offices run on fragmented tools — one vendor for phones, another for call sheets, spreadsheets for tracking, paper for compliance. Coordinators spend hours chasing confirmations and fielding the same questions.
                </p>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">The Solution</h3>
                <p class="text-gray-700 leading-relaxed">
                  A single platform that replaces it all. ProdComm gives productions a dedicated AI-powered phone number, automated call sheets with real-time confirmations, shooting schedules, crew onboarding, cast tracking, safety compliance, and document e-signatures — live in a day, not a week.
                </p>
              </div>
            </div>
          </div>

          <!-- Features Grid -->
          <div class="p-8 md:p-10 bg-gray-50">
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Key Features</h3>
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="feature in prodcommFeatures"
                :key="feature.title"
                class="flex items-start gap-3"
              >
                <div class="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i :class="[feature.icon, 'text-lg text-violet-600']"></i>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">{{ feature.title }}</h4>
                  <p class="text-sm text-gray-600 mt-0.5">{{ feature.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-8 md:p-10 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div class="flex flex-wrap gap-2">
              <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">AI Voice</span>
              <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Automation</span>
              <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">E-Signatures</span>
              <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">SMS</span>
              <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Scheduling</span>
              <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Compliance</span>
            </div>
            <a
              href="https://prodcomm.com"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-violet-600 font-medium hover:text-violet-700 transition-colors"
            >
              Visit prodcomm.com
              <i class="pi pi-external-link text-sm"></i>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Project 2 — AI Video & Content Studio -->
    <section class="py-16 md:py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="rounded-xl border border-gray-200 overflow-hidden bg-white">
          <!-- Project Header -->
          <div class="p-8 md:p-10 border-b border-gray-100">
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <h2 class="text-3xl font-bold text-gray-900">AI Video & Content Studio</h2>
              </div>
              <span class="inline-flex items-center gap-2 px-4 py-2 bg-fuchsia-50 text-fuchsia-700 rounded-full text-sm font-medium self-start">
                <i class="pi pi-car text-xs"></i>
                Luxury Automotive Dealership
              </span>
            </div>

            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">The Problem</h3>
                <p class="text-gray-700 leading-relaxed">
                  Creating high-quality video content for social media is expensive and slow. Dealerships need a constant stream of cinematic content across multiple platforms but can't afford full production crews.
                </p>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">The Solution</h3>
                <p class="text-gray-700 leading-relaxed">
                  An end-to-end AI content pipeline. Generate cinematic car videos with OpenAI Sora, create product imagery with DALL-E and Flux, then schedule and publish across Instagram, YouTube, TikTok, and Facebook — all from one dashboard with analytics and team collaboration.
                </p>
              </div>
            </div>
          </div>

          <!-- Features Grid -->
          <div class="p-8 md:p-10 bg-gray-50">
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Key Features</h3>
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="feature in videoStudioFeatures"
                :key="feature.title"
                class="flex items-start gap-3"
              >
                <div class="w-10 h-10 bg-fuchsia-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i :class="[feature.icon, 'text-lg text-fuchsia-600']"></i>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">{{ feature.title }}</h4>
                  <p class="text-sm text-gray-600 mt-0.5">{{ feature.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-8 md:p-10 border-t border-gray-100">
            <div class="flex flex-wrap gap-2">
              <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">AI Video</span>
              <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Image Generation</span>
              <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Social Media</span>
              <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Analytics</span>
              <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Content Pipeline</span>
              <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Multi-Platform</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- What We Can Build Section -->
    <section class="py-16 md:py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What We Can Build For You
          </h2>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="capability in capabilities"
            :key="capability.title"
            class="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div class="w-12 h-12 mb-4 bg-violet-100 rounded-lg flex items-center justify-center">
              <i :class="[capability.icon, 'text-xl text-violet-600']"></i>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              {{ capability.title }}
            </h3>
            <p class="text-gray-600">
              {{ capability.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 md:py-20 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">
          Have a Problem AI Can Solve?
        </h2>
        <p class="text-lg text-violet-100 mb-8 max-w-2xl mx-auto">
          We'll scope it, build it, and run it.
        </p>
        <RouterLink to="/contact">
          <Button
            label="Get in Touch"
            icon="pi pi-arrow-right"
            icon-pos="right"
            size="large"
            class="px-8 py-3 !bg-white !text-violet-600 hover:!bg-violet-50"
          />
        </RouterLink>
      </div>
    </section>
  </div>
</template>
