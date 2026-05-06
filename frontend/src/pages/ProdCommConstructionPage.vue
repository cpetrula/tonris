<script setup lang="ts">
// Private pitch page for insurance carriers — not indexed.
// Companion to the recorded incident-intake demo.
import { ref, computed, onMounted } from 'vue'

onMounted(() => {
  const existing = document.querySelector('meta[name="robots"]')
  if (existing) existing.setAttribute('content', 'noindex, nofollow')
  else {
    const m = document.createElement('meta')
    m.name = 'robots'
    m.content = 'noindex, nofollow'
    document.head.appendChild(m)
  }
  document.title = 'ProdComm × Construction — Incident Intake Demo'
})

const audioEl = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)

const progressPct = computed(() => {
  if (!duration.value) return 0
  return (currentTime.value / duration.value) * 100
})

const fmt = (s: number) => {
  if (!isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

function togglePlay() {
  const a = audioEl.value
  if (!a) return
  if (a.paused) { a.play(); isPlaying.value = true }
  else { a.pause(); isPlaying.value = false }
}

function onTimeUpdate() { currentTime.value = audioEl.value?.currentTime || 0 }
function onLoaded() { duration.value = audioEl.value?.duration || 0 }
function onEnded() { isPlaying.value = false }

const beats = [
  {
    t: '0:00',
    label: 'Recording consent',
    body: 'Worker hits the line. The agent captures explicit consent before any intake. Two-party-state safe.'
  },
  {
    t: '0:08',
    label: 'PIN-authenticated identity',
    body: 'Worker says their four-digit PIN. The agent reads it back and proceeds — verified identity, on-record.'
  },
  {
    t: '0:25',
    label: 'Structured intake',
    body: 'Four questions, asked one at a time: what, where, when, who. The worker’s description is captured verbatim.'
  },
  {
    t: '0:55',
    label: 'Care options — neutrally presented',
    body: 'Both options listed in identical format with factual distance and address. No characterization. Worker chooses.'
  },
  {
    t: '1:25',
    label: 'Address texted, foreman notified, report logged',
    body: 'Logistics close out the call. The structured FNOL is timestamped and ready to flow into claims.'
  }
]

const valueProps = [
  {
    icon: 'pi pi-clock',
    title: 'FNOL timing measured in minutes, not days',
    body: 'Reports land within seconds of the call ending — not after a paper form makes it back to the office.'
  },
  {
    icon: 'pi pi-shield',
    title: 'Defensible by design',
    body: 'PIN-authenticated identity, recorded consent, neutrally-framed care language. Every record is a discoverable document the carrier can stand behind.'
  },
  {
    icon: 'pi pi-database',
    title: 'Structured at the source',
    body: 'No re-keying. Every field is captured as data — not narrative — at the moment it’s spoken.'
  },
  {
    icon: 'pi pi-volume-up',
    title: 'Multilingual & low-friction',
    body: 'Built on the same voice infrastructure already running on Hollywood sets in 70+ languages. Workers call. The system listens.'
  }
]
</script>

<template>
  <div class="bg-[color:var(--criton-bg)] text-[color:var(--criton-text)] min-h-screen">

    <!-- Minimal Criton-branded header (no nav, no distractions) -->
    <header class="border-b border-[color:var(--criton-border)] bg-[color:var(--criton-bg)]">
      <div class="max-w-6xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="/criton-logo.svg" alt="Criton" class="w-8 h-8" />
          <span class="font-display text-lg font-bold tracking-tight">CRITON</span>
        </div>
        <span class="criton-eyebrow text-[color:var(--criton-text-dim)]">AI Studio · Los Angeles</span>
      </div>
    </header>

    <!-- HERO -->
    <section class="criton-hero-bg relative overflow-hidden">
      <div class="max-w-6xl mx-auto px-6 lg:px-8 pt-24 pb-20 md:pt-32 md:pb-24">
        <div class="text-center">
          <div class="criton-pill mb-7">ProdComm × Construction</div>
          <h1
            class="font-display font-bold text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-6 max-w-4xl mx-auto"
          >
            Reducing ambiguity in construction —<br />
            <span class="italic criton-accent">before and after incidents.</span>
          </h1>
          <p
            class="text-lg md:text-xl text-[color:var(--criton-text-muted)] max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            A jobsite incident intake line that captures structured, defensible
            data the moment it happens. Then sends a claim-ready report into
            your existing claims process.
          </p>
        </div>

        <!-- AUDIO PLAYER CARD -->
        <div class="max-w-3xl mx-auto">
          <div class="criton-card rounded-xl p-7 md:p-9">
            <div class="flex items-center justify-between mb-5">
              <p class="criton-eyebrow">Listen — actual incident intake</p>
              <span class="text-xs text-[color:var(--criton-text-dim)] font-mono">
                {{ fmt(currentTime) }} / {{ fmt(duration) }}
              </span>
            </div>

            <div class="flex items-center gap-5">
              <button
                @click="togglePlay"
                class="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-[#e6c565] to-[#d4af37] text-[#0a0a0b] flex items-center justify-center hover:scale-105 transition-transform"
                :aria-label="isPlaying ? 'Pause' : 'Play'"
              >
                <i :class="['pi text-xl', isPlaying ? 'pi-pause' : 'pi-play']"></i>
              </button>

              <div class="flex-1">
                <div class="h-1.5 rounded-full bg-[color:var(--criton-border)] overflow-hidden">
                  <div
                    class="h-full bg-gradient-to-r from-[#d4af37] to-[#e6c565] transition-[width] duration-100"
                    :style="{ width: progressPct + '%' }"
                  ></div>
                </div>
                <p class="mt-3 text-sm text-[color:var(--criton-text-muted)] font-display italic">
                  Worker fall, twisted ankle. Wet plywood, second floor.
                </p>
              </div>
            </div>

            <audio
              ref="audioEl"
              src="/prodcomm-construction-demo.mp3"
              preload="metadata"
              @timeupdate="onTimeUpdate"
              @loadedmetadata="onLoaded"
              @ended="onEnded"
            />
          </div>

          <p class="text-center mt-5 text-xs text-[color:var(--criton-text-dim)] tracking-wider uppercase">
            Recording is illustrative · Names and locations fictional
          </p>
        </div>
      </div>
    </section>

    <!-- WHAT YOU JUST HEARD -->
    <section class="py-24 md:py-32 border-t border-[color:var(--criton-border)]">
      <div class="max-w-5xl mx-auto px-6 lg:px-8">
        <div class="max-w-2xl mb-14">
          <p class="criton-eyebrow mb-4">What you just heard</p>
          <h2 class="font-display font-bold text-3xl md:text-5xl leading-tight">
            Five beats. <span class="italic text-[color:var(--criton-text-muted)]">Ninety seconds.</span>
          </h2>
        </div>

        <div class="space-y-5">
          <div
            v-for="(b, i) in beats"
            :key="b.label"
            class="criton-card rounded-lg p-6 md:p-7 grid grid-cols-[auto_1fr] gap-5 md:gap-8"
          >
            <div class="flex flex-col items-center gap-3">
              <span class="criton-eyebrow text-[color:var(--criton-gold)]">{{ b.t }}</span>
              <span class="font-mono text-xs text-[color:var(--criton-text-dim)]">
                {{ String(i + 1).padStart(2, '0') }}
              </span>
            </div>
            <div>
              <h3 class="font-display text-xl md:text-2xl font-bold mb-2 leading-tight">
                {{ b.label }}
              </h3>
              <p class="text-[color:var(--criton-text-muted)] leading-relaxed">
                {{ b.body }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- THE ARTIFACT -->
    <section class="py-24 md:py-32 border-t border-[color:var(--criton-border)] bg-[color:var(--criton-surface)]">
      <div class="max-w-5xl mx-auto px-6 lg:px-8">
        <div class="max-w-2xl mb-14">
          <p class="criton-eyebrow mb-4">What lands in claims</p>
          <h2 class="font-display font-bold text-3xl md:text-5xl leading-tight">
            One call.<br />
            <span class="italic text-[color:var(--criton-text-muted)]">One claim-ready report.</span>
          </h2>
        </div>

        <!-- White-paper styled report embedded on dark bg -->
        <div class="rounded-lg overflow-hidden shadow-2xl border border-[color:var(--criton-border-bright)]">
          <div class="bg-white text-[#111] p-8 md:p-12 font-sans text-sm md:text-[15px] leading-[1.55]">

            <!-- Report header -->
            <div class="flex items-end justify-between border-b-2 border-black pb-4 mb-6">
              <div>
                <div class="font-bold text-[15px] tracking-wide">PRODCOMM &nbsp;·&nbsp; CONSTRUCTION</div>
                <div class="text-[10px] uppercase tracking-[1.5px] text-gray-600 mt-1">
                  First Notice of Incident — Voice Intake
                </div>
              </div>
              <div class="font-mono text-[10px] text-gray-600 text-right leading-relaxed">
                Report ID: INC-20260506-1043<br />
                Generated: 2026-05-06 12:06:51 PT<br />
                Source: incident_intake_line
              </div>
            </div>

            <h3 class="text-[18px] font-semibold mb-6">Incident Intake Report</h3>

            <!-- Worker -->
            <div class="mb-6">
              <div class="text-[10px] uppercase tracking-[1.5px] text-gray-600 border-b border-gray-200 pb-1 mb-3 font-semibold">Worker</div>
              <div class="grid grid-cols-[180px_1fr] gap-y-2 gap-x-4 text-[14px]">
                <div class="text-gray-600">Worker ID</div><div class="font-mono">WK-5678 <span class="text-green-700">(PIN-authenticated)</span></div>
                <div class="text-gray-600">Project</div><div>Greenfield Site</div>
                <div class="text-gray-600">On-scene contact</div><div>Foreman Mike (post-incident, present at report time)</div>
              </div>
            </div>

            <!-- Incident -->
            <div class="mb-6">
              <div class="text-[10px] uppercase tracking-[1.5px] text-gray-600 border-b border-gray-200 pb-1 mb-3 font-semibold">Incident</div>
              <div class="grid grid-cols-[180px_1fr] gap-y-2 gap-x-4 text-[14px]">
                <div class="text-gray-600">Time reported</div><div class="font-mono">2026-05-06 12:06:24 PT</div>
                <div class="text-gray-600">Time of incident</div><div class="font-mono">~2026-05-06 12:00 PT <span class="text-gray-500">(≈5 min before)</span></div>
                <div class="text-gray-600">Location</div><div>Building 2 · Second floor · Near north stairwell</div>
                <div class="text-gray-600">Mechanism</div><div>Slip on wet plywood</div>
                <div class="text-gray-600">Description (verbatim)</div>
                <div class="border-l-[3px] border-gray-400 pl-3 italic text-gray-800 text-[13px]">
                  "I slipped on a wet section of plywood. Came down hard on my right ankle. Can't put weight on it."
                </div>
                <div class="text-gray-600">Witnesses</div><div>Foreman Mike — did not witness fall</div>
              </div>
            </div>

            <!-- Care options -->
            <div class="mb-6">
              <div class="text-[10px] uppercase tracking-[1.5px] text-gray-600 border-b border-gray-200 pb-1 mb-3 font-semibold">Care Options Presented</div>
              <p class="text-[12px] text-gray-600 mb-3">
                Both options were presented in identical format with factual distance and address only.
                System did not characterize, rank, or recommend either option.
              </p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="border border-gray-300 rounded p-3">
                  <div class="text-[10px] uppercase tracking-[1.2px] text-gray-500 mb-1">Option 1 — Emergency Room</div>
                  <div class="font-semibold">Greenfield Memorial</div>
                  <div class="text-[12px] text-gray-600 font-mono mt-1">0.7 mi · Hospital Way</div>
                </div>
                <div class="border-2 border-black rounded p-3 bg-gray-50 relative">
                  <div class="absolute -top-2 right-2 bg-black text-white text-[8px] tracking-[1px] font-semibold px-2 py-[2px]">WORKER SELECTION</div>
                  <div class="text-[10px] uppercase tracking-[1.2px] text-gray-500 mb-1">Option 2 — Urgent Care</div>
                  <div class="font-semibold">Lone Pine Medical</div>
                  <div class="text-[12px] text-gray-600 font-mono mt-1">1.3 mi · Industrial Boulevard</div>
                </div>
              </div>
              <div class="grid grid-cols-[180px_1fr] gap-y-2 gap-x-4 text-[14px] mt-4">
                <div class="text-gray-600">Read-back confirmed</div><div>Yes</div>
                <div class="text-gray-600">Directions text-out</div><div>Confirmed delivered</div>
              </div>
            </div>

            <!-- Data integrity -->
            <div class="mb-2">
              <div class="text-[10px] uppercase tracking-[1.5px] text-gray-600 border-b border-gray-200 pb-1 mb-3 font-semibold">Data Integrity</div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 text-[13px]">
                <div class="flex justify-between border-b border-dotted border-gray-200 py-1"><span class="text-gray-600">PIN-authenticated identity</span><span class="text-green-700 font-bold">✓</span></div>
                <div class="flex justify-between border-b border-dotted border-gray-200 py-1"><span class="text-gray-600">Recording consent captured</span><span class="text-green-700 font-bold">✓</span></div>
                <div class="flex justify-between border-b border-dotted border-gray-200 py-1"><span class="text-gray-600">Description recorded verbatim</span><span class="text-green-700 font-bold">✓</span></div>
                <div class="flex justify-between border-b border-dotted border-gray-200 py-1"><span class="text-gray-600">Care selection documented</span><span class="text-green-700 font-bold">✓</span></div>
                <div class="flex justify-between border-b border-dotted border-gray-200 py-1"><span class="text-gray-600">No medical determination</span><span class="text-green-700 font-bold">✓</span></div>
                <div class="flex justify-between border-b border-dotted border-gray-200 py-1"><span class="text-gray-600">Time-to-FNOL</span><span class="font-mono">&lt; 1 sec</span></div>
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-gray-200 text-[10px] text-gray-500 font-mono">
              Sample / illustrative document. All names and locations fictional.
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- WHY THIS MATTERS -->
    <section class="py-24 md:py-32 border-t border-[color:var(--criton-border)]">
      <div class="max-w-6xl mx-auto px-6 lg:px-8">
        <div class="max-w-2xl mb-14">
          <p class="criton-eyebrow mb-4">Why this matters to claims</p>
          <h2 class="font-display font-bold text-3xl md:text-5xl leading-tight">
            We don't replace your claims process.<br />
            <span class="italic text-[color:var(--criton-text-muted)]">We improve what flows into it.</span>
          </h2>
        </div>

        <div class="grid sm:grid-cols-2 gap-5">
          <div
            v-for="v in valueProps"
            :key="v.title"
            class="criton-card rounded-lg p-7 md:p-8"
          >
            <div class="w-10 h-10 rounded-md bg-[color:var(--criton-surface-2)] border border-[color:var(--criton-border)] flex items-center justify-center mb-6">
              <i :class="[v.icon, 'text-lg text-[color:var(--criton-gold)]']"></i>
            </div>
            <h3 class="font-display text-xl md:text-2xl font-bold mb-3 leading-tight">{{ v.title }}</h3>
            <p class="text-[color:var(--criton-text-muted)] leading-relaxed">{{ v.body }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- PILOT -->
    <section class="py-24 md:py-32 border-t border-[color:var(--criton-border)] bg-[color:var(--criton-surface)]">
      <div class="max-w-5xl mx-auto px-6 lg:px-8">
        <div class="max-w-2xl mb-14">
          <p class="criton-eyebrow mb-4">Pilot proposal</p>
          <h2 class="font-display font-bold text-3xl md:text-5xl leading-tight">
            One GC. One to three sites. <span class="italic text-[color:var(--criton-text-muted)]">Sixty days.</span>
          </h2>
        </div>

        <div class="grid sm:grid-cols-3 gap-5">
          <div class="criton-card rounded-lg p-7">
            <p class="criton-eyebrow mb-3">Focus</p>
            <ul class="text-[color:var(--criton-text-muted)] leading-relaxed space-y-1.5">
              <li>· Safety acknowledgments</li>
              <li>· Coordination confirmations</li>
              <li>· Incident intake</li>
            </ul>
          </div>
          <div class="criton-card rounded-lg p-7">
            <p class="criton-eyebrow mb-3">Measure</p>
            <ul class="text-[color:var(--criton-text-muted)] leading-relaxed space-y-1.5">
              <li>· Time from incident to report</li>
              <li>· Completeness of initial data</li>
              <li>· Reduction in claim ambiguity</li>
            </ul>
          </div>
          <div class="criton-card rounded-lg p-7">
            <p class="criton-eyebrow mb-3">Outcome</p>
            <ul class="text-[color:var(--criton-text-muted)] leading-relaxed space-y-1.5">
              <li>· Cleaner claim inputs</li>
              <li>· Faster FNOL</li>
              <li>· A real-time risk dataset</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-24 md:py-32 border-t border-[color:var(--criton-border)] criton-hero-bg">
      <div class="max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <h2 class="font-display font-bold text-3xl md:text-5xl leading-tight mb-7">
          Worth fifteen minutes<br />
          <span class="italic criton-accent">to find out?</span>
        </h2>
        <p class="text-lg text-[color:var(--criton-text-muted)] max-w-xl mx-auto mb-10 leading-relaxed">
          Built by Criton — the studio behind ProdComm, already running this voice
          infrastructure on production sets in 70+ languages.
        </p>
        <a
          href="mailto:tvazquez@criton.ai?subject=ProdComm%20Construction%20%E2%80%94%2015%20min"
          class="criton-btn-primary"
        >
          Schedule a 15-minute call
          <i class="pi pi-arrow-right text-xs"></i>
        </a>
        <p class="mt-6 text-sm text-[color:var(--criton-text-dim)]">
          Or reply to the email that brought you here.
        </p>
      </div>
    </section>

  </div>
</template>
