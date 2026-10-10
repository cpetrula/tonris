<script setup lang="ts">
// Private pitch page for Pharmavite — Direction A, "Daylight Studio". Not indexed.
import PharmSwitcher from './PharmSwitcher.vue'
import {
  contact, hero, proof, proofFootnote, capabilities, ideas, ideasNote,
  process, regulated, example, team, disclaimer, usePitchPage
} from './content'

usePitchPage(
  'Criton.AI for Pharmavite',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Source+Sans+3:wght@400;600&display=swap'
)

const startIdeas = ideas.slice(0, 3)
</script>

<template>
  <div class="dl-root">
    <header class="dl-nav dl-wrap">
      <a href="/" class="dl-brand">CRITON<span>.AI</span></a>
      <a :href="contact.mailto" class="dl-btn dl-btn-ghost dl-btn-sm">Contact</a>
    </header>

    <!-- Hero -->
    <section class="dl-hero dl-wrap">
      <p class="dl-eyebrow">{{ hero.eyebrow }} · Prepared for Pharmavite</p>
      <h1 class="dl-h1">AI your team owns,<br />shipped in weeks.</h1>
      <p class="dl-lede">{{ hero.lede }}</p>
      <div class="dl-ctas">
        <a :href="contact.mailto" class="dl-btn dl-btn-primary">Start the conversation</a>
        <a href="#start" class="dl-btn dl-btn-ghost">See where we'd start</a>
      </div>
    </section>

    <!-- Proof -->
    <section class="dl-band dl-cream">
      <div class="dl-wrap">
        <div class="dl-stats">
          <div v-for="s in proof" :key="s.label" class="dl-stat">
            <p class="dl-stat-value">{{ s.value }}<sup>1</sup></p>
            <p class="dl-stat-label">{{ s.label }}</p>
          </div>
        </div>
        <p class="dl-footnote"><sup>1</sup> {{ proofFootnote }}</p>
      </div>
    </section>

    <!-- Where we'd start -->
    <section id="start" class="dl-section dl-wrap">
      <p class="dl-eyebrow">Where we'd start</p>
      <h2 class="dl-h2">Three places AI could earn its keep.</h2>
      <p class="dl-note">{{ ideasNote }}</p>
      <div class="dl-grid-3">
        <article v-for="idea in startIdeas" :key="idea.title" class="dl-card">
          <p class="dl-tag">{{ idea.tag }}</p>
          <h3 class="dl-h3">{{ idea.title }}</h3>
          <p>{{ idea.approach }}</p>
          <p class="dl-measure"><strong>We'd measure:</strong> {{ idea.measure }}</p>
        </article>
      </div>
    </section>

    <!-- Example engagement -->
    <section class="dl-band dl-cool">
      <div class="dl-wrap">
        <p class="dl-eyebrow">What a first project looks like</p>
        <h2 class="dl-h2">One agent. One workflow. In production.</h2>
        <p class="dl-note">An illustration of how we'd run a first engagement — not a past client project.</p>
        <div class="dl-case">
          <dl class="dl-meta">
            <div v-for="m in example.meta" :key="m.label">
              <dt>{{ m.label }}</dt>
              <dd>{{ m.value }}</dd>
            </div>
          </dl>
          <div class="dl-grid-3 dl-case-body">
            <div>
              <h3 class="dl-h3">What we'd set out to do</h3>
              <p>{{ example.setOut }}</p>
            </div>
            <div>
              <h3 class="dl-h3">How it would come together</h3>
              <p>{{ example.cameTogether }}</p>
            </div>
            <div>
              <h3 class="dl-h3">What you'd have at the end</h3>
              <p>{{ example.result }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How we work -->
    <section class="dl-section dl-wrap">
      <p class="dl-eyebrow">How we work</p>
      <h2 class="dl-h2">From kickoff to production in weeks.</h2>
      <ol class="dl-steps">
        <li v-for="step in process" :key="step.num">
          <span class="dl-step-num">{{ step.num }}</span>
          <h3 class="dl-h3">{{ step.title }}</h3>
          <p>{{ step.description }}</p>
        </li>
      </ol>
    </section>

    <!-- Regulated -->
    <section class="dl-band dl-cream">
      <div class="dl-wrap">
        <p class="dl-eyebrow">Built for regulated teams</p>
        <h2 class="dl-h2">Accountable by design.</h2>
        <div class="dl-grid-4">
          <div v-for="r in regulated" :key="r.title" class="dl-card dl-card-flat">
            <h3 class="dl-h3">{{ r.title }}</h3>
            <p>{{ r.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Capabilities + team -->
    <section class="dl-section dl-wrap dl-split">
      <div>
        <p class="dl-eyebrow">What we build</p>
        <h2 class="dl-h2">Four disciplines. One team.</h2>
        <ul class="dl-caps">
          <li v-for="c in capabilities" :key="c.title">
            <h3 class="dl-h3">{{ c.title }}</h3>
            <p>{{ c.description }}</p>
          </li>
        </ul>
      </div>
      <div>
        <p class="dl-eyebrow">Who you'd work with</p>
        <h2 class="dl-h2">The founders, directly.</h2>
        <div class="dl-team">
          <div v-for="p in team" :key="p.name" class="dl-person">
            <span class="dl-avatar" aria-hidden="true">{{ p.initials }}</span>
            <div>
              <p class="dl-person-name">{{ p.name }}</p>
              <p class="dl-person-role">{{ p.role }}, Criton.AI</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="dl-cta">
      <div class="dl-wrap">
        <h2 class="dl-h2">Start the conversation.</h2>
        <p class="dl-lede">Tell us about one workflow. We'll tell you whether — and how — we'd build it.</p>
        <div class="dl-ctas">
          <a :href="contact.mailto" class="dl-btn dl-btn-primary dl-btn-plain">{{ contact.email }}</a>
          <a :href="contact.tel" class="dl-btn dl-btn-ghost dl-btn-ghost-light dl-btn-plain">{{ contact.phone }}</a>
        </div>
      </div>
    </section>

    <footer class="dl-footer dl-wrap">
      <p>© {{ new Date().getFullYear() }} Criton.AI · Los Angeles</p>
      <p>{{ disclaimer }}</p>
    </footer>

    <PharmSwitcher />
  </div>
</template>

<style scoped>
.dl-root {
  --ink: #1c1e22;
  --muted: #5a5f66;
  --cream: #f7f1e6;
  --cool: #eef2f5;
  --amber: #c98a1b;
  --amber-deep: #8a5a12;
  --navy: #1f3a56;
  min-height: 100vh;
  background: #fff;
  color: var(--ink);
  font-family: 'Source Sans 3', system-ui, -apple-system, sans-serif;
  font-size: 18px;
  line-height: 1.6;
  padding-bottom: 72px;
}
.dl-wrap { max-width: 1140px; margin: 0 auto; padding-inline: 24px; }
.dl-root p { margin: 0; }

.dl-nav { display: flex; justify-content: space-between; align-items: center; padding-block: 24px; }
.dl-brand { font: 700 18px 'Montserrat', sans-serif; letter-spacing: 0.06em; color: var(--ink); text-decoration: none; }
.dl-brand span { color: var(--amber-deep); }

.dl-eyebrow {
  font: 600 13px 'Montserrat', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--amber-deep);
  margin-bottom: 16px !important;
}
.dl-eyebrow::before {
  content: '';
  display: block;
  width: 40px;
  height: 3px;
  background: var(--amber);
  margin-bottom: 14px;
}
.dl-h1 {
  font: 500 clamp(40px, 6vw, 68px)/1.08 'Montserrat', sans-serif;
  letter-spacing: -0.02em;
  margin: 0 0 24px;
}
.dl-h2 {
  font: 700 clamp(28px, 3.6vw, 40px)/1.15 'Montserrat', sans-serif;
  letter-spacing: -0.01em;
  margin: 0 0 16px;
}
.dl-h3 { font: 600 19px/1.3 'Montserrat', sans-serif; margin: 0 0 10px; }
.dl-lede { font-size: 21px; color: var(--muted); max-width: 680px; }
.dl-note { color: var(--muted); font-size: 16px; font-style: italic; max-width: 720px; margin-bottom: 36px !important; }

.dl-hero { padding-block: 72px 96px; }
.dl-ctas { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 36px; }
.dl-btn {
  display: inline-block;
  border-radius: 999px;
  padding: 14px 40px;
  font: 600 14px 'Source Sans 3', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}
.dl-btn-sm { padding: 10px 24px; }
.dl-btn-plain { text-transform: none; letter-spacing: 0; font-size: 16px; }
.dl-btn-primary { background: var(--amber-deep); color: #fff; }
.dl-btn-primary:hover { background: #6f480e; }
.dl-btn-ghost { border: 1.5px solid var(--ink); color: var(--ink); }
.dl-btn-ghost:hover { background: var(--ink); color: #fff; }

.dl-band { padding-block: 96px; }
.dl-cream { background: var(--cream); }
.dl-cool { background: var(--cool); }
.dl-section { padding-block: 96px; }

.dl-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
.dl-stat-value { font: 500 clamp(40px, 5vw, 58px)/1 'Montserrat', sans-serif; color: var(--navy); }
.dl-stat-value sup { font-size: 14px; color: var(--muted); margin-left: 2px; }
.dl-stat-label { font-size: 15px; color: var(--muted); margin-top: 10px !important; }
.dl-footnote { font-size: 13px; color: var(--muted); margin-top: 32px !important; }

.dl-grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }
.dl-grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-top: 36px; }
.dl-card {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  border: 1px solid #e7e2d8;
  transition: box-shadow 0.2s;
}
.dl-card:hover { box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1); }
.dl-card p + p { margin-top: 12px; }
.dl-card-flat { border: none; }
.dl-tag {
  display: inline-block;
  font: 600 12px 'Montserrat', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--navy);
  background: var(--cool);
  border-radius: 999px;
  padding: 6px 12px;
  margin-bottom: 16px !important;
}
.dl-measure { font-size: 16px; color: var(--muted); }

.dl-case { background: #fff; border-radius: 20px; padding: 40px; }
.dl-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  margin: 0 0 32px;
  padding-bottom: 28px;
  border-bottom: 1px solid #e3e7eb;
}
.dl-meta dt { font: 600 12px 'Montserrat', sans-serif; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); }
.dl-meta dd { margin: 6px 0 0; font-weight: 600; }

.dl-steps { list-style: none; padding: 0; margin: 40px 0 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 32px; }
.dl-steps li { border-top: 3px solid var(--amber); padding-top: 20px; }
.dl-step-num { display: block; font: 600 14px 'Montserrat', sans-serif; color: var(--amber-deep); margin-bottom: 10px; }

.dl-split { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; }
.dl-caps { list-style: none; padding: 0; margin: 28px 0 0; display: grid; gap: 24px; }
.dl-team { display: grid; gap: 20px; margin-top: 28px; }
.dl-person { display: flex; align-items: center; gap: 16px; }
.dl-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--cream);
  color: var(--amber-deep);
  display: grid;
  place-items: center;
  font: 700 20px 'Montserrat', sans-serif;
}
.dl-person-name { font: 600 18px 'Montserrat', sans-serif; }
.dl-person-role { color: var(--muted); font-size: 16px; }

.dl-cta { background: var(--navy); color: #fff; padding-block: 96px; }
.dl-cta .dl-lede { color: #c9d3de; }
.dl-cta .dl-btn-primary { background: #fff; color: var(--navy); }
.dl-cta .dl-btn-primary:hover { background: var(--cream); }
.dl-btn-ghost-light { border-color: #fff; color: #fff; }
.dl-btn-ghost-light:hover { background: #fff; color: var(--navy); }

.dl-footer { padding-block: 32px; font-size: 14px; color: var(--muted); display: grid; gap: 6px; }

@media (max-width: 800px) {
  .dl-split { grid-template-columns: 1fr; gap: 48px; }
  .dl-hero { padding-block: 40px 64px; }
  .dl-band, .dl-section, .dl-cta { padding-block: 64px; }
  .dl-case { padding: 24px; }
  .dl-btn { padding: 14px 28px; }
}
</style>
