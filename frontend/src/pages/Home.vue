<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Button from 'primevue/button'

const capabilities = [
  {
    icon: 'pi pi-phone',
    title: 'AI Voice & Phone Systems',
    description: 'Smart call routing, multilingual AI agents with 70+ language voices, and 24/7 coverage that never misses a call.',
    color: 'violet'
  },
  {
    icon: 'pi pi-video',
    title: 'AI Content & Video Generation',
    description: 'Text-to-video with Sora, AI image generation, and automated social media publishing across every platform.',
    color: 'cyan'
  },
  {
    icon: 'pi pi-th-large',
    title: 'Custom Dashboards & Workflows',
    description: 'Production management, scheduling, team collaboration tools — built around how your business actually operates.',
    color: 'fuchsia'
  },
  {
    icon: 'pi pi-file-edit',
    title: 'Compliance & Document Automation',
    description: 'E-signatures, crew onboarding, regulatory forms, and compliance tracking — all digitized and automated.',
    color: 'amber'
  }
]

const projects = [
  {
    title: 'ProdComm — AI Production Office',
    subtitle: 'Film & Television',
    description:
      'One platform replacing fragmented production tools. AI-powered phone system, call sheets, shooting schedules, crew onboarding, cast tracking, and compliance — all from one dashboard.',
    link: 'https://prodcomm.com',
    linkLabel: 'Visit prodcomm.com',
    tags: ['AI Voice', 'Workflow Automation', 'Compliance']
  },
  {
    title: 'AI Video & Content Studio',
    subtitle: 'Luxury Automotive',
    description:
      'End-to-end AI content pipeline. Generate cinematic videos with Sora, create product imagery, schedule and publish across Instagram, YouTube, TikTok, and Facebook — with analytics and team collaboration built in.',
    link: null,
    linkLabel: null,
    tags: ['Video Generation', 'Social Media', 'Analytics']
  }
]

const differentiators = [
  {
    icon: 'pi pi-briefcase',
    title: 'Built for Your Industry',
    description:
      "We don't sell generic tools. Every platform is designed around how your industry actually works."
  },
  {
    icon: 'pi pi-bolt',
    title: 'AI That Does the Work',
    description:
      'Not chatbots. Real AI systems that generate content, manage workflows, and handle operations autonomously.'
  },
  {
    icon: 'pi pi-server',
    title: 'One Team, Full Stack',
    description:
      'From voice AI to frontend dashboards to deployment. We build and run the whole thing.'
  }
]

const colorMap: Record<string, { bg: string; text: string }> = {
  violet: { bg: 'bg-violet-100', text: 'text-violet-600' },
  cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
  fuchsia: { bg: 'bg-fuchsia-100', text: 'text-fuchsia-600' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600' }
}
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-violet-700 text-white py-20 md:py-32">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-4xl mx-auto leading-tight">
          We Build AI Systems That Run Your Business
        </h1>
        <p class="text-lg md:text-xl text-violet-100 mb-10 max-w-2xl mx-auto">
          Criton is an AI studio that builds custom platforms for your industry — not off-the-shelf SaaS, but systems engineered to do the actual work.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#portfolio">
            <Button
              label="See Our Work"
              icon="pi pi-arrow-down"
              icon-pos="right"
              size="large"
              class="px-8 py-3 !bg-white !text-violet-600 hover:!bg-violet-50"
            />
          </a>
          <RouterLink to="/contact">
            <Button
              label="Get in Touch"
              severity="secondary"
              outlined
              size="large"
              class="px-8 py-3 !text-white !border-white hover:!bg-white/10"
            />
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- What We Do Section -->
    <section class="py-16 md:py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-14">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What We Build</h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            End-to-end AI platforms tailored to your operations — voice, video, workflows, and compliance.
          </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div
            v-for="cap in capabilities"
            :key="cap.title"
            class="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div
              class="w-14 h-14 mb-5 rounded-full flex items-center justify-center"
              :class="[colorMap[cap.color].bg]"
            >
              <i :class="[cap.icon, 'text-2xl', colorMap[cap.color].text]"></i>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ cap.title }}</h3>
            <p class="text-gray-600 text-sm leading-relaxed">{{ cap.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Portfolio / Our Work Section -->
    <section id="portfolio" class="py-16 md:py-24 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-14">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Work</h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Custom AI platforms we have built and shipped for real businesses.
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div
            v-for="project in projects"
            :key="project.title"
            class="bg-white rounded-xl shadow-lg p-8 flex flex-col"
          >
            <p class="text-sm font-medium text-violet-600 uppercase tracking-wide mb-1">
              {{ project.subtitle }}
            </p>
            <h3 class="text-xl font-bold text-gray-900 mb-3">{{ project.title }}</h3>
            <p class="text-gray-600 leading-relaxed mb-6 flex-1">{{ project.description }}</p>

            <div class="flex flex-wrap gap-2 mb-5">
              <span
                v-for="tag in project.tags"
                :key="tag"
                class="text-xs font-medium px-3 py-1 rounded-full bg-violet-100 text-violet-700"
              >
                {{ tag }}
              </span>
            </div>

            <a
              v-if="project.link"
              :href="project.link"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-violet-600 font-medium hover:text-violet-800 transition-colors"
            >
              {{ project.linkLabel }}
              <i class="pi pi-external-link text-sm"></i>
            </a>
            <span v-else class="text-sm text-gray-400 italic">Client project</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Criton Section -->
    <section class="py-16 md:py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-14">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Criton</h2>
        </div>

        <div class="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          <div v-for="item in differentiators" :key="item.title" class="text-center">
            <div class="w-14 h-14 mx-auto mb-5 bg-violet-100 rounded-full flex items-center justify-center">
              <i :class="[item.icon, 'text-2xl text-violet-600']"></i>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ item.title }}</h3>
            <p class="text-gray-600 leading-relaxed">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 md:py-24 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">Let's Build Something</h2>
        <p class="text-lg text-violet-100 mb-8 max-w-2xl mx-auto">
          Tell us what's slowing your business down. We'll show you how AI can fix it.
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
