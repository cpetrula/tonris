<script setup lang="ts">
// Private pitch page for Amanda Frances — not indexed.
import { onMounted } from 'vue'

onMounted(() => {
  // Set noindex meta for this page specifically
  const existing = document.querySelector('meta[name="robots"]')
  if (existing) existing.setAttribute('content', 'noindex, nofollow')
  else {
    const m = document.createElement('meta')
    m.name = 'robots'
    m.content = 'noindex, nofollow'
    document.head.appendChild(m)
  }
  document.title = 'Overflow × Amanda Frances — A Partnership Proposal'
})

const demoUrl = 'https://overflow-pitch.vercel.app'
const demoRegisterUrl = 'https://overflow-pitch.vercel.app/register'
</script>

<template>
  <div class="min-h-screen bg-stone-50 text-stone-900 font-sans">
    <!-- Hero -->
    <section class="pt-20 pb-16 px-6 md:px-8 max-w-2xl mx-auto text-center">
      <p class="font-display italic text-xs tracking-[0.3em] uppercase text-rose-600 mb-6">
        A Private Note for Amanda
      </p>
      <h1 class="font-display text-5xl md:text-6xl text-stone-900 tracking-tight leading-tight mb-6">
        Overflow <span class="text-rose-600">×</span> Amanda Frances
      </h1>
      <p class="text-xl text-stone-500 font-display italic leading-relaxed">
        The daily-practice layer your ladder is missing.
        <br />
        Already built. Already live. Ready to be yours.
      </p>
    </section>

    <!-- Diagnosis -->
    <section class="py-12 px-6 md:px-8 max-w-2xl mx-auto border-t border-stone-200">
      <p class="font-display italic text-xs tracking-[0.3em] uppercase text-rose-600 mb-4">
        What I Noticed
      </p>
      <h2 class="font-display text-3xl md:text-4xl text-stone-900 mb-6 tracking-tight">
        There's a gap in your catalog.
      </h2>
      <div class="space-y-4 text-lg text-stone-700 leading-relaxed">
        <p>
          The podcast is free. <em>Rich AF</em> is twenty bucks. And then the
          next step is Best Year Ever at $999. For the 605K women finding you
          on Instagram, that jump is too big. They feel the fire for a couple
          of weeks after the book and then drift.
        </p>
        <p>
          Money Queen is a shell for course delivery. Vibe is broadcast audio.
          The Companion Journal is static paper. Nothing in the catalog is
          daily, interactive, or personalized to who they are right now.
        </p>
        <p class="text-stone-500 italic">
          That's the rung that's missing.
        </p>
      </div>
    </section>

    <!-- The Product -->
    <section class="py-12 px-6 md:px-8 max-w-2xl mx-auto border-t border-stone-200">
      <p class="font-display italic text-xs tracking-[0.3em] uppercase text-rose-600 mb-4">
        What I Built
      </p>
      <h2 class="font-display text-3xl md:text-4xl text-stone-900 mb-6 tracking-tight">
        I built Overflow to fill it.
      </h2>
      <div class="space-y-4 text-lg text-stone-700 leading-relaxed">
        <p>A mobile app with two layers.</p>
        <p>
          The <strong class="text-stone-900">daily layer</strong> is a
          three-minute ritual: tap <em>Received</em> when something arrives —
          a compliment, a refund, a yes — pull a daily card in your voice,
          spill into the journal, call in what's next, block sacred time on
          the calendar. Every tap builds a Receiving Streak. Women open it
          every morning.
        </p>
        <p>
          The <strong class="text-stone-900">retention layer</strong> is why
          they come back for months. <em>The Mirror</em> reads their entries
          and reflects them back in your language. The
          <em>Belief Loop</em> walks them through &ldquo;what if this
          weren't true?&rdquo; — your signature question — whenever they name
          a limiting thought. <em>21-Day Journeys</em> (Money Wounds,
          Worthiness, Receiving) give them a destination. And every Sunday at
          6pm, a <em>Sunday Mirror</em> lands — a weekly AI synthesis of their
          week, so they have a reason to journal all week.
        </p>
        <p>
          $19–29 a month. Accessible to the 99% who can't drop $999 today but
          become your warmest MMM leads down the road.
        </p>
      </div>
    </section>

    <!-- The Mirror -->
    <section class="py-12 px-6 md:px-8 max-w-2xl mx-auto border-t border-stone-200">
      <p class="font-display italic text-xs tracking-[0.3em] uppercase text-rose-600 mb-4">
        The Differentiator
      </p>
      <h2 class="font-display text-3xl md:text-4xl text-stone-900 mb-6 tracking-tight">
        She gets you at 2am.
      </h2>
      <div class="space-y-4 text-lg text-stone-700 leading-relaxed">
        <p>
          Every app has journaling. Every teacher has a book. What Overflow
          has that nothing else does: <em>The Mirror</em> — an AI trained on
          your language and teachings.
        </p>
        <p>
          Women write about money, fear, desire, the block. The Mirror reads
          it in <em>your</em> language — <em>receive, expand, call it in,
          sweet one</em> — and reflects back what you would say. Not generic
          therapy-speak. Not ChatGPT. You.
        </p>
        <p>
          You can't 1-on-1 coach 605K women. The Mirror can. Every user gets
          a version of the coach they can't afford yet — which is exactly
          what turns free followers into paying subscribers, and paying
          subscribers into MMM leads.
        </p>
        <p class="text-stone-500 italic text-base">
          Right now it's trained on publicly available material. After we
          partner, we tune it against your book manuscript, podcast
          transcripts, and whatever MMM teachings you want baked in. It gets
          sharper every week.
        </p>
        <p class="text-stone-500 italic text-base border-l-2 border-rose-400/40 pl-4 mt-6">
          And the next phase, if we partner: we record you once, and The
          Mirror shows up face-to-face — in your voice, with your presence.
          Not AI imitating you. You. Scaled. An MMM-level 1:1 coaching
          experience at $29/month. I've already built the pipeline for my
          own avatar. No other teacher on earth currently has the tech to do
          this.
        </p>
      </div>
    </section>

    <!-- Live Demo -->
    <section class="py-12 px-6 md:px-8 max-w-2xl mx-auto border-t border-stone-200">
      <p class="font-display italic text-xs tracking-[0.3em] uppercase text-rose-600 mb-4">
        Try It
      </p>
      <h2 class="font-display text-3xl md:text-4xl text-stone-900 mb-6 tracking-tight">
        It's real. Play with it.
      </h2>
      <div class="space-y-4 text-lg text-stone-700 leading-relaxed mb-8">
        <p>
          Live, working, end-to-end. Create a test account. Write an entry
          about money. Ask The Mirror for insights.
        </p>
        <p class="text-stone-500 italic text-base border-l-2 border-rose-400/40 pl-4">
          One heads-up before you press play: the audio in the demo is
          generic text-to-speech — clearly a robot. With your permission,
          that gets replaced with a voice clone trained on your podcast
          audio (indistinguishable from the real thing). What's in the demo
          is placeholder. What ships is you.
        </p>
        <p class="text-stone-500 italic">
          Pre-launch; in Google Play closed testing now. iOS next. You'd
          own the codebase.
        </p>
      </div>
      <div class="flex flex-col sm:flex-row gap-3">
        <a
          :href="demoUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="flex-1 text-center bg-rose-600 hover:bg-rose-500 text-white rounded-full py-4 px-6 text-base tracking-wide transition-colors"
        >
          Open the Demo
        </a>
        <a
          :href="demoRegisterUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="flex-1 text-center border-2 border-rose-600 text-rose-600 hover:bg-rose-50 bg-transparent rounded-full py-4 px-6 text-base tracking-wide transition-colors"
        >
          Create Test Account
        </a>
      </div>
    </section>

    <!-- The Ask -->
    <section class="py-12 px-6 md:px-8 max-w-2xl mx-auto border-t border-stone-200">
      <p class="font-display italic text-xs tracking-[0.3em] uppercase text-rose-600 mb-4">
        The Ask
      </p>
      <h2 class="font-display text-3xl md:text-4xl text-stone-900 mb-6 tracking-tight">
        I'm pitching partnership, not a sale.
      </h2>
      <div class="space-y-4 text-lg text-stone-700 leading-relaxed">
        <p>
          I've built the product. You are the brand, the audience, and the
          voice. That's the combination that makes this work.
        </p>
        <p>
          You bring the 605K, the teachings, and the soul. I bring the
          infrastructure, the AI, and the ongoing build. We split
          accordingly. If a different structure makes more sense, I'm open.
          Starting point is co-founders.
        </p>
      </div>
    </section>

    <!-- About -->
    <section class="py-12 px-6 md:px-8 max-w-2xl mx-auto border-t border-stone-200">
      <p class="font-display italic text-xs tracking-[0.3em] uppercase text-rose-600 mb-4">
        Who I Am
      </p>
      <div class="mb-6">
        <h2 class="font-display text-3xl md:text-4xl text-stone-900 mb-2 tracking-tight">
          Anthony Vazquez
        </h2>
        <p class="text-sm text-stone-500 font-display italic">
          Founder,
          <a
            href="https://criton.ai"
            target="_blank"
            rel="noopener noreferrer"
            class="text-rose-600 underline underline-offset-4 hover:text-rose-500"
          >
            Criton.ai
          </a>
        </p>
      </div>
      <div class="space-y-4 text-lg text-stone-700 leading-relaxed">
        <p>
          I'm Anthony. I run Criton.ai, where we build AI software for
          operators — voice agents, mobile apps, the kind of infrastructure
          that turns audiences into revenue.
        </p>
        <p>
          Before Criton, I spent 20+ years in sales and go-to-market, mostly
          enterprise B2B. Built and ran sales organizations. Most of what I
          learned came from figuring out how to turn a warm audience into a
          pipeline, and a pipeline into paying customers. That's the muscle
          Overflow needs sitting next to your brand.
        </p>
        <p>
          I built Overflow because I kept seeing the same pattern: people
          with massive audiences and incredible teachings have no daily
          product. They're leaving millions on the table. I wanted to fix
          that with the right partner. That's you.
        </p>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 px-6 md:px-8 max-w-2xl mx-auto border-t border-stone-200 text-center">
      <p class="font-display italic text-2xl md:text-3xl text-stone-900 leading-relaxed mb-8">
        If this feels like a yes — just reply.
        <br />
        If it's a no, tell me why and I'll send flowers for wasting your
        time.
      </p>
      <p class="text-stone-500 font-display italic">— Anthony</p>
    </section>

    <!-- Footer -->
    <footer class="py-8 text-center text-xs text-stone-500 border-t border-stone-200">
      <p class="font-display italic">
        This page is private. No index, no share. Just for you.
      </p>
    </footer>
  </div>
</template>
