<script setup lang="ts">
// Private pitch page for JCPenney Beauty & Salon — not indexed.
// Companion to the recorded after-hours booking demo.
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
  document.title = 'JCPenney Salon × Criton — 24/7 Booking Demo'
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
    label: 'Recording consent + warm open',
    body: 'Customer reaches the booking line at 9 PM. Recording consent captured in the first sentence — the call that today rolls to voicemail starts here.'
  },
  {
    t: '0:12',
    label: 'Service captured',
    body: 'Customer asks for a haircut for tomorrow morning. The agent captures the service type cleanly, no hold music.'
  },
  {
    t: '0:25',
    label: 'Slot offered directly',
    body: 'No "let me check the calendar." A 9:30 AM slot is presented immediately. Customer accepts.'
  },
  {
    t: '0:42',
    label: 'Identity captured',
    body: 'Name and phone number captured in one turn. Even when delivered messily, the agent parses both fields cleanly.'
  },
  {
    t: '0:55',
    label: 'Read-back, confirmation, close',
    body: 'Booking is read back, customer confirms, agent fires SMS confirmation, call ends. Total runtime: 68 seconds.'
  }
]

const valueProps = [
  {
    icon: 'pi pi-clock',
    title: 'Never sleeps',
    body: 'Answers calls at 6:30 AM, 11 PM, weekends, holidays. The bookings that today roll to voicemail get captured — at every store, every day.'
  },
  {
    icon: 'pi pi-users',
    title: 'Never calls in sick',
    body: 'No no-show receptionists, no ghosting front desks, no "I forgot to check the messages." Same answer rate at every location.'
  },
  {
    icon: 'pi pi-database',
    title: 'Structured at the source',
    body: 'Service, date, time, name, phone — captured as data, not a voicemail your team has to listen to. Drops directly into your booking system.'
  },
  {
    icon: 'pi pi-language',
    title: 'Multilingual',
    body: 'Built on voice infrastructure that handles 70+ languages in real time. Spanish-speaking customers get the same flow as English-speaking ones.'
  }
]

const pilotMath = [
  { metric: 'JCPenney Salon footprint', value: '750+', unit: 'locations' },
  { metric: 'Average salon ticket', value: '$60–80', unit: 'per visit' },
  { metric: 'Industry after-hours miss rate', value: '30–40%', unit: 'of phone volume' },
  { metric: 'Conservative scenario (1 call/wk/store)', value: '~$2.6M', unit: 'annual recovered revenue' },
  { metric: 'Mid-case scenario (2 calls/wk/store)', value: '~$5.3M', unit: 'annual recovered revenue' },
]
</script>

<template>
  <div class="bg-[color:var(--criton-bg)] text-[color:var(--criton-text)] min-h-screen">

    <!-- Minimal Criton-branded header -->
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
          <div class="criton-pill mb-7">JCPenney Beauty &amp; Salon × Criton</div>
          <h1
            class="font-display font-bold text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-6 max-w-4xl mx-auto"
          >
            Recover the bookings you're<br />
            <span class="italic criton-accent">losing after 6 PM.</span>
          </h1>
          <p
            class="text-lg md:text-xl text-[color:var(--criton-text-muted)] max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            A 24/7 voice booking line for the JCPenney Salon network. Never calls
            in sick, never on vacation, never lets a phone ring out. Drops every
            booking — structured — straight into your scheduling system.
          </p>
        </div>

        <!-- AUDIO PLAYER -->
        <div class="max-w-3xl mx-auto">
          <div class="criton-card rounded-xl p-7 md:p-9">
            <div class="flex items-center justify-between mb-5">
              <p class="criton-eyebrow">Listen — sample after-hours booking</p>
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
                  Customer calls at 9 PM, books a haircut for tomorrow morning.
                </p>
              </div>
            </div>

            <audio
              ref="audioEl"
              src="/jcpenneysalon-demo.mp3"
              preload="metadata"
              @timeupdate="onTimeUpdate"
              @loadedmetadata="onLoaded"
              @ended="onEnded"
            />
          </div>

          <p class="text-center mt-5 text-xs text-[color:var(--criton-text-dim)] tracking-wider uppercase">
            Recording is illustrative · Names and times are sample
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
            Five beats. <span class="italic text-[color:var(--criton-text-muted)]">Sixty-eight seconds.</span>
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

    <!-- THE BOOKING ARTIFACT -->
    <section class="py-24 md:py-32 border-t border-[color:var(--criton-border)] bg-[color:var(--criton-surface)]">
      <div class="max-w-5xl mx-auto px-6 lg:px-8">
        <div class="max-w-2xl mb-14">
          <p class="criton-eyebrow mb-4">What lands in your scheduling system</p>
          <h2 class="font-display font-bold text-3xl md:text-5xl leading-tight">
            One call.<br />
            <span class="italic text-[color:var(--criton-text-muted)]">One structured booking.</span>
          </h2>
        </div>

        <div class="rounded-lg overflow-hidden shadow-2xl border border-[color:var(--criton-border-bright)]">
          <div class="bg-white text-[#111] p-8 md:p-12 font-sans text-sm md:text-[15px] leading-[1.55]">

            <div class="flex items-end justify-between border-b-2 border-black pb-4 mb-6">
              <div>
                <div class="font-bold text-[15px] tracking-wide">JCPENNEY &nbsp;·&nbsp; SALON BOOKING</div>
                <div class="text-[10px] uppercase tracking-[1.5px] text-gray-600 mt-1">
                  Booking record — Voice intake (after-hours)
                </div>
              </div>
              <div class="font-mono text-[10px] text-gray-600 text-right leading-relaxed">
                Booking ID: BKG-20260507-0930-MR<br />
                Captured: 2026-05-06 21:08:22 PT<br />
                Source: voice_booking_line
              </div>
            </div>

            <h3 class="text-[18px] font-semibold mb-6">Appointment Booking</h3>

            <div class="mb-6">
              <div class="text-[10px] uppercase tracking-[1.5px] text-gray-600 border-b border-gray-200 pb-1 mb-3 font-semibold">Customer</div>
              <div class="grid grid-cols-[180px_1fr] gap-y-2 gap-x-4 text-[14px]">
                <div class="text-gray-600">Name</div><div>Maria Rodriguez</div>
                <div class="text-gray-600">Phone</div><div class="font-mono">(818) 555-0142</div>
                <div class="text-gray-600">SMS opt-in</div><div>Confirmed at intake</div>
              </div>
            </div>

            <div class="mb-6">
              <div class="text-[10px] uppercase tracking-[1.5px] text-gray-600 border-b border-gray-200 pb-1 mb-3 font-semibold">Appointment</div>
              <div class="grid grid-cols-[180px_1fr] gap-y-2 gap-x-4 text-[14px]">
                <div class="text-gray-600">Service</div><div>Haircut</div>
                <div class="text-gray-600">Date</div><div class="font-mono">2026-05-07 (Thursday)</div>
                <div class="text-gray-600">Time</div><div class="font-mono">9:30 AM</div>
                <div class="text-gray-600">Stylist</div><div>Auto-assigned at store</div>
                <div class="text-gray-600">Location</div><div>JCPenney Salon — [Store assignment from caller phone]</div>
              </div>
            </div>

            <div class="mb-6">
              <div class="text-[10px] uppercase tracking-[1.5px] text-gray-600 border-b border-gray-200 pb-1 mb-3 font-semibold">Call Record</div>
              <div class="grid grid-cols-[180px_1fr] gap-y-2 gap-x-4 text-[14px]">
                <div class="text-gray-600">Inbound at</div><div class="font-mono">2026-05-06 21:07:14 PT</div>
                <div class="text-gray-600">Recording consent</div><div>Confirmed at 0:08</div>
                <div class="text-gray-600">Call duration</div><div class="font-mono">68 seconds</div>
                <div class="text-gray-600">Outcome</div><div>Booking captured · SMS confirmation sent</div>
                <div class="text-gray-600">After-hours flag</div><div>Yes — outside store hours</div>
              </div>
            </div>

            <div class="mb-2">
              <div class="text-[10px] uppercase tracking-[1.5px] text-gray-600 border-b border-gray-200 pb-1 mb-3 font-semibold">System Output</div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 text-[13px]">
                <div class="flex justify-between border-b border-dotted border-gray-200 py-1"><span class="text-gray-600">Pushed to scheduling system</span><span class="text-green-700 font-bold">✓</span></div>
                <div class="flex justify-between border-b border-dotted border-gray-200 py-1"><span class="text-gray-600">SMS confirmation sent</span><span class="text-green-700 font-bold">✓</span></div>
                <div class="flex justify-between border-b border-dotted border-gray-200 py-1"><span class="text-gray-600">Calendar slot held</span><span class="text-green-700 font-bold">✓</span></div>
                <div class="flex justify-between border-b border-dotted border-gray-200 py-1"><span class="text-gray-600">Stylist roster updated</span><span class="text-green-700 font-bold">✓</span></div>
                <div class="flex justify-between border-b border-dotted border-gray-200 py-1"><span class="text-gray-600">Audio recording on file</span><span class="font-mono">conv_ID</span></div>
                <div class="flex justify-between border-b border-dotted border-gray-200 py-1"><span class="text-gray-600">Time-from-call-to-booking</span><span class="font-mono">&lt; 1 sec</span></div>
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-gray-200 text-[10px] text-gray-500 font-mono">
              Sample / illustrative booking record. Names and store assignments fictional.
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- THE MATH -->
    <section class="py-24 md:py-32 border-t border-[color:var(--criton-border)]">
      <div class="max-w-5xl mx-auto px-6 lg:px-8">
        <div class="max-w-2xl mb-14">
          <p class="criton-eyebrow mb-4">The math at JCPenney scale</p>
          <h2 class="font-display font-bold text-3xl md:text-5xl leading-tight">
            Even one missed call per store per week<br />
            <span class="italic criton-accent">is millions in recovered revenue.</span>
          </h2>
        </div>

        <div class="rounded-lg border border-[color:var(--criton-border)] bg-[color:var(--criton-surface)] overflow-hidden">
          <div
            v-for="(row, i) in pilotMath"
            :key="row.metric"
            class="px-6 md:px-8 py-5 grid grid-cols-[1fr_auto] items-baseline gap-6"
            :class="{ 'border-t border-[color:var(--criton-border)]': i > 0 }"
          >
            <div>
              <div class="text-[color:var(--criton-text-muted)] text-sm uppercase tracking-wider">
                {{ row.metric }}
              </div>
            </div>
            <div class="text-right">
              <span class="font-display text-2xl md:text-3xl font-bold criton-accent">{{ row.value }}</span>
              <span class="ml-2 text-sm text-[color:var(--criton-text-dim)]">{{ row.unit }}</span>
            </div>
          </div>
        </div>

        <p class="text-sm text-[color:var(--criton-text-dim)] mt-6 leading-relaxed max-w-2xl">
          Math is illustrative. Real number depends on JCPenney Salon's current
          after-hours phone volume and conversion rate — easy to model with one
          week of data from a pilot location.
        </p>
      </div>
    </section>

    <!-- WHY THIS WORKS -->
    <section class="py-24 md:py-32 border-t border-[color:var(--criton-border)] bg-[color:var(--criton-surface)]">
      <div class="max-w-6xl mx-auto px-6 lg:px-8">
        <div class="max-w-2xl mb-14">
          <p class="criton-eyebrow mb-4">Why this works for retail salons</p>
          <h2 class="font-display font-bold text-3xl md:text-5xl leading-tight">
            Built for the calls<br />
            <span class="italic text-[color:var(--criton-text-muted)]">your team can't take.</span>
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
    <section class="py-24 md:py-32 border-t border-[color:var(--criton-border)]">
      <div class="max-w-5xl mx-auto px-6 lg:px-8">
        <div class="max-w-2xl mb-14">
          <p class="criton-eyebrow mb-4">Pilot proposal</p>
          <h2 class="font-display font-bold text-3xl md:text-5xl leading-tight">
            One to three stores. <span class="italic text-[color:var(--criton-text-muted)]">Sixty days.</span>
          </h2>
        </div>

        <div class="grid sm:grid-cols-3 gap-5">
          <div class="criton-card rounded-lg p-7">
            <p class="criton-eyebrow mb-3">Setup</p>
            <ul class="text-[color:var(--criton-text-muted)] leading-relaxed space-y-1.5">
              <li>· Forwarding from store after-hours</li>
              <li>· Booking-system integration</li>
              <li>· SMS confirmation flow</li>
            </ul>
          </div>
          <div class="criton-card rounded-lg p-7">
            <p class="criton-eyebrow mb-3">Measure</p>
            <ul class="text-[color:var(--criton-text-muted)] leading-relaxed space-y-1.5">
              <li>· After-hours capture rate</li>
              <li>· Booking-to-show rate</li>
              <li>· Customer satisfaction</li>
            </ul>
          </div>
          <div class="criton-card rounded-lg p-7">
            <p class="criton-eyebrow mb-3">Outcome</p>
            <ul class="text-[color:var(--criton-text-muted)] leading-relaxed space-y-1.5">
              <li>· Validated revenue recovery</li>
              <li>· Footprint expansion case</li>
              <li>· Multi-language readiness</li>
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
          Built by Criton — an AI studio in Los Angeles building voice
          infrastructure for service businesses at scale.
        </p>
        <a
          href="mailto:tvazquez@criton.ai?subject=JCPenney%20Salon%20%E2%80%94%2024%2F7%20Booking%20Demo"
          class="criton-btn-primary"
        >
          Schedule a 15-minute call
          <i class="pi pi-arrow-right text-xs"></i>
        </a>
        <p class="mt-6 text-sm text-[color:var(--criton-text-dim)]">
          Or reply to the message that brought you here.
        </p>
      </div>
    </section>

  </div>
</template>
