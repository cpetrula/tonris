<script setup lang="ts">
import { RouterLink } from 'vue-router'

const capabilities = [
  {
    icon: 'pi pi-box',
    title: 'Custom SaaS Platforms',
    description:
      'Full-stack web products tailored to your operations. We own every layer — database, API, frontend, and deployment.'
  },
  {
    icon: 'pi pi-microphone',
    title: 'Voice AI & Telephony',
    description:
      'ElevenLabs + Twilio systems that answer real calls in 70+ languages, book appointments, and route to humans when it matters.'
  },
  {
    icon: 'pi pi-mobile',
    title: 'Native Mobile Apps',
    description:
      'iOS and Android from a single codebase via Capacitor. We ship to the App Store and Play Store on your behalf.'
  },
  {
    icon: 'pi pi-video',
    title: 'AI Content Engines',
    description:
      'Text-to-video with Sora, generative imagery, and automated multi-platform publishing — turning content production into a workflow.'
  }
]

const process = [
  {
    num: '01',
    title: 'Discover',
    description:
      'Deep domain immersion. We map your operations, users, and the AI touchpoints that will actually move the needle.'
  },
  {
    num: '02',
    title: 'Design',
    description:
      'Clickable prototypes and brand direction by week two. Fast feedback loops, no big-reveal theatrics.'
  },
  {
    num: '03',
    title: 'Build',
    description:
      'A weekly shipping cadence. You watch the product come together in a live staging environment.'
  },
  {
    num: '04',
    title: 'Ship & Run',
    description:
      "We deploy, monitor, and iterate. Criton runs the infrastructure so your team doesn't become a DevOps team."
  }
]

const differentiators = [
  {
    title: 'Full-stack ownership',
    description:
      'Voice AI to frontend to deployment — one team, one contract. Nothing lands on your plate to integrate later.'
  },
  {
    title: 'AI that ships, not demos',
    description:
      'Every project on this page is in production with real users. No sizzle reels, no vaporware.'
  },
  {
    title: 'Brand-forward builds',
    description:
      'Your product looks like it belongs to your company, not ours. Templates are the enemy.'
  }
]
</script>

<template>
  <div class="bg-[color:var(--criton-bg)] text-[color:var(--criton-text)]">
    <!-- HERO -->
    <section class="criton-hero-bg relative overflow-hidden">
      <div class="max-w-6xl mx-auto px-6 lg:px-8 pt-28 pb-24 md:pt-36 md:pb-32 text-center">
        <div class="criton-pill mb-8">AI Studio · Los Angeles</div>
        <h1
          class="font-display font-bold text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] tracking-tight mb-7 max-w-5xl mx-auto"
        >
          We build the AI products<br />
          <span class="italic criton-accent">your company</span> runs on.
        </h1>
        <p
          class="text-lg md:text-xl text-[color:var(--criton-text-muted)] max-w-2xl mx-auto mb-11 leading-relaxed"
        >
          Criton is an AI studio. We design, build, and ship custom platforms — from voice AI
          telephony to native mobile apps — for companies that want to own the product, not rent it.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <RouterLink to="/contact" class="criton-btn-primary">
            Start a project
            <i class="pi pi-arrow-right text-xs"></i>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- WHAT WE BUILD -->
    <section class="py-24 md:py-32">
      <div class="max-w-6xl mx-auto px-6 lg:px-8">
        <div class="max-w-2xl mb-16">
          <p class="criton-eyebrow mb-4">What we build</p>
          <h2 class="font-display font-bold text-4xl md:text-5xl leading-tight">
            Four disciplines.<br />
            <span class="italic text-[color:var(--criton-text-muted)]">One team.</span>
          </h2>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div
            v-for="cap in capabilities"
            :key="cap.title"
            class="criton-card rounded-lg p-7"
          >
            <div class="w-10 h-10 rounded-md bg-[color:var(--criton-surface-2)] border border-[color:var(--criton-border)] flex items-center justify-center mb-6">
              <i :class="[cap.icon, 'text-lg text-[color:var(--criton-gold)]']"></i>
            </div>
            <h3 class="font-display text-xl font-bold mb-3 leading-tight">{{ cap.title }}</h3>
            <p class="text-sm text-[color:var(--criton-text-muted)] leading-relaxed">
              {{ cap.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- PROCESS -->
    <section class="py-24 md:py-32 border-t border-[color:var(--criton-border)]">
      <div class="max-w-6xl mx-auto px-6 lg:px-8">
        <div class="max-w-2xl mb-16">
          <p class="criton-eyebrow mb-4">How we work</p>
          <h2 class="font-display font-bold text-4xl md:text-5xl leading-tight">
            From signed engagement<br />
            <span class="italic text-[color:var(--criton-text-muted)]">to production — in weeks.</span>
          </h2>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
          <div v-for="step in process" :key="step.num">
            <div class="font-display text-5xl text-[color:var(--criton-gold)] mb-3 leading-none">
              {{ step.num }}
            </div>
            <h3 class="font-display font-bold text-2xl mb-3">{{ step.title }}</h3>
            <p class="text-sm text-[color:var(--criton-text-muted)] leading-relaxed">
              {{ step.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- WHY CRITON -->
    <section class="py-24 md:py-32 border-t border-[color:var(--criton-border)] bg-[color:var(--criton-surface)]">
      <div class="max-w-6xl mx-auto px-6 lg:px-8">
        <div class="grid lg:grid-cols-3 gap-12 lg:gap-16">
          <div>
            <p class="criton-eyebrow mb-4">Why Criton</p>
            <h2 class="font-display font-bold text-4xl md:text-5xl leading-tight">
              The agency <span class="italic">you hire</span> to build the thing that matters.
            </h2>
          </div>

          <div class="lg:col-span-2 grid sm:grid-cols-1 md:grid-cols-3 gap-8">
            <div
              v-for="(item, i) in differentiators"
              :key="item.title"
              class="border-t border-[color:var(--criton-border-bright)] pt-6"
            >
              <div class="criton-eyebrow mb-3 text-[color:var(--criton-text-dim)]">0{{ i + 1 }}</div>
              <h3 class="font-display font-bold text-xl mb-3 leading-snug">{{ item.title }}</h3>
              <p class="text-sm text-[color:var(--criton-text-muted)] leading-relaxed">
                {{ item.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FINAL CTA -->
    <section class="relative overflow-hidden border-t border-[color:var(--criton-border)]">
      <div class="criton-hero-bg absolute inset-0 opacity-60"></div>
      <div class="relative max-w-4xl mx-auto px-6 lg:px-8 py-24 md:py-32 text-center">
        <h2 class="font-display font-bold text-4xl md:text-6xl leading-tight mb-6">
          Have something<br />
          <span class="italic criton-accent">worth building?</span>
        </h2>
        <p class="text-lg text-[color:var(--criton-text-muted)] max-w-xl mx-auto mb-10">
          Tell us what you're working on. We'll tell you whether — and how — we'd build it.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <RouterLink to="/contact" class="criton-btn-primary">
            Start a project
            <i class="pi pi-arrow-right text-xs"></i>
          </RouterLink>
          <a href="mailto:info@criton.ai" class="criton-btn-ghost">
            <i class="pi pi-envelope text-xs"></i>
            info@criton.ai
          </a>
        </div>
      </div>
    </section>
  </div>
</template>
