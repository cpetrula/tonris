<script setup lang="ts">
// Private pitch page for Amanda Frances — not indexed.
// Colors ported from manifestation-lab/frontend/app/globals.css (oklch tokens).
import { onMounted } from 'vue'

onMounted(() => {
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
  <div class="af-root">
    <!-- Hero -->
    <section class="af-section af-hero">
      <p class="af-eyebrow">A Private Note for Amanda</p>
      <h1 class="af-title-xl">
        Overflow <span class="af-accent">×</span> Amanda Frances
      </h1>
      <p class="af-subtitle">
        The daily-practice layer your ladder is missing.
        <br />
        Already built. Already live. Ready to be yours.
      </p>
    </section>

    <!-- Diagnosis -->
    <section class="af-section af-bordered">
      <p class="af-eyebrow af-eyebrow-left">What I Noticed</p>
      <h2 class="af-title-lg">There's a gap in your catalog.</h2>
      <div class="af-body">
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
        <p class="af-muted-italic">That's the rung that's missing.</p>
      </div>
    </section>

    <!-- The Product -->
    <section class="af-section af-bordered">
      <p class="af-eyebrow af-eyebrow-left">What I Built</p>
      <h2 class="af-title-lg">I built Overflow to fill it.</h2>
      <div class="af-body">
        <p>A mobile app with two layers.</p>
        <p>
          The <strong class="af-strong">daily layer</strong> is a three-minute
          ritual: tap <em>Received</em> when something arrives — a compliment,
          a refund, a yes — pull a daily card in your voice, spill into the
          journal, call in what's next, block sacred time on the calendar.
          Every tap builds a Receiving Streak. Women open it every morning.
        </p>
        <p>
          The <strong class="af-strong">retention layer</strong> is why they
          come back for months. <em>The Mirror</em> reads their entries and
          reflects them back in your language. The <em>Belief Loop</em> walks
          them through &ldquo;what if this weren't true?&rdquo; — your
          signature question — whenever they name a limiting thought.
          <em>21-Day Journeys</em> (Money Wounds, Worthiness, Receiving) give
          them a destination. And every Sunday at 6pm, a <em>Sunday Mirror</em>
          lands — a weekly AI synthesis of their week, so they have a reason to
          journal all week.
        </p>
        <p>
          $19–29 a month. Accessible to the 99% who can't drop $999 today but
          become your warmest MMM leads down the road.
        </p>
      </div>
    </section>

    <!-- The Mirror -->
    <section class="af-section af-bordered">
      <p class="af-eyebrow af-eyebrow-left">The Differentiator</p>
      <h2 class="af-title-lg">She gets you at 2am.</h2>
      <div class="af-body">
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
          You can't 1-on-1 coach 605K women. The Mirror can. Every user gets a
          version of the coach they can't afford yet — which is exactly what
          turns free followers into paying subscribers, and paying subscribers
          into MMM leads.
        </p>
        <p class="af-muted-italic af-small">
          Right now it's trained on publicly available material. After we
          partner, we tune it against your book manuscript, podcast
          transcripts, and whatever MMM teachings you want baked in. It gets
          sharper every week.
        </p>
        <p class="af-muted-italic af-small af-callout">
          And the next phase, if we partner: we record you once, and The
          Mirror shows up face-to-face — in your voice, with your presence.
          Not AI imitating you. You. Scaled. An MMM-level 1:1 coaching
          experience at $29/month. I've already built the pipeline for my own
          avatar. No other teacher on earth currently has the tech to do this.
        </p>
      </div>
    </section>

    <!-- Live Demo -->
    <section class="af-section af-bordered">
      <p class="af-eyebrow af-eyebrow-left">Try It</p>
      <h2 class="af-title-lg">It's real. Play with it.</h2>
      <div class="af-body af-mb-lg">
        <p>
          Live, working, end-to-end. Create a test account. Write an entry
          about money. Ask The Mirror for insights.
        </p>
        <p class="af-muted-italic af-small af-callout">
          One heads-up before you press play: the audio in the demo is
          generic text-to-speech — clearly a robot. With your permission,
          that gets replaced with a voice clone trained on your podcast audio
          (indistinguishable from the real thing). What's in the demo is
          placeholder. What ships is you.
        </p>
        <p class="af-muted-italic">
          Pre-launch; in Google Play closed testing now. iOS next. You'd own
          the codebase.
        </p>
      </div>
      <div class="af-btn-row">
        <a
          :href="demoUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="af-btn af-btn-primary"
        >
          Open the Demo
        </a>
        <a
          :href="demoRegisterUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="af-btn af-btn-outline"
        >
          Create Test Account
        </a>
      </div>
    </section>

    <!-- The Ask -->
    <section class="af-section af-bordered">
      <p class="af-eyebrow af-eyebrow-left">The Ask</p>
      <h2 class="af-title-lg">I'm pitching partnership, not a sale.</h2>
      <div class="af-body">
        <p>
          I've built the product. You are the brand, the audience, and the
          voice. That's the combination that makes this work.
        </p>
        <p>
          You bring the 605K, the teachings, and the soul. I bring the
          infrastructure, the AI, and the ongoing build. We split accordingly.
          If a different structure makes more sense, I'm open. Starting point
          is co-founders.
        </p>
      </div>
    </section>

    <!-- About -->
    <section class="af-section af-bordered">
      <p class="af-eyebrow af-eyebrow-left">Who I Am</p>
      <div class="af-about-row">
        <img src="/anthony.png" alt="Anthony Vazquez" class="af-avatar" />
        <div>
          <h2 class="af-title-lg af-mb-tight">Anthony Vazquez</h2>
          <p class="af-byline">
            Founder,
            <a
              href="https://criton.ai"
              target="_blank"
              rel="noopener noreferrer"
              class="af-link"
            >Criton.ai</a>
          </p>
        </div>
      </div>
      <div class="af-body">
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
          I built Overflow because I kept seeing the same pattern: people with
          massive audiences and incredible teachings have no daily product.
          They're leaving millions on the table. I wanted to fix that with the
          right partner. That's you.
        </p>
      </div>
    </section>

    <!-- CTA -->
    <section class="af-section af-bordered af-cta">
      <p class="af-cta-text">
        If this feels like a yes — just reply.
        <br />
        If it's a no, tell me why and I'll send flowers for wasting your time.
      </p>
      <p class="af-sign">— Anthony</p>
    </section>

    <!-- Footer -->
    <footer class="af-footer">
      <p class="af-muted-italic">
        This page is private. No index, no share. Just for you.
      </p>
    </footer>
  </div>
</template>

<style scoped>
/* Exact tokens ported from manifestation-lab globals.css */
.af-root {
  --af-bg: oklch(0.955 0.015 85);
  --af-fg: oklch(0.27 0.025 55);
  --af-fg-soft: oklch(0.27 0.025 55 / 0.8);
  --af-primary: oklch(0.58 0.1 28);
  --af-primary-hover: oklch(0.58 0.1 28 / 0.9);
  --af-primary-fg: oklch(0.98 0.008 85);
  --af-secondary: oklch(0.89 0.028 22);
  --af-muted-fg: oklch(0.48 0.02 60);
  --af-border: oklch(0.86 0.025 78);

  min-height: 100vh;
  background-color: var(--af-bg);
  color: var(--af-fg);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.af-section {
  max-width: 42rem;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}
@media (min-width: 768px) {
  .af-section { padding-left: 2rem; padding-right: 2rem; }
}

.af-hero {
  padding-top: 5rem;
  padding-bottom: 4rem;
  text-align: center;
}

.af-bordered { border-top: 1px solid var(--af-border); }

.af-eyebrow {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-size: 0.75rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--af-primary);
  margin-bottom: 1.5rem;
}
.af-eyebrow-left { margin-bottom: 1rem; }

.af-title-xl {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 3rem;
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: var(--af-fg);
  margin-bottom: 1.5rem;
}
@media (min-width: 768px) { .af-title-xl { font-size: 3.75rem; } }

.af-title-lg {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.875rem;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--af-fg);
  margin-bottom: 1.5rem;
}
@media (min-width: 768px) { .af-title-lg { font-size: 2.25rem; } }

.af-mb-tight { margin-bottom: 0.5rem; }
.af-mb-lg { margin-bottom: 2rem; }

.af-accent { color: var(--af-primary); }

.af-subtitle {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-size: 1.25rem;
  line-height: 1.6;
  color: var(--af-muted-fg);
}

.af-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--af-fg-soft);
}

.af-strong { color: var(--af-fg); font-weight: 600; }

.af-muted-italic {
  color: var(--af-muted-fg);
  font-style: italic;
}

.af-small { font-size: 1rem; }

.af-callout {
  border-left: 2px solid oklch(0.58 0.1 28 / 0.4);
  padding-left: 1rem;
  margin-top: 1.5rem;
}

.af-btn-row {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
@media (min-width: 640px) { .af-btn-row { flex-direction: row; } }

.af-btn {
  flex: 1;
  display: inline-block;
  text-align: center;
  padding: 1rem 1.5rem;
  border-radius: 9999px;
  font-size: 1rem;
  letter-spacing: 0.025em;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}

.af-btn-primary {
  background-color: var(--af-primary);
  color: var(--af-primary-fg);
  border: 2px solid var(--af-primary);
}
.af-btn-primary:hover { background-color: var(--af-primary-hover); }

.af-btn-outline {
  background-color: transparent;
  color: var(--af-primary);
  border: 2px solid var(--af-primary);
}
.af-btn-outline:hover { background-color: var(--af-secondary); }

.af-about-row {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  margin-bottom: 1.5rem;
}
@media (min-width: 640px) {
  .af-about-row {
    flex-direction: row;
    align-items: flex-start;
  }
}

.af-avatar {
  width: 8rem;
  height: 8rem;
  border-radius: 9999px;
  object-fit: cover;
  object-position: center;
  border: 2px solid oklch(0.58 0.1 28 / 0.3);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  flex-shrink: 0;
}

.af-byline {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-size: 0.875rem;
  color: var(--af-muted-fg);
}

.af-link {
  color: var(--af-primary);
  text-decoration: underline;
  text-underline-offset: 4px;
}
.af-link:hover { color: var(--af-primary-hover); }

.af-cta {
  text-align: center;
  padding-top: 4rem;
  padding-bottom: 4rem;
}

.af-cta-text {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-size: 1.5rem;
  line-height: 1.5;
  color: var(--af-fg);
  margin-bottom: 2rem;
}
@media (min-width: 768px) { .af-cta-text { font-size: 1.875rem; } }

.af-sign {
  color: var(--af-muted-fg);
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
}

.af-footer {
  padding: 2rem 1.5rem;
  text-align: center;
  font-size: 0.75rem;
  color: var(--af-muted-fg);
  border-top: 1px solid var(--af-border);
}
</style>
