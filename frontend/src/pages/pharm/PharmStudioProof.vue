<script setup lang="ts">
// Private pitch page for Pharmavite — Direction C, "Studio Proof". Not indexed.
import { ref } from 'vue'
import PharmSwitcher from './PharmSwitcher.vue'
import {
  contact, hero, proof, proofFootnote, capabilities, ideas, ideasNote,
  process, regulated, example, team, disclaimer, usePitchPage
} from './content'

usePitchPage(
  'Criton.AI for Pharmavite',
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@500&display=swap'
)

const openIdea = ref<number | null>(0)
const marquee = [...capabilities.map((c) => c.title), ...proof.map((p) => `${p.value} — ${p.label}`)]
</script>

<template>
  <div class="sp-root">
    <header class="sp-nav sp-wrap">
      <a href="/" class="sp-brand">CRITON<span>.AI</span></a>
      <nav class="sp-links">
        <a href="#ideas">Ideas</a>
        <a href="#process">Process</a>
        <a :href="contact.mailto">Contact</a>
      </nav>
    </header>

    <!-- Hero -->
    <section class="sp-hero sp-wrap">
      <p class="sp-mono sp-eyebrow">{{ hero.eyebrow }} / For Pharmavite</p>
      <h1 class="sp-h1">AI that ships,<br />not demos.</h1>
      <p class="sp-lede">{{ hero.lede }}</p>
      <a :href="contact.mailto" class="sp-btn">Start a project</a>
    </section>

    <!-- Marquee -->
    <div class="sp-marquee" aria-hidden="true">
      <div class="sp-marquee-track">
        <span v-for="(item, i) in [...marquee, ...marquee]" :key="i" class="sp-marquee-item">{{ item }}</span>
      </div>
    </div>

    <!-- Ideas -->
    <section id="ideas" class="sp-wrap sp-section">
      <p class="sp-mono sp-eyebrow">Ideas for Pharmavite</p>
      <h2 class="sp-h2">Where we'd start.</h2>
      <p class="sp-note">{{ ideasNote }}</p>
      <ul class="sp-rows">
        <li v-for="(idea, i) in ideas" :key="idea.title" :class="{ open: openIdea === i }">
          <button class="sp-row" :aria-expanded="openIdea === i" @click="openIdea = openIdea === i ? null : i">
            <span class="sp-mono sp-row-tag">{{ idea.tag }}</span>
            <span class="sp-row-title">{{ idea.title }}</span>
            <span class="sp-row-arrow" aria-hidden="true">→</span>
          </button>
          <div v-show="openIdea === i" class="sp-row-body">
            <p><strong>Problem.</strong> {{ idea.problem }}</p>
            <p><strong>Approach.</strong> {{ idea.approach }}</p>
            <p><strong>Measure.</strong> {{ idea.measure }}</p>
          </div>
        </li>
      </ul>
    </section>

    <!-- Stats -->
    <section class="sp-wrap sp-section">
      <div class="sp-stats">
        <div v-for="s in proof" :key="s.label">
          <p class="sp-stat-value">{{ s.value }}</p>
          <p class="sp-mono sp-stat-label">{{ s.label }}</p>
        </div>
      </div>
      <p class="sp-footnote">{{ proofFootnote }}</p>
    </section>

    <!-- Light band: example + controls -->
    <section class="sp-light">
      <div class="sp-wrap sp-section">
        <p class="sp-mono sp-eyebrow sp-eyebrow-dark">A first engagement</p>
        <h2 class="sp-h2">One agent. One workflow. In production.</h2>
        <p class="sp-note sp-note-dark">An illustration of how we'd run a first engagement — not a past client project.</p>
        <div class="sp-example">
          <div class="sp-example-meta">
            <div v-for="m in example.meta" :key="m.label">
              <p class="sp-mono">{{ m.label }}</p>
              <p class="sp-example-value">{{ m.value }}</p>
            </div>
          </div>
          <div class="sp-example-story">
            <p>{{ example.setOut }}</p>
            <p>{{ example.cameTogether }}</p>
            <p><strong>{{ example.result }}</strong></p>
          </div>
        </div>
        <div class="sp-controls">
          <div v-for="r in regulated" :key="r.title">
            <h3 class="sp-h3">{{ r.title }}</h3>
            <p>{{ r.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Process -->
    <section id="process" class="sp-wrap sp-section">
      <p class="sp-mono sp-eyebrow">How we work</p>
      <h2 class="sp-h2">Signed engagement to production — in weeks.</h2>
      <div class="sp-process">
        <div v-for="step in process" :key="step.num" class="sp-card">
          <p class="sp-mono sp-step">{{ step.num }}</p>
          <h3 class="sp-h3">{{ step.title }}</h3>
          <p>{{ step.description }}</p>
        </div>
      </div>
    </section>

    <!-- Team -->
    <section class="sp-wrap sp-section">
      <p class="sp-mono sp-eyebrow">Team</p>
      <h2 class="sp-h2">You talk to the people who build it.</h2>
      <div class="sp-team">
        <div v-for="p in team" :key="p.name" class="sp-card sp-person">
          <span class="sp-avatar" aria-hidden="true">{{ p.initials }}</span>
          <div>
            <p class="sp-person-name">{{ p.name }}</p>
            <p class="sp-mono sp-person-role">{{ p.role }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="sp-wrap sp-section sp-cta">
      <h2 class="sp-h1 sp-cta-title">GET IN TOUCH.</h2>
      <div class="sp-cta-links">
        <a :href="contact.mailto" class="sp-btn">{{ contact.email }}</a>
        <a :href="contact.tel" class="sp-btn sp-btn-ghost">{{ contact.phone }}</a>
      </div>
    </section>

    <footer class="sp-footer sp-wrap">
      <p class="sp-mono">© {{ new Date().getFullYear() }} Criton.AI · Los Angeles</p>
      <p>{{ disclaimer }}</p>
    </footer>

    <PharmSwitcher />
  </div>
</template>

<style scoped>
.sp-root {
  --bg: #0e0f11;
  --surface: #17181c;
  --border: #2a2c33;
  --text: #f4f4f2;
  --muted: #a3a3aa;
  --gold: #d4af37;
  --light: #f3efe6;
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: 17px;
  line-height: 1.6;
  padding-bottom: 72px;
}
.sp-root p { margin: 0; }
.sp-wrap { max-width: 1200px; margin: 0 auto; padding-inline: 24px; }
.sp-mono {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-weight: 500;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.sp-nav { display: flex; justify-content: space-between; align-items: center; padding-block: 24px; }
.sp-brand { font: 700 18px 'Space Grotesk', sans-serif; letter-spacing: 0.06em; color: var(--text); text-decoration: none; }
.sp-brand span { color: var(--gold); }
.sp-links { display: flex; gap: 24px; }
.sp-links a { color: var(--muted); text-decoration: none; text-transform: uppercase; font-size: 13px; letter-spacing: 0.08em; }
.sp-links a:hover { color: var(--text); }

.sp-hero { padding-block: 72px 88px; }
.sp-eyebrow { color: var(--gold); margin-bottom: 20px !important; }
.sp-eyebrow-dark { color: #7a5f12; }
.sp-h1 {
  font: 700 clamp(48px, 9vw, 112px)/0.98 'Space Grotesk', sans-serif;
  letter-spacing: -0.03em;
  margin: 0 0 28px;
}
.sp-h2 { font: 700 clamp(30px, 4vw, 48px)/1.1 'Space Grotesk', sans-serif; letter-spacing: -0.02em; margin: 0 0 16px; }
.sp-h3 { font: 500 19px/1.3 'Space Grotesk', sans-serif; margin: 0 0 8px; }
.sp-lede { font-size: 20px; color: var(--muted); max-width: 640px; margin-bottom: 36px !important; }
.sp-note { color: var(--muted); max-width: 680px; margin-bottom: 32px !important; }
.sp-note-dark { color: #5b5a55; }

.sp-btn {
  display: inline-block;
  background: var(--gold);
  color: var(--bg);
  border-radius: 999px;
  padding: 14px 32px;
  font: 500 15px 'Space Grotesk', sans-serif;
  text-decoration: none;
}
.sp-btn:hover { background: #e2c25a; }
.sp-btn-ghost { background: transparent; color: var(--text); border: 1px solid var(--border); }
.sp-btn-ghost:hover { background: var(--surface); }

.sp-marquee { overflow: hidden; border-block: 1px solid var(--border); padding-block: 18px; }
.sp-marquee-track { display: flex; gap: 48px; width: max-content; animation: sp-scroll 40s linear infinite; }
.sp-marquee-item { font: 500 18px 'Space Grotesk', sans-serif; color: var(--muted); white-space: nowrap; }
.sp-marquee-item::before { content: '◆'; color: var(--gold); margin-right: 48px; font-size: 10px; vertical-align: middle; }
@keyframes sp-scroll { to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) { .sp-marquee-track { animation: none; } }

.sp-section { padding-block: 88px; }

.sp-rows { list-style: none; padding: 0; margin: 0; border-top: 1px solid var(--border); }
.sp-rows li { border-bottom: 1px solid var(--border); }
.sp-row {
  width: 100%;
  display: grid;
  grid-template-columns: 160px 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 26px 0;
  background: none;
  border: 0;
  color: var(--text);
  text-align: left;
  cursor: pointer;
  font: inherit;
}
.sp-row-tag { color: var(--muted); }
.sp-row-title { font: 500 clamp(20px, 2.6vw, 30px)/1.2 'Space Grotesk', sans-serif; }
.sp-row-arrow { font-size: 24px; color: var(--muted); transition: transform 0.2s, color 0.2s; }
.sp-row:hover .sp-row-arrow, .open .sp-row-arrow { color: var(--gold); transform: translateX(6px); }
.sp-row-body { padding: 0 0 28px 176px; color: var(--muted); display: grid; gap: 8px; max-width: 860px; }
.sp-row-body strong { color: var(--text); font-weight: 500; }

.sp-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
.sp-stats > div { background: var(--bg); padding: 32px 28px; }
.sp-stat-value { font: 700 52px/1 'Space Grotesk', sans-serif; color: var(--gold); }
.sp-stat-label { color: var(--muted); margin-top: 14px !important; line-height: 1.5; }
.sp-footnote { font-size: 13px; color: var(--muted); margin-top: 16px !important; }

.sp-light { background: var(--light); color: #17181c; }
.sp-example { background: #fff; border-radius: 10px; padding: 32px; display: grid; grid-template-columns: 1fr 2fr; gap: 40px; }
.sp-example-meta { display: grid; gap: 18px; }
.sp-example-meta .sp-mono { color: #6b6a64; }
.sp-example-value { font: 500 18px 'Space Grotesk', sans-serif; margin-top: 4px !important; }
.sp-example-story { display: grid; gap: 14px; font-size: 18px; }
.sp-controls { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 28px; margin-top: 48px; }
.sp-controls p { color: #4a4a46; }

.sp-process { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 16px; margin-top: 32px; }
.sp-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 28px; }
.sp-card p { color: var(--muted); }
.sp-step { color: var(--gold) !important; margin-bottom: 18px !important; }

.sp-team { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 32px; }
.sp-person { display: flex; align-items: center; gap: 18px; }
.sp-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--gold);
  color: var(--bg);
  display: grid;
  place-items: center;
  font: 700 18px 'Space Grotesk', sans-serif;
}
.sp-person-name { font: 500 19px 'Space Grotesk', sans-serif; color: var(--text) !important; }

.sp-cta { border-top: 1px solid var(--border); }
.sp-cta-title { color: var(--gold); }
.sp-cta-links { display: flex; flex-wrap: wrap; gap: 12px; }

.sp-footer { padding-block: 32px; color: var(--muted); font-size: 14px; display: grid; gap: 6px; }

@media (max-width: 800px) {
  .sp-links { display: none; }
  .sp-section { padding-block: 64px; }
  .sp-hero { padding-block: 40px 64px; }
  .sp-row { grid-template-columns: 1fr auto; }
  .sp-row-tag { grid-column: 1 / -1; }
  .sp-row-body { padding-left: 0; }
  .sp-example { grid-template-columns: 1fr; padding: 24px; gap: 24px; }
}
</style>
