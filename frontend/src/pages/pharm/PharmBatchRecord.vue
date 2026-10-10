<script setup lang="ts">
// Private pitch page — Direction D, "Batch Record". Not indexed.
// This variant deliberately never names the prospect; it speaks to supplement manufacturing in general.
// The page is formatted as a manufacturing batch record and keeps a live audit log of
// what the reader does on it, to show (not tell) what a traceable AI system feels like.
// The SOP in the demo is a labeled sample.
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import PharmSwitcher from './PharmSwitcher.vue'
import { contact, ideas, team, usePitchPage } from './content'

usePitchPage(
  'Batch Record No. 001 — Criton.AI',
  'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=IBM+Plex+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap'
)

// ---- Reviewer + audit log -------------------------------------------------
const reviewer = ref('')
const reviewerName = computed(() => reviewer.value.trim() || 'Reviewer')

type LogEntry = { time: string; text: string; kind?: 'sign' | 'escalate' }
const log = ref<LogEntry[]>([])
const logOpen = ref(false)
const logList = ref<HTMLElement | null>(null)

function stamp() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}
function record(text: string, kind?: LogEntry['kind']) {
  log.value.push({ time: stamp(), text, kind })
  nextTick(() => logList.value?.scrollTo({ top: logList.value.scrollHeight, behavior: 'smooth' }))
}
function onReviewerCommit() {
  if (reviewer.value.trim()) record(`Reviewer recorded: ${reviewer.value.trim()}`)
}

// ---- Section read logging -------------------------------------------------
let observer: IntersectionObserver | undefined
const seen = new Set<string>()

onMounted(() => {
  record('Batch record opened')

  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const id = (e.target as HTMLElement).dataset.step
        if (e.isIntersecting && id && !seen.has(id)) {
          seen.add(id)
          record(`Read ${id}`)
        }
      }
    },
    { threshold: 0.35 }
  )
  document.querySelectorAll<HTMLElement>('[data-step]').forEach((el) => observer?.observe(el))
})
onBeforeUnmount(() => {
  window.clearInterval(typeTimer)
  observer?.disconnect()
})

// ---- SOP copilot simulation ----------------------------------------------
type SimAnswer = { q: string; a: string; cite: string | null }
const sim: SimAnswer[] = [
  {
    q: 'What do I check before starting a new batch on the line?',
    a: 'Remove every material, label, and document from the previous batch. Confirm the line is visibly clean. Record the check on the batch record — two people sign.',
    cite: 'SAMPLE-SOP-014 rev C, §4.2'
  },
  {
    q: 'How long can a cleaned line sit before it must be re-cleaned?',
    a: '72 hours. After that, clean it again and record a new clearance.',
    cite: 'SAMPLE-SOP-014 rev C, §5.1'
  },
  {
    q: 'Can I skip line clearance if the next batch is the same product?',
    a: "I can't answer that from approved procedures. I've routed your question to the QA lead and logged it.",
    cite: null
  }
]
const active = ref<number | null>(null)
const typed = ref('')
const signedOff = ref<Set<number>>(new Set())
let typeTimer: number | undefined

function ask(i: number) {
  window.clearInterval(typeTimer)
  active.value = i
  typed.value = ''
  const s = sim[i]!
  record(`Asked copilot: "${s.q}"`)
  let n = 0
  typeTimer = window.setInterval(() => {
    n += 3
    typed.value = s.a.slice(0, n)
    if (n >= s.a.length) {
      window.clearInterval(typeTimer)
      if (s.cite) record(`Copilot answered — cited ${s.cite}`)
      else record('Copilot declined — no approved source. Escalated to QA lead', 'escalate')
    }
  }, 16)
}
function signOff(i: number) {
  if (signedOff.value.has(i)) return
  signedOff.value = new Set(signedOff.value).add(i)
  record(`Answer ${i + 1} signed off by ${reviewerName.value}`, 'sign')
}
const answerDone = computed(() => active.value !== null && typed.value.length >= sim[active.value]!.a.length)

// ---- Release --------------------------------------------------------------
const released = ref(false)
const releaseMailto = computed(() => {
  const body = encodeURIComponent(
    `Released for conversation by ${reviewerName.value}.\n\nThe workflow I'd start with:\n\n`
  )
  return `mailto:${contact.email}?subject=${encodeURIComponent('Released: Criton pilot batch')}&body=${body}`
})
function release() {
  released.value = true
  record(`Proposal released by ${reviewerName.value}`, 'sign')
}

// ---- Static content -------------------------------------------------------
const facts = [
  { label: 'Clickable prototype', value: 'by week 2' },
  { label: 'Releases to staging', value: 'weekly' },
  { label: 'Voice agent languages', value: '70+' },
  { label: 'Human sign-off', value: 'every decision that matters' },
  { label: 'Source citation', value: 'every answer' },
  { label: 'Code, accounts, data', value: 'yours' }
]

const ideasNote =
  "Starting points for a conversation, not a diagnosis. We'd confirm the right one with your team first."

const batch = [
  { when: 'Day 0', text: 'Specification. One workflow, and the release criteria it must meet — agreed before any code.' },
  { when: 'Week 2', text: 'A clickable prototype in your hands.' },
  { when: 'Weekly', text: 'Releases to staging, tested by your team with real documents.' },
  { when: 'Release', text: 'It goes live only when it meets the criteria and a named person on your team signs it off.', open: true },
  { when: 'After', text: 'The code, the accounts, and the data are yours.' }
]
</script>

<template>
  <div class="br-root">
    <!-- Batch header -->
    <header class="br-header">
      <div class="br-header-grid">
        <div><span class="br-k">Document</span><span class="br-v">Batch Record No. 001</span></div>
        <div><span class="br-k">Product</span><span class="br-v">Production AI, one workflow</span></div>
        <div><span class="br-k">Lot</span><span class="br-v">CR-2026-001</span></div>
        <div><span class="br-k">Prepared by</span><span class="br-v">C.P. / T.V. — Criton.AI</span></div>
        <label class="br-reviewer">
          <span class="br-k">Reviewed by</span>
          <input
            v-model="reviewer"
            class="br-input"
            placeholder="type your name"
            maxlength="40"
            @change="onReviewerCommit"
          />
        </label>
      </div>
    </header>

    <div class="br-layout">
      <main class="br-main">
        <!-- Hero -->
        <section class="br-hero" data-step="STEP 00 — Opening">
          <p class="br-mono br-step">Step 00 · Opening statement</p>
          <h1 class="br-mega">Every batch<br />has a record.</h1>
          <p class="br-mega-sub">Does your AI?</p>
          <div class="br-counter">
            <div>
              <span class="br-mono br-counter-label">Actions on this page, logged</span>
              <span class="br-counter-value">{{ log.length }}</span>
            </div>
            <div>
              <span class="br-mono br-counter-label">Unlogged</span>
              <span class="br-counter-value">0</span>
            </div>
          </div>
          <p class="br-statement">
            On a production floor, nothing ships without a record: who did what, when, and against which
            procedure. <em>Your AI should keep the same records.</em>
          </p>
          <p class="br-lede">
            Criton is an AI studio in Los Angeles. We build production AI — agents, copilots, voice systems —
            that cite their sources, wait for a human signature, and log everything. This page does too.
            Watch the audit log as you read.
          </p>
        </section>

        <!-- Facts panel -->
        <section class="br-section br-facts-wrap" data-step="STEP 01 — Criton Facts">
          <p class="br-mono br-step">Step 01 · Composition</p>
          <div class="br-facts">
            <h2 class="br-facts-title">Criton Facts</h2>
            <div class="br-facts-row br-facts-thin"><span>Serving size</span><span>1 workflow</span></div>
            <div class="br-facts-row br-facts-thick"><span>Servings per engagement</span><span>1, to start</span></div>
            <div class="br-facts-row br-facts-head"><span>Amount per serving</span><span>&nbsp;</span></div>
            <div v-for="f in facts" :key="f.label" class="br-facts-row">
              <span><strong>{{ f.label }}</strong></span>
              <span>{{ f.value }}<sup>1</sup></span>
            </div>
            <div class="br-facts-row br-facts-thick br-facts-other">
              <span>Other ingredients: the founders, directly — {{ team.map((p) => p.name).join(' and ') }}.</span>
            </div>
            <p class="br-facts-fine">
              † These statements have not been evaluated by the Food and Drug Administration. This proposal is not
              intended to diagnose, treat, cure, or prevent any workflow.
            </p>
          </div>
        </section>

        <!-- Simulation -->
        <section class="br-section" data-step="STEP 02 — Copilot run">
          <p class="br-mono br-step">Step 02 · In-process test</p>
          <h2 class="br-h2">Run the copilot.</h2>
          <p class="br-lede">
            A simulation of an SOP copilot for plant teams. Ask it something. It answers only from approved
            procedures, cites the section, and waits for your signature. The third question is a trap.
          </p>
          <p class="br-mono br-sample">
            Source loaded: SAMPLE-SOP-014 rev C · Line clearance — a sample written for this page, not a real
            company document
          </p>
          <div class="br-sim">
            <div class="br-sim-qs">
              <button
                v-for="(s, i) in sim"
                :key="s.q"
                class="br-q"
                :class="{ on: active === i }"
                @click="ask(i)"
              >
                <span class="br-mono">Q{{ i + 1 }}</span>
                {{ s.q }}
              </button>
            </div>
            <div class="br-sim-out" aria-live="polite">
              <template v-if="active === null">
                <p class="br-mono br-idle">Awaiting question_</p>
              </template>
              <template v-else>
                <p class="br-answer">{{ typed }}<span v-if="!answerDone" class="br-caret">▍</span></p>
                <template v-if="answerDone">
                  <p v-if="sim[active]!.cite" class="br-mono br-cite">Source · {{ sim[active]!.cite }}</p>
                  <p v-else class="br-mono br-cite br-escalate">No approved source · escalated to a person</p>
                  <button
                    v-if="sim[active]!.cite"
                    class="br-sign"
                    :class="{ done: signedOff.has(active) }"
                    @click="signOff(active)"
                  >
                    {{ signedOff.has(active) ? `Signed — ${reviewerName}` : `Sign off as ${reviewerName}` }}
                  </button>
                </template>
              </template>
            </div>
          </div>
        </section>

        <!-- Certificate of analysis -->
        <section class="br-section" data-step="STEP 03 — Certificate of analysis">
          <p class="br-mono br-step">Step 03 · Certificate of analysis</p>
          <h2 class="br-h2">Four places to start. Results pending.</h2>
          <p class="br-lede">{{ ideasNote }}</p>
          <div class="br-table-wrap">
            <table class="br-coa">
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Specification</th>
                  <th>Method</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="idea in ideas" :key="idea.title">
                  <td><span class="br-mono br-tag">{{ idea.tag }}</span>{{ idea.title }}</td>
                  <td>{{ idea.measure }}</td>
                  <td>{{ idea.approach }}</td>
                  <td class="br-pending">Pending — your data</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Proposal -->
        <section class="br-section" data-step="STEP 04 — Pilot batch">
          <p class="br-mono br-step">Step 04 · Proposal</p>
          <h2 class="br-h2">Don't commission a project.<br />Run a pilot batch.</h2>
          <ol class="br-timeline">
            <li v-for="b in batch" :key="b.when" :class="{ open: b.open }">
              <span class="br-year">{{ b.when }}</span>
              <span class="br-year-text">{{ b.text }}</span>
            </li>
          </ol>
        </section>

        <!-- Release -->
        <section class="br-section br-release" data-step="STEP 05 — Release">
          <p class="br-mono br-step">Step 05 · Release</p>
          <h2 class="br-h2">Release this proposal.</h2>
          <p class="br-lede">Signing opens an email to us with your name on it. Tell us the workflow you'd start with.</p>
          <div class="br-release-row">
            <a :href="releaseMailto" class="br-release-btn" @click="release">
              Release as {{ reviewerName }}
            </a>
            <a :href="contact.tel" class="br-mono br-phone">or call Chris · {{ contact.phone }}</a>
          </div>
          <div v-if="released" class="br-stamp" aria-hidden="true">
            Released<br /><span>{{ reviewerName }} · {{ new Date().toLocaleDateString() }}</span>
          </div>
        </section>

        <footer class="br-footer">
          <p class="br-mono">Sources</p>
          <ol class="br-sources">
            <li><a href="https://criton.ai" target="_blank" rel="noopener">Criton capabilities and commitments as published on criton.ai</a></li>
          </ol>
          <p class="br-mono">© {{ new Date().getFullYear() }} Criton.AI · Los Angeles · {{ contact.email }}</p>
        </footer>
      </main>

      <!-- Audit log -->
      <aside class="br-log" :class="{ open: logOpen }" aria-label="Audit log">
        <div class="br-log-head">
          <span class="br-mono">Audit log · {{ log.length }} entries</span>
          <button class="br-log-close" @click="logOpen = false" aria-label="Close audit log">×</button>
        </div>
        <ol ref="logList" class="br-log-list">
          <li v-for="(e, i) in log" :key="i" :class="e.kind">
            <span class="br-log-time">{{ e.time }}</span>
            <span>{{ e.text }}</span>
          </li>
        </ol>
        <p class="br-log-note">
          This log lives only in this browser tab and disappears when you close it. (The site's standard
          analytics still counts page views.) It's here to show what "every action is traceable" looks like.
        </p>
      </aside>
      <button class="br-log-toggle" @click="logOpen = true">Audit log · {{ log.length }}</button>
    </div>

    <PharmSwitcher />
  </div>
</template>

<style scoped>
.br-root {
  --paper: #edebe4;
  --ink: #0d0d0d;
  --soft: #55534d;
  --klein: #002fa7;
  --rule: #0d0d0d;
  min-height: 100vh;
  background: var(--paper);
  color: var(--ink);
  font-family: 'Archivo', system-ui, sans-serif;
  font-size: 17px;
  line-height: 1.55;
  padding-bottom: 80px;
}
.br-root p { margin: 0; }
.br-mono {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* Header */
.br-header { border-bottom: 2px solid var(--rule); background: var(--paper); position: sticky; top: env(safe-area-inset-top, 0px); z-index: 20; }
.br-header-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
}
.br-header-grid > * { padding: 10px 16px; border-right: 1px solid var(--rule); display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.br-header-grid > *:last-child { border-right: 0; }
.br-k { text-transform: uppercase; letter-spacing: 0.06em; color: var(--soft); font-size: 10px; }
.br-v { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.br-input {
  font: 600 12px 'IBM Plex Mono', monospace;
  border: 0;
  border-bottom: 1px dashed var(--klein);
  background: transparent;
  color: var(--klein);
  padding: 0;
  outline: none;
  width: 100%;
}
.br-input::placeholder { color: var(--klein); opacity: 0.55; }

/* Layout */
.br-layout { display: grid; grid-template-columns: minmax(0, 1fr) 340px; }
.br-main { min-width: 0; border-right: 2px solid var(--rule); }
.br-hero, .br-section { padding: 72px 48px; border-bottom: 1px solid var(--rule); }
.br-step { color: var(--klein); margin-bottom: 28px !important; }

/* Hero */
.br-mega {
  font-weight: 900;
  font-stretch: 62%;
  font-variation-settings: 'wdth' 62;
  font-size: clamp(64px, 13vw, 220px);
  line-height: 0.82;
  letter-spacing: -0.02em;
  margin: 0;
  }
.br-sup { font: 500 14px 'IBM Plex Mono', monospace; vertical-align: top; margin-left: 6px; color: var(--soft); letter-spacing: 0; }
.br-mega-sub {
  font-weight: 800;
  font-variation-settings: 'wdth' 75;
  font-size: clamp(28px, 4.4vw, 64px);
  line-height: 1;
  text-transform: uppercase;
  margin-top: 12px !important;
}
.br-counter {
  display: inline-flex;
  gap: 40px;
  margin: 40px 0;
  padding: 18px 22px;
  border: 2px solid var(--klein);
  color: var(--klein);
}
.br-counter-value { font: 600 clamp(36px, 5vw, 64px)/1 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }
.br-counter > div { display: grid; gap: 6px; }
.br-counter-label { font-size: 11px; }
.br-statement {
  font: 400 clamp(26px, 3.2vw, 44px)/1.15 'Instrument Serif', Georgia, serif;
  max-width: 900px;
}
.br-statement em { color: var(--klein); }
.br-lede { max-width: 680px; color: var(--soft); margin-top: 24px !important; }

/* Facts panel */
.br-facts-wrap { display: grid; justify-items: start; }
.br-facts {
  width: min(460px, 100%);
  border: 2px solid var(--ink);
  padding: 8px 14px 14px;
  background: #fff;
  font-family: 'Archivo', sans-serif;
}
.br-facts-title {
  font-weight: 900;
  font-variation-settings: 'wdth' 62;
  font-size: 56px;
  line-height: 1;
  margin: 0;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--ink);
}
.br-facts-row { display: flex; justify-content: space-between; gap: 16px; padding: 6px 0; border-bottom: 1px solid var(--ink); font-size: 15px; }
.br-facts-row span:last-child { text-align: right; }
.br-facts-row sup { font-size: 10px; margin-left: 2px; }
.br-facts-thin { border-bottom-width: 1px; }
.br-facts-thick { border-bottom: 10px solid var(--ink); font-weight: 800; }
.br-facts-head { font-weight: 800; border-bottom-width: 4px; }
.br-facts-other { font-weight: 500; border-bottom: 4px solid var(--ink); }
.br-facts-fine { font-size: 12px; margin-top: 10px !important; line-height: 1.4; }

/* Simulation */
.br-h2 {
  font-weight: 900;
  font-variation-settings: 'wdth' 70;
  font-size: clamp(40px, 6vw, 88px);
  line-height: 0.92;
  text-transform: uppercase;
  margin: 0;
}
.br-sample { color: var(--soft); margin-top: 24px !important; border-left: 3px solid var(--klein); padding-left: 12px; line-height: 1.6; }
.br-sim { display: grid; grid-template-columns: 1fr 1.2fr; margin-top: 28px; border: 2px solid var(--ink); }
.br-sim-qs { display: grid; border-right: 2px solid var(--ink); }
.br-q {
  text-align: left;
  font: 500 16px/1.35 'Archivo', sans-serif;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--ink);
  padding: 18px;
  cursor: pointer;
  color: var(--ink);
  display: grid;
  gap: 6px;
}
.br-q:last-child { border-bottom: 0; }
.br-q:hover { background: #fff; }
.br-q.on { background: var(--ink); color: var(--paper); }
.br-sim-out { padding: 24px; background: #fff; min-height: 240px; display: grid; align-content: start; gap: 16px; }
.br-idle { color: var(--soft); }
.br-answer { font: 400 24px/1.3 'Instrument Serif', Georgia, serif; }
.br-caret { color: var(--klein); animation: br-blink 1s steps(1) infinite; }
@keyframes br-blink { 50% { opacity: 0; } }
.br-cite { color: var(--klein); }
.br-escalate { color: #b00020; }
.br-sign {
  justify-self: start;
  font: 600 13px 'IBM Plex Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 12px 18px;
  border: 2px solid var(--klein);
  background: transparent;
  color: var(--klein);
  cursor: pointer;
}
.br-sign:hover, .br-sign.done { background: var(--klein); color: #fff; }

/* Certificate of analysis */
.br-table-wrap { overflow-x: auto; margin-top: 28px; }
.br-coa { width: 100%; min-width: 760px; border-collapse: collapse; font-size: 15px; background: #fff; border: 2px solid var(--ink); }
.br-coa th {
  font: 600 11px 'IBM Plex Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  text-align: left;
  padding: 10px 14px;
  background: var(--ink);
  color: var(--paper);
}
.br-coa td { padding: 14px; border-top: 1px solid var(--ink); vertical-align: top; }
.br-coa td:first-child { font-weight: 700; width: 24%; }
.br-tag { display: block; color: var(--klein); margin-bottom: 4px; font-size: 10px; }
.br-pending { font: 600 12px 'IBM Plex Mono', monospace; color: var(--klein); text-transform: uppercase; white-space: nowrap; }

/* Timeline */
.br-timeline { list-style: none; margin: 0; padding: 0; }
.br-timeline li { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr); gap: 32px; align-items: baseline; border-top: 1px solid var(--ink); padding: 14px 0; }
.br-year {
  font-weight: 900;
  font-variation-settings: 'wdth' 62;
  font-size: clamp(40px, 5vw, 76px);
  line-height: 0.9;
  text-transform: uppercase;
  white-space: nowrap;
}
.br-year-text { font: 400 clamp(20px, 2.2vw, 30px)/1.2 'Instrument Serif', Georgia, serif; }
.br-year-text sup { font: 500 11px 'IBM Plex Mono', monospace; margin-left: 4px; color: var(--soft); }
.br-timeline li.open .br-year { color: var(--klein); -webkit-text-stroke: 0; }
.br-timeline li.open .br-year-text { color: var(--klein); font-style: italic; }

/* Release */
.br-release { position: relative; overflow: hidden; }
.br-release-row { display: flex; flex-wrap: wrap; align-items: center; gap: 24px; margin-top: 32px; }
.br-release-btn {
  display: inline-block;
  background: var(--klein);
  color: #fff;
  text-decoration: none;
  font-weight: 900;
  font-variation-settings: 'wdth' 75;
  text-transform: uppercase;
  font-size: clamp(20px, 2.6vw, 32px);
  padding: 20px 32px;
}
.br-release-btn:hover { background: var(--ink); }
.br-phone { color: var(--ink); text-decoration: none; border-bottom: 1px solid var(--ink); }
.br-stamp {
  position: absolute;
  right: 6%;
  top: 30%;
  transform: rotate(-12deg);
  border: 5px double var(--klein);
  color: var(--klein);
  padding: 12px 24px;
  font-weight: 900;
  font-variation-settings: 'wdth' 62;
  font-size: 64px;
  line-height: 0.9;
  text-transform: uppercase;
  text-align: center;
  mix-blend-mode: multiply;
  animation: br-stamp 0.35s ease-out;
  pointer-events: none;
}
.br-stamp span { font: 600 12px 'IBM Plex Mono', monospace; letter-spacing: 0.04em; }
@keyframes br-stamp { from { transform: rotate(-12deg) scale(2.2); opacity: 0; } to { transform: rotate(-12deg) scale(1); opacity: 1; } }

/* Footer */
.br-footer { padding: 40px 48px; display: grid; gap: 12px; font-size: 13px; color: var(--soft); }
.br-sources { margin: 0; padding-left: 20px; display: grid; gap: 4px; }
.br-sources a { color: var(--soft); }

/* Audit log */
.br-log {
  position: sticky;
  top: 58px;
  height: calc(100vh - 58px);
  display: flex;
  flex-direction: column;
  background: var(--ink);
  color: var(--paper);
}
.br-log-head { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid #333; color: #9db1ff; }
.br-log-close { display: none; background: none; border: 0; color: var(--paper); font-size: 24px; cursor: pointer; }
.br-log-list { list-style: none; margin: 0; padding: 8px 16px; overflow-y: auto; flex: 1; font: 12px/1.45 'IBM Plex Mono', monospace; }
.br-log-list li { display: grid; grid-template-columns: 68px 1fr; gap: 8px; padding: 6px 0; border-bottom: 1px dashed #2b2b2b; animation: br-in 0.3s ease-out; }
.br-log-list li.sign { color: #9db1ff; }
.br-log-list li.escalate { color: #ff8a8a; }
.br-log-time { color: #777; }
@keyframes br-in { from { opacity: 0; transform: translateY(4px); } }
.br-log-note { padding: 14px 16px; font-size: 11px; line-height: 1.5; color: #8a8a8a; border-top: 1px solid #333; }
.br-log-toggle { display: none; }

@media (prefers-reduced-motion: reduce) {
  .br-caret, .br-log-list li, .br-stamp { animation: none; }
}

@media (max-width: 960px) {
  .br-header-grid { grid-template-columns: 1fr 1fr; }
  .br-header-grid > *:nth-child(2), .br-header-grid > *:nth-child(3) { display: none; }
  .br-header-grid > * { border-bottom: 0; }
  .br-reviewer { grid-column: 1 / -1; border-top: 1px solid var(--rule); border-right: 0 !important; }
  .br-layout { grid-template-columns: 1fr; }
  .br-main { border-right: 0; }
  .br-hero, .br-section { padding: 48px 20px; }
  .br-footer { padding: 32px 20px; }
  .br-sim { grid-template-columns: 1fr; }
  .br-sim-qs { border-right: 0; border-bottom: 2px solid var(--ink); }
  .br-timeline li { grid-template-columns: 1fr; gap: 4px; }
  .br-stamp { font-size: 44px; top: auto; bottom: 16px; }
  .br-log {
    position: fixed;
    inset: auto 0 0 0;
    top: auto;
    height: 60vh;
    z-index: 60;
    transform: translateY(100%);
    transition: transform 0.25s;
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
  .br-log.open { transform: translateY(0); }
  .br-log-close { display: block; }
  .br-log-toggle {
    display: block;
    position: fixed;
    right: 16px;
    bottom: calc(76px + env(safe-area-inset-bottom, 0px));
    z-index: 30;
    background: var(--ink);
    color: var(--paper);
    border: 0;
    padding: 10px 14px;
    font: 600 11px 'IBM Plex Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    cursor: pointer;
  }
}
</style>
