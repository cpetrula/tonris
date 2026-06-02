<script setup lang="ts">
import { RouterLink } from 'vue-router'

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

</script>

<template>
  <div class="bg-[color:var(--criton-bg)] text-[color:var(--criton-text)]">
    <!-- HERO -->
    <section class="criton-hero-bg relative overflow-hidden">
      <div class="max-w-6xl mx-auto px-6 lg:px-8 pt-28 pb-20 md:pt-36 md:pb-28 text-center">
        <div class="criton-pill mb-8">Our Story</div>
        <h1
          class="font-display font-bold text-4xl md:text-6xl lg:text-7xl leading-[1.08] tracking-tight mb-7 max-w-4xl mx-auto"
        >
          A small team building AI systems<br />
          <span class="italic criton-accent">that actually work.</span>
        </h1>
        <p
          class="text-lg md:text-xl text-[color:var(--criton-text-muted)] max-w-2xl mx-auto leading-relaxed"
        >
          We're based in Los Angeles. Our platforms are in production today, handling real calls,
          generating real content, and running real operations.
        </p>
      </div>
    </section>

    <!-- STORY SECTION -->
    <section class="py-24 md:py-32">
      <div class="max-w-6xl mx-auto px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p class="criton-eyebrow mb-4">Our approach</p>
            <h2 class="font-display font-bold text-3xl md:text-4xl leading-tight mb-8">
              We Build What Businesses<br />
              <span class="italic text-[color:var(--criton-text-muted)]">Actually Need</span>
            </h2>
            <div class="space-y-5 text-[color:var(--criton-text-muted)] leading-relaxed">
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
            </div>
          </div>

          <!-- Visual Card -->
          <div class="flex justify-center lg:justify-end">
            <div class="criton-card rounded-xl p-8 md:p-10 w-full max-w-sm">
              <div class="text-center mb-8">
                <div
                  class="w-16 h-16 mx-auto mb-4 bg-[color:var(--criton-surface-2)] border border-[color:var(--criton-border)] rounded-xl flex items-center justify-center"
                >
                  <i class="pi pi-code text-2xl text-[color:var(--criton-gold)]"></i>
                </div>
                <p class="criton-eyebrow">Criton.ai</p>
                <p class="font-display text-2xl font-bold text-[color:var(--criton-ivory)] mt-2">Est. 2024</p>
                <p class="text-[color:var(--criton-text-muted)]">Los Angeles, CA</p>
              </div>
              <div class="space-y-4">
                <div class="flex items-center gap-3 p-3 rounded-lg bg-[color:var(--criton-surface-2)] border border-[color:var(--criton-border)]">
                  <div class="w-10 h-10 rounded-lg bg-[color:var(--criton-bg)] flex items-center justify-center">
                    <i class="pi pi-box text-[color:var(--criton-gold)]"></i>
                  </div>
                  <div>
                    <p class="font-display text-xl font-bold text-[color:var(--criton-ivory)]">3</p>
                    <p class="text-sm text-[color:var(--criton-text-muted)]">Platforms Shipped</p>
                  </div>
                </div>
                <div class="flex items-center gap-3 p-3 rounded-lg bg-[color:var(--criton-surface-2)] border border-[color:var(--criton-border)]">
                  <div class="w-10 h-10 rounded-lg bg-[color:var(--criton-bg)] flex items-center justify-center">
                    <i class="pi pi-check-circle text-[color:var(--criton-gold)]"></i>
                  </div>
                  <div>
                    <p class="font-display text-xl font-bold text-[color:var(--criton-ivory)]">100%</p>
                    <p class="text-sm text-[color:var(--criton-text-muted)]">In Production</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- WHAT WE BELIEVE -->
    <section class="py-24 md:py-32 border-t border-[color:var(--criton-border)] bg-[color:var(--criton-surface)]">
      <div class="max-w-6xl mx-auto px-6 lg:px-8">
        <div class="text-center mb-16">
          <p class="criton-eyebrow mb-4">What we believe</p>
          <h2 class="font-display font-bold text-3xl md:text-4xl leading-tight">
            Three principles that<br />
            <span class="italic text-[color:var(--criton-text-muted)]">guide every build.</span>
          </h2>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <div
            v-for="(belief, i) in beliefs"
            :key="belief.title"
            class="criton-card rounded-lg p-8"
          >
            <div class="criton-eyebrow mb-4 text-[color:var(--criton-text-dim)]">0{{ i + 1 }}</div>
            <div class="w-12 h-12 mb-5 bg-[color:var(--criton-surface-2)] border border-[color:var(--criton-border)] rounded-lg flex items-center justify-center">
              <i :class="[belief.icon, 'text-xl text-[color:var(--criton-gold)]']"></i>
            </div>
            <h3 class="font-display text-xl font-bold text-[color:var(--criton-ivory)] mb-3">{{ belief.title }}</h3>
            <p class="text-sm text-[color:var(--criton-text-muted)] leading-relaxed">{{ belief.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="relative overflow-hidden border-t border-[color:var(--criton-border)]">
      <div class="criton-hero-bg absolute inset-0 opacity-60"></div>
      <div class="relative max-w-4xl mx-auto px-6 lg:px-8 py-24 md:py-32 text-center">
        <h2 class="font-display font-bold text-3xl md:text-5xl leading-tight mb-6">
          Want to work<br />
          <span class="italic criton-accent">with us?</span>
        </h2>
        <p class="text-lg text-[color:var(--criton-text-muted)] max-w-xl mx-auto mb-10">
          We take on a handful of projects at a time so we can build them right.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <RouterLink to="/contact" class="criton-btn-primary">
            Get in Touch
            <i class="pi pi-arrow-right text-xs"></i>
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>
