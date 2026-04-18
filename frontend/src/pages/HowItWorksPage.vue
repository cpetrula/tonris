<script setup lang="ts">
import { RouterLink } from 'vue-router'

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

    <!-- PROJECT 1: PRODCOMM -->
    <section class="py-16 md:py-24 border-t border-[color:var(--criton-border)]">
      <div class="max-w-6xl mx-auto px-6 lg:px-8">
        <div class="criton-card rounded-xl overflow-hidden">
          <!-- Project Header -->
          <div class="p-8 md:p-10 border-b border-[color:var(--criton-border)]">
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <h2 class="font-display text-3xl font-bold text-[color:var(--criton-ivory)]">ProdComm</h2>
                <p class="text-lg text-[color:var(--criton-gold)] font-medium mt-1">The AI Production Office</p>
              </div>
              <span class="criton-pill self-start">
                Film & Television
              </span>
            </div>

            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <p class="criton-eyebrow mb-3">The Problem</p>
                <p class="text-[color:var(--criton-text-muted)] leading-relaxed">
                  Production offices run on fragmented tools — one vendor for phones, another for call sheets, spreadsheets for tracking, paper for compliance. Coordinators spend hours chasing confirmations and fielding the same questions.
                </p>
              </div>
              <div>
                <p class="criton-eyebrow mb-3">The Solution</p>
                <p class="text-[color:var(--criton-text-muted)] leading-relaxed">
                  A single platform that replaces it all. ProdComm gives productions a dedicated AI-powered phone number, automated call sheets with real-time confirmations, shooting schedules, crew onboarding, cast tracking, safety compliance, and document e-signatures — live in a day, not a week.
                </p>
              </div>
            </div>
          </div>

          <!-- Features Grid -->
          <div class="p-8 md:p-10 bg-[color:var(--criton-surface-2)]">
            <p class="criton-eyebrow mb-6">Key Features</p>
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="feature in prodcommFeatures"
                :key="feature.title"
                class="flex items-start gap-3"
              >
                <div class="w-10 h-10 bg-[color:var(--criton-surface)] border border-[color:var(--criton-border)] rounded-lg flex items-center justify-center flex-shrink-0">
                  <i :class="[feature.icon, 'text-lg text-[color:var(--criton-gold)]']"></i>
                </div>
                <div>
                  <h4 class="font-medium text-[color:var(--criton-ivory)]">{{ feature.title }}</h4>
                  <p class="text-sm text-[color:var(--criton-text-muted)] mt-0.5">{{ feature.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-8 md:p-10 border-t border-[color:var(--criton-border)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div class="flex flex-wrap gap-2">
              <span class="text-[11px] tracking-wider uppercase px-2.5 py-1 rounded border border-[color:var(--criton-border)] text-[color:var(--criton-text-dim)]">AI Voice</span>
              <span class="text-[11px] tracking-wider uppercase px-2.5 py-1 rounded border border-[color:var(--criton-border)] text-[color:var(--criton-text-dim)]">Automation</span>
              <span class="text-[11px] tracking-wider uppercase px-2.5 py-1 rounded border border-[color:var(--criton-border)] text-[color:var(--criton-text-dim)]">E-Signatures</span>
              <span class="text-[11px] tracking-wider uppercase px-2.5 py-1 rounded border border-[color:var(--criton-border)] text-[color:var(--criton-text-dim)]">SMS</span>
              <span class="text-[11px] tracking-wider uppercase px-2.5 py-1 rounded border border-[color:var(--criton-border)] text-[color:var(--criton-text-dim)]">Scheduling</span>
            </div>
            <a
              href="https://prodcomm.com"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-[color:var(--criton-gold-bright)] hover:text-[color:var(--criton-ivory)] font-medium transition-colors"
            >
              Visit prodcomm.com
              <i class="pi pi-arrow-up-right text-xs"></i>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- PROJECT 2: AI VIDEO STUDIO -->
    <section class="py-16 md:py-24 border-t border-[color:var(--criton-border)] bg-[color:var(--criton-surface)]">
      <div class="max-w-6xl mx-auto px-6 lg:px-8">
        <div class="criton-card rounded-xl overflow-hidden">
          <!-- Project Header -->
          <div class="p-8 md:p-10 border-b border-[color:var(--criton-border)]">
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <h2 class="font-display text-3xl font-bold text-[color:var(--criton-ivory)]">AI Video & Content Studio</h2>
              </div>
              <span class="criton-pill self-start">
                Luxury Automotive
              </span>
            </div>

            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <p class="criton-eyebrow mb-3">The Problem</p>
                <p class="text-[color:var(--criton-text-muted)] leading-relaxed">
                  Creating high-quality video content for social media is expensive and slow. Dealerships need a constant stream of cinematic content across multiple platforms but can't afford full production crews.
                </p>
              </div>
              <div>
                <p class="criton-eyebrow mb-3">The Solution</p>
                <p class="text-[color:var(--criton-text-muted)] leading-relaxed">
                  An end-to-end AI content pipeline. Generate cinematic car videos with OpenAI Sora, create product imagery with DALL-E and Flux, then schedule and publish across Instagram, YouTube, TikTok, and Facebook — all from one dashboard with analytics and team collaboration.
                </p>
              </div>
            </div>
          </div>

          <!-- Features Grid -->
          <div class="p-8 md:p-10 bg-[color:var(--criton-surface-2)]">
            <p class="criton-eyebrow mb-6">Key Features</p>
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="feature in videoStudioFeatures"
                :key="feature.title"
                class="flex items-start gap-3"
              >
                <div class="w-10 h-10 bg-[color:var(--criton-surface)] border border-[color:var(--criton-border)] rounded-lg flex items-center justify-center flex-shrink-0">
                  <i :class="[feature.icon, 'text-lg text-[color:var(--criton-gold)]']"></i>
                </div>
                <div>
                  <h4 class="font-medium text-[color:var(--criton-ivory)]">{{ feature.title }}</h4>
                  <p class="text-sm text-[color:var(--criton-text-muted)] mt-0.5">{{ feature.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-8 md:p-10 border-t border-[color:var(--criton-border)]">
            <div class="flex flex-wrap gap-2">
              <span class="text-[11px] tracking-wider uppercase px-2.5 py-1 rounded border border-[color:var(--criton-border)] text-[color:var(--criton-text-dim)]">AI Video</span>
              <span class="text-[11px] tracking-wider uppercase px-2.5 py-1 rounded border border-[color:var(--criton-border)] text-[color:var(--criton-text-dim)]">Image Gen</span>
              <span class="text-[11px] tracking-wider uppercase px-2.5 py-1 rounded border border-[color:var(--criton-border)] text-[color:var(--criton-text-dim)]">Social Media</span>
              <span class="text-[11px] tracking-wider uppercase px-2.5 py-1 rounded border border-[color:var(--criton-border)] text-[color:var(--criton-text-dim)]">Analytics</span>
              <span class="text-[11px] tracking-wider uppercase px-2.5 py-1 rounded border border-[color:var(--criton-border)] text-[color:var(--criton-text-dim)]">Multi-Platform</span>
            </div>
          </div>
        </div>
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
