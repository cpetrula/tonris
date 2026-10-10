<script setup lang="ts">
// Private pitch page for Pharmavite — Direction B, "Lab Notebook". Not indexed.
import PharmSwitcher from './PharmSwitcher.vue'
import {
  contact, hero, proof, proofFootnote, capabilities, ideas, ideasNote,
  process, regulated, example, team, disclaimer, usePitchPage
} from './content'

usePitchPage(
  'Criton.AI for Pharmavite',
  'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap'
)
</script>

<template>
  <div class="ln-root">
    <header class="ln-nav ln-wrap">
      <a href="/" class="ln-brand">Criton.AI</a>
      <span class="ln-mono">Prepared for Pharmavite</span>
    </header>

    <!-- Hero -->
    <section class="ln-hero ln-wrap">
      <p class="ln-mono ln-label">{{ hero.eyebrow }}</p>
      <h1 class="ln-h1">From pilot to production, with the paperwork done.</h1>
      <p class="ln-lede">{{ hero.lede }}</p>
      <div class="ln-ctas">
        <a :href="contact.mailto" class="ln-btn">Talk it through with us</a>
        <a href="#hypotheses" class="ln-link">Read our hypotheses →</a>
      </div>
    </section>

    <!-- Findings -->
    <section class="ln-wrap ln-section">
      <div class="ln-rule"><span class="ln-mono">01 · Findings</span></div>
      <div class="ln-stats">
        <div v-for="s in proof" :key="s.label" class="ln-stat">
          <p class="ln-stat-value">{{ s.value }}</p>
          <p class="ln-mono ln-stat-label">{{ s.label }}</p>
        </div>
      </div>
      <p class="ln-footnote">{{ proofFootnote }}</p>
    </section>

    <!-- Hypotheses -->
    <section id="hypotheses" class="ln-wrap ln-section">
      <div class="ln-rule"><span class="ln-mono">02 · Hypotheses for Pharmavite</span></div>
      <h2 class="ln-h2">Where AI could help first.</h2>
      <p class="ln-note">{{ ideasNote }}</p>
      <div class="ln-hyps">
        <article v-for="(idea, i) in ideas" :key="idea.title" class="ln-card">
          <p class="ln-mono ln-tag">H{{ i + 1 }} · {{ idea.tag }}</p>
          <h3 class="ln-h3">{{ idea.title }}</h3>
          <table class="ln-table">
            <tbody>
              <tr><th class="ln-mono">Problem</th><td>{{ idea.problem }}</td></tr>
              <tr><th class="ln-mono">Approach</th><td>{{ idea.approach }}</td></tr>
              <tr><th class="ln-mono">Measure</th><td>{{ idea.measure }}</td></tr>
            </tbody>
          </table>
        </article>
      </div>
    </section>

    <!-- Example -->
    <section class="ln-sand">
      <div class="ln-wrap ln-section">
        <div class="ln-rule"><span class="ln-mono">03 · A first engagement</span></div>
        <p class="ln-mono ln-specimen">EXAMPLE · ONE AGENT · ONE WORKFLOW</p>
        <h2 class="ln-h2">One agent in production, with an audit trail.</h2>
        <p class="ln-note">An illustration of how we'd run a first engagement — not a past client project.</p>
        <div class="ln-card ln-card-paper">
          <table class="ln-table">
            <tbody>
              <tr><th class="ln-mono">Set out to</th><td>{{ example.setOut }}</td></tr>
              <tr><th class="ln-mono">Came together</th><td>{{ example.cameTogether }}</td></tr>
              <tr><th class="ln-mono">Result</th><td>{{ example.result }}</td></tr>
            </tbody>
          </table>
          <p class="ln-mono ln-stackline">
            <span v-for="(m, i) in example.meta" :key="m.label">{{ m.label }}: {{ m.value }}<template v-if="i < example.meta.length - 1"> · </template></span>
          </p>
        </div>
      </div>
    </section>

    <!-- Method -->
    <section class="ln-wrap ln-section">
      <div class="ln-rule"><span class="ln-mono">04 · Method</span></div>
      <h2 class="ln-h2">Four steps, in weeks.</h2>
      <ol class="ln-timeline">
        <li v-for="step in process" :key="step.num">
          <span class="ln-mono ln-step">{{ step.num }}</span>
          <div>
            <h3 class="ln-h3">{{ step.title }}</h3>
            <p>{{ step.description }}</p>
          </div>
        </li>
      </ol>
    </section>

    <!-- Controls -->
    <section class="ln-wrap ln-section">
      <div class="ln-rule"><span class="ln-mono">05 · Controls</span></div>
      <h2 class="ln-h2">Data, review, and ownership.</h2>
      <dl class="ln-controls">
        <div v-for="r in regulated" :key="r.title">
          <dt class="ln-h3">{{ r.title }}</dt>
          <dd>{{ r.description }}</dd>
        </div>
      </dl>
    </section>

    <!-- Capabilities + team -->
    <section class="ln-wrap ln-section">
      <div class="ln-rule"><span class="ln-mono">06 · Capabilities and team</span></div>
      <div class="ln-split">
        <ul class="ln-caps">
          <li v-for="c in capabilities" :key="c.title">
            <h3 class="ln-h3">{{ c.title }}</h3>
            <p>{{ c.description }}</p>
          </li>
        </ul>
        <div>
          <p class="ln-note ln-team-intro">You work with the founders directly.</p>
          <div v-for="p in team" :key="p.name" class="ln-person">
            <span class="ln-avatar" aria-hidden="true">{{ p.initials }}</span>
            <div>
              <p class="ln-person-name">{{ p.name }}</p>
              <p class="ln-mono ln-person-role">{{ p.role }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="ln-cta">
      <div class="ln-wrap">
        <h2 class="ln-h2">Talk it through with us.</h2>
        <p class="ln-lede">Bring one workflow. We'll come back with a hypothesis, an approach, and how we'd measure it.</p>
        <div class="ln-ctas">
          <a :href="contact.mailto" class="ln-btn ln-btn-light">{{ contact.email }}</a>
          <a :href="contact.tel" class="ln-link ln-link-light">{{ contact.phone }}</a>
        </div>
      </div>
    </section>

    <footer class="ln-footer ln-wrap">
      <p class="ln-mono">© {{ new Date().getFullYear() }} Criton.AI · Los Angeles</p>
      <p>{{ disclaimer }}</p>
    </footer>

    <PharmSwitcher />
  </div>
</template>

<style scoped>
.ln-root {
  --paper: #f8f6f0;
  --sand: #ece6d6;
  --ink: #1c2321;
  --muted: #55605c;
  --slate: #3e5c55;
  --sage: #d5e0d9;
  --terra: #b9532f;
  --rule: #cfc8b6;
  min-height: 100vh;
  background: var(--paper);
  color: var(--ink);
  font-family: 'Instrument Sans', system-ui, -apple-system, sans-serif;
  font-size: 17px;
  line-height: 1.65;
  padding-bottom: 72px;
}
.ln-root p { margin: 0; }
.ln-wrap { max-width: 1120px; margin: 0 auto; padding-inline: 24px; }
.ln-mono {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 500;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.ln-nav { display: flex; justify-content: space-between; align-items: center; padding-block: 24px; color: var(--muted); }
.ln-brand { font: 600 22px 'Fraunces', Georgia, serif; color: var(--ink); text-decoration: none; }

.ln-hero { padding-block: 64px 80px; }
.ln-label { color: var(--slate); margin-bottom: 20px !important; }
.ln-h1 {
  font: 500 clamp(40px, 6vw, 72px)/1.05 'Fraunces', Georgia, serif;
  letter-spacing: -0.02em;
  max-width: 900px;
  margin: 0 0 24px;
}
.ln-h2 { font: 500 clamp(28px, 3.4vw, 40px)/1.15 'Fraunces', Georgia, serif; margin: 20px 0 12px; }
.ln-h3 { font: 600 18px/1.35 'Instrument Sans', sans-serif; margin: 0 0 8px; }
.ln-lede { font-size: 20px; color: var(--muted); max-width: 680px; }
.ln-note { color: var(--muted); max-width: 680px; margin-bottom: 32px !important; }

.ln-ctas { display: flex; flex-wrap: wrap; align-items: center; gap: 24px; margin-top: 36px; }
.ln-btn {
  display: inline-block;
  background: var(--terra);
  color: #fff;
  border-radius: 8px;
  padding: 14px 28px;
  font-weight: 600;
  text-decoration: none;
}
.ln-btn:hover { background: #9c4425; }
.ln-link { color: var(--slate); font-weight: 600; text-decoration: none; border-bottom: 1px solid currentColor; }

.ln-section { padding-block: 72px; }
.ln-rule { border-top: 1px solid var(--rule); padding-top: 12px; color: var(--slate); }

.ln-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 32px; }
.ln-stat { background: var(--sage); border-radius: 12px; padding: 24px; }
.ln-stat-value { font: 500 44px/1 'Fraunces', Georgia, serif; color: var(--slate); }
.ln-stat-label { margin-top: 14px !important; color: var(--ink); line-height: 1.5; }
.ln-footnote { font-size: 13px; color: var(--muted); margin-top: 16px !important; }

.ln-hyps { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.ln-card { background: #fff; border: 1px solid var(--rule); border-radius: 12px; padding: 28px; }
.ln-card-paper { background: var(--paper); margin-top: 8px; }
.ln-tag { color: var(--terra); margin-bottom: 12px !important; }
.ln-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
.ln-table th {
  text-align: left;
  vertical-align: top;
  color: var(--slate);
  padding: 12px 16px 12px 0;
  width: 120px;
  border-top: 1px solid var(--rule);
}
.ln-table td { padding: 10px 0; border-top: 1px solid var(--rule); }
.ln-stackline { color: var(--muted); margin-top: 20px !important; line-height: 1.8; }

.ln-sand { background: var(--sand); }
.ln-specimen { display: inline-block; margin-top: 24px !important; padding: 6px 10px; border: 1px solid var(--slate); border-radius: 4px; color: var(--slate); }

.ln-timeline { list-style: none; padding: 0; margin: 24px 0 0; border-left: 1px solid var(--rule); }
.ln-timeline li { display: grid; grid-template-columns: 56px 1fr; gap: 12px; padding: 0 0 28px 20px; position: relative; max-width: 680px; }
.ln-timeline li::before {
  content: '';
  position: absolute;
  left: -5px;
  top: 6px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--terra);
}
.ln-step { color: var(--terra); padding-top: 3px; }

.ln-controls { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0 32px; margin: 24px 0 0; }
.ln-controls > div { border-top: 1px solid var(--rule); padding-block: 20px; }
.ln-controls dd { margin: 0; color: var(--muted); }

.ln-split { display: grid; grid-template-columns: 1.4fr 1fr; gap: 56px; margin-top: 32px; }
.ln-caps { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
.ln-caps p { color: var(--muted); }
.ln-team-intro { margin-bottom: 20px !important; }
.ln-person { display: flex; align-items: center; gap: 16px; padding-block: 14px; border-top: 1px solid var(--rule); }
.ln-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 1px solid var(--slate);
  color: var(--slate);
  display: grid;
  place-items: center;
  font: 500 18px 'Fraunces', Georgia, serif;
}
.ln-person-name { font-weight: 600; }
.ln-person-role { color: var(--muted); }

.ln-cta { background: var(--slate); color: #fff; padding-block: 88px; }
.ln-cta .ln-lede { color: #dbe5df; }
.ln-btn-light { background: #fff; color: var(--slate); }
.ln-btn-light:hover { background: var(--sand); }
.ln-link-light { color: #fff; }

.ln-footer { padding-block: 32px; color: var(--muted); font-size: 14px; display: grid; gap: 6px; }

@media (max-width: 800px) {
  .ln-split { grid-template-columns: 1fr; gap: 40px; }
  .ln-caps { grid-template-columns: 1fr; }
  .ln-section { padding-block: 56px; }
  .ln-hero { padding-block: 32px 56px; }
  .ln-hyps { grid-template-columns: 1fr; }
  .ln-table th { width: 96px; }
}
</style>
