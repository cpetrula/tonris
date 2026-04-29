<script setup lang="ts">
import { RouterLink } from 'vue-router'

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
  <div class="bg-[color:var(--criton-bg)] text-[color:var(--criton-text)]">
    <!-- HERO -->
    <section class="criton-hero-bg relative overflow-hidden">
      <div class="max-w-6xl mx-auto px-6 lg:px-8 pt-28 pb-16 md:pt-36 md:pb-20 text-center">
        <div class="criton-pill mb-8">Case Studies</div>
        <h1
          class="font-display font-bold text-4xl md:text-6xl lg:text-7xl leading-[1.08] tracking-tight mb-7 max-w-4xl mx-auto"
        >
          Our<br />
          <span class="italic criton-accent">Work</span>
        </h1>
        <p
          class="text-lg md:text-xl text-[color:var(--criton-text-muted)] max-w-2xl mx-auto leading-relaxed"
        >
          Custom AI platforms built for real businesses. Here's what we've shipped.
        </p>
      </div>
    </section>

    <!-- WHAT WE CAN BUILD -->
    <section class="py-24 md:py-32 border-t border-[color:var(--criton-border)]">
      <div class="max-w-6xl mx-auto px-6 lg:px-8">
        <div class="text-center mb-16">
          <p class="criton-eyebrow mb-4">Capabilities</p>
          <h2 class="font-display font-bold text-3xl md:text-4xl leading-tight">
            What We Can Build<br />
            <span class="italic text-[color:var(--criton-text-muted)]">For You</span>
          </h2>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="capability in capabilities"
            :key="capability.title"
            class="criton-card rounded-lg p-7"
          >
            <div class="w-12 h-12 mb-5 bg-[color:var(--criton-surface-2)] border border-[color:var(--criton-border)] rounded-lg flex items-center justify-center">
              <i :class="[capability.icon, 'text-xl text-[color:var(--criton-gold)]']"></i>
            </div>
            <h3 class="font-display text-lg font-bold text-[color:var(--criton-ivory)] mb-2">
              {{ capability.title }}
            </h3>
            <p class="text-sm text-[color:var(--criton-text-muted)] leading-relaxed">
              {{ capability.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="relative overflow-hidden border-t border-[color:var(--criton-border)]">
      <div class="criton-hero-bg absolute inset-0 opacity-60"></div>
      <div class="relative max-w-4xl mx-auto px-6 lg:px-8 py-24 md:py-32 text-center">
        <h2 class="font-display font-bold text-3xl md:text-5xl leading-tight mb-6">
          Have a problem<br />
          <span class="italic criton-accent">AI can solve?</span>
        </h2>
        <p class="text-lg text-[color:var(--criton-text-muted)] max-w-xl mx-auto mb-10">
          We'll scope it, build it, and run it.
        </p>
        <RouterLink to="/contact" class="criton-btn-primary">
          Get in Touch
          <i class="pi pi-arrow-right text-xs"></i>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
