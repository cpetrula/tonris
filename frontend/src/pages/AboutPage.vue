<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Button from 'primevue/button'

const beliefs = [
  {
    icon: 'pi pi-building',
    title: 'Industry First, Technology Second',
    description:
      "We don't start with AI and look for problems. We start with your industry, learn the workflows, and then build AI systems that fit.",
  },
  {
    icon: 'pi pi-bolt',
    title: 'Ship Fast, Iterate Often',
    description:
      'We get working software in your hands quickly. Then we refine based on real usage, not assumptions.',
  },
  {
    icon: 'pi pi-server',
    title: 'Own the Whole Stack',
    description:
      "We don't hand off half-built prototypes. We design, build, deploy, and maintain — so nothing falls through the cracks.",
  },
]

const projects = [
  {
    title: 'ProdComm',
    subtitle: 'AI Production Office for Film & TV',
    externalUrl: 'https://prodcomm.com',
  },
  {
    title: 'AI Video & Content Studio',
    subtitle: 'Luxury Automotive',
    externalUrl: null,
  },
]
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section
      class="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-violet-700 text-white py-20 md:py-28"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">About Criton.ai</h1>
        <p class="text-xl md:text-2xl text-violet-100 max-w-2xl mx-auto">
          A small team building AI systems that actually work.
        </p>
      </div>
    </section>

    <!-- Story Section -->
    <section class="py-16 md:py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <!-- Text -->
          <div>
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              We Build What Businesses Actually Need
            </h2>
            <div class="space-y-4 text-gray-600 text-lg leading-relaxed">
              <p>
                We started by building AI phone assistants for local businesses — and quickly
                realized the opportunity was bigger than answering calls. Every industry we talked to
                had the same problem: fragmented tools, manual workflows, and no good way to use AI
                beyond a chatbot.
              </p>
              <p>
                So we became the team that builds the whole thing. Voice systems, content pipelines,
                dashboards, compliance tools — custom AI platforms designed around how your business
                actually operates.
              </p>
              <p>
                We're based in Los Angeles and work with clients across industries. Our platforms are
                in production today, handling real calls, generating real content, and running real
                operations.
              </p>
            </div>
          </div>

          <!-- Visual Card -->
          <div class="flex justify-center lg:justify-end">
            <div
              class="bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl p-8 md:p-10 border border-violet-100 w-full max-w-sm"
            >
              <div class="text-center mb-8">
                <div
                  class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center"
                >
                  <i class="pi pi-code text-2xl text-white"></i>
                </div>
                <p class="text-sm font-medium text-violet-600 uppercase tracking-wider">
                  Criton.ai
                </p>
                <p class="text-2xl font-bold text-gray-900 mt-1">Est. 2024</p>
                <p class="text-gray-500">Los Angeles, CA</p>
              </div>
              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0"
                  >
                    <i class="pi pi-box text-violet-600"></i>
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-gray-900">2</p>
                    <p class="text-sm text-gray-500">Platforms Shipped</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-lg bg-fuchsia-100 flex items-center justify-center flex-shrink-0"
                  >
                    <i class="pi pi-check-circle text-fuchsia-600"></i>
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-gray-900">100%</p>
                    <p class="text-sm text-gray-500">In Production</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0"
                  >
                    <i class="pi pi-globe text-violet-600"></i>
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-gray-900">Full-Stack</p>
                    <p class="text-sm text-gray-500">Design to Deployment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- What We Believe Section -->
    <section class="py-16 md:py-24 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What We Believe</h2>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div
            v-for="belief in beliefs"
            :key="belief.title"
            class="bg-white rounded-xl p-8 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div
              class="w-14 h-14 mb-5 bg-violet-100 rounded-xl flex items-center justify-center"
            >
              <i :class="[belief.icon, 'text-2xl text-violet-600']"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">{{ belief.title }}</h3>
            <p class="text-gray-600 leading-relaxed">{{ belief.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- What We've Built Section -->
    <section class="py-16 md:py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Platforms in Production
          </h2>
        </div>

        <div class="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div
            v-for="project in projects"
            :key="project.title"
            class="bg-gray-50 rounded-xl p-8 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ project.title }}</h3>
            <p class="text-gray-600 mb-4">{{ project.subtitle }}</p>
            <div class="flex items-center gap-4">
              <RouterLink
                to="/work"
                class="text-violet-600 font-medium hover:text-violet-700 transition-colors inline-flex items-center gap-1"
              >
                View Details <i class="pi pi-arrow-right text-sm"></i>
              </RouterLink>
              <a
                v-if="project.externalUrl"
                :href="project.externalUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-gray-500 hover:text-gray-700 transition-colors inline-flex items-center gap-1"
              >
                Visit Site <i class="pi pi-external-link text-sm"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 md:py-20 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">Want to Work With Us?</h2>
        <p class="text-lg text-violet-100 mb-8 max-w-2xl mx-auto">
          We take on a handful of projects at a time so we can build them right.
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
