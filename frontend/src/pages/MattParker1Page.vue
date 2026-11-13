<script setup lang="ts">
// Private website mockup for Matthew Parker, version 1: restrained and product-led.
// Gold from his truck wrap leads; teal and black support. Not indexed.
import { ref, onMounted, onBeforeUnmount } from 'vue'

const thread = [
  { me: true, text: 'Car died on I-44 by Yale. My two kids are with me.' },
  { me: false, text: "You're not alone. Are you off the road and somewhere safe?" },
  { me: true, text: 'Shoulder. Hazards on.' },
  { me: false, text: 'Tap to share where you are.', link: 'parkers.help/7KQ' },
  { me: true, loc: true, text: 'Location shared' },
  { me: false, text: 'Can you send a photo of the car and the dashboard?' },
  { me: true, photo: true, text: 'Battery light is on' },
  { me: false, good: true, text: 'Matt has a battery on the truck. He is on the way, about 20 minutes.' },
]
const photos = [
  { src: '/mattparker/roadside.jpg', alt: 'A woman stranded on the roadside with her car hood up', caption: 'Stopped on the shoulder' },
  { src: '/mattparker/family.jpg', alt: 'Matt with a young woman next to her car', caption: 'Back on the road' },
  { src: '/mattparker/free-car.jpg', alt: 'A woman holding a FREE CAR sign in the truck with Matt', caption: 'A free car' },
  { src: '/mattparker/dad-girls.jpg', alt: 'A dad walking along the road with two girls', caption: 'A dad and two girls, walking' },
  { src: '/mattparker/ride.jpg', alt: 'Matt giving an older man a ride', caption: 'A ride home' },
  { src: '/mattparker/neighbors.jpg', alt: 'A family in their front yard', caption: 'Neighbors helping neighbors' },
]
const shown = ref(0)
const threadEl = ref<HTMLElement | null>(null)
const notice = ref('')
let timer: number | undefined
let observer: IntersectionObserver | undefined

const play = () => {
  if (shown.value >= thread.length) return
  timer = window.setInterval(() => {
    shown.value += 1
    if (shown.value >= thread.length) window.clearInterval(timer)
  }, 1100)
}

const mock = (what: string) => {
  notice.value = `Mockup: "${what}" will work once the help line is built.`
  window.setTimeout(() => (notice.value = ''), 3200)
}

onMounted(() => {
  const robots = document.querySelector('meta[name="robots"]')
  if (robots) robots.setAttribute('content', 'noindex, nofollow')
  else {
    const m = document.createElement('meta')
    m.name = 'robots'
    m.content = 'noindex, nofollow'
    document.head.appendChild(m)
  }
  document.title = "Parker's Mobile Mechanics: website mockup 1"
  const href = 'https://fonts.googleapis.com/css2?family=Anton&family=Kaushan+Script&family=Inter:wght@400;500;600;700;800&display=swap'
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
  }
  window.scrollTo(0, 0)

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    shown.value = thread.length
    return
  }
  observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { play(); observer?.disconnect() }
  }, { threshold: 0.35 })
  if (threadEl.value) observer.observe(threadEl.value)
})

onBeforeUnmount(() => { window.clearInterval(timer); observer?.disconnect() })
</script>

<template>
  <div class="p1">
    <div class="p1-ribbon">
      Website mockup for Matthew Parker by <a href="https://criton.ai">Criton.AI</a>. Not live. Numbers are examples.
    </div>

    <header class="p1-nav">
      <div class="p1-wrap p1-nav-in">
        <a href="#top" class="p1-lockup" aria-label="Parker's Mobile Mechanics"><img src="/mattparker/logo.png" alt="Parker's Mobile Mechanics" class="p1-logo-img" /></a>
        <nav class="p1-links">
          <a href="#how">How it works</a>
          <a href="#give">Give</a>
          <a href="#repairs">Repairs</a>
        </nav>
        <button class="p1-pill" @click="mock('Text the help line')">Text for help</button>
      </div>
    </header>

    <!-- 1. Make them care -->
    <section id="top" class="p1-hero">
      <div class="p1-wrap p1-hero-in">
        <div class="p1-hero-copy">
          <p class="p1-eyebrow">Tulsa · day or night</p>
          <h1 class="p1-h1">Broken down.<br />Kids in the back.<br />Nobody to call.</h1>
          <p class="p1-lede">Now there is. Text Parker's, and help is on the way.</p>
          <div class="p1-ctas">
            <button class="p1-btn p1-btn-ink" @click="mock('Text the help line')">Text (918) HELP-NOW</button>
            <a href="#give" class="p1-link">Help someone else →</a>
          </div>
          <p class="p1-fine">In danger or in a live lane? Call 911 first.</p>
        </div>
        <figure class="p1-hero-photo">
          <img src="/mattparker/logo.png" alt="" class="p1-hero-logo" aria-hidden="true" />
          <img src="/mattparker/matt-truck.jpg" alt="Matthew Parker with his YouTube Silver Play Button in front of the Parker's truck" />
          <figcaption class="p1-badge">
            <b>2.57M</b>
            <span>people follow Matt's free repairs</span>
          </figcaption>
          <figcaption class="p1-badge p1-badge-live">
            <i></i> Matt is on a call in Broken Arrow
          </figcaption>
        </figure>
      </div>
      <div class="p1-band" aria-hidden="true"><span></span><span></span></div>
    </section>

    <!-- Real moments -->
    <section class="p1-reel" aria-label="Moments from Matt's videos">
      <div class="p1-reel-track">
        <a v-for="(p, i) in [...photos, ...photos]" :key="i" :aria-hidden="i >= photos.length" class="p1-reel-item" href="https://youtube.com/@ParkersMobile" target="_blank" rel="noopener">
          <img :src="p.src" :alt="p.alt" loading="lazy" />
          <span>{{ p.caption }}</span>
        </a>
      </div>
    </section>

    <!-- 2. Show the product -->
    <section id="how" class="p1-show">
      <div class="p1-wrap p1-show-in">
        <div class="p1-show-copy">
          <p class="p1-kicker">The help line</p>
          <h2 class="p1-h2">It answers every time.</h2>
          <p class="p1-body">
            Someone stranded texts or calls. The line finds out where they are, what's wrong and
            whether kids are with them. They send a photo of the car, so Matt brings the right part
            the first time.
          </p>
          <ul class="p1-points">
            <li><b>No voicemail.</b> Every call and text gets an answer, in English or Spanish.</li>
            <li><b>One-tap location.</b> Even on a dark shoulder with no exit sign.</li>
            <li><b>A photo first.</b> Matt sees the problem before he leaves.</li>
          </ul>
        </div>
        <div ref="threadEl" class="p1-phone" aria-label="Example conversation with the help line">
          <div class="p1-phone-bar">Parker's Help Line</div>
          <div class="p1-thread">
            <transition-group name="p1-msg">
              <div v-for="(m, i) in thread.slice(0, shown)" :key="i"
                   :class="['p1-msg', m.me ? 'p1-me' : 'p1-them', { 'p1-good': m.good }]">
                <template v-if="m.photo">
                  <svg viewBox="0 0 160 90" class="p1-photo" role="img" aria-label="Photo of the car">
                    <rect width="160" height="90" rx="8" fill="#1c2427" />
                    <rect y="60" width="160" height="30" fill="#2a3337" />
                    <path d="M32 58 L47 39 H104 L124 58 Z" fill="#c7cfd2" />
                    <rect x="24" y="56" width="112" height="16" rx="5" fill="#e3e8ea" />
                    <circle cx="50" cy="74" r="8" fill="#0b0b0b" /><circle cx="110" cy="74" r="8" fill="#0b0b0b" />
                    <rect x="26" y="60" width="10" height="5" rx="2" fill="#F7B32B" />
                    <rect x="124" y="60" width="10" height="5" rx="2" fill="#F7B32B" />
                  </svg>
                  <span>{{ m.text }}</span>
                </template>
                <template v-else-if="m.loc">📍 {{ m.text }}</template>
                <template v-else>{{ m.text }} <u v-if="m.link">{{ m.link }}</u></template>
              </div>
            </transition-group>
            <div v-if="shown < thread.length" class="p1-typing" aria-hidden="true"><i></i><i></i><i></i></div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. What Matt sees -->
    <section class="p1-matt">
      <div class="p1-wrap p1-matt-in">
        <div class="p1-map" aria-label="Example map of people waiting">
          <div class="p1-road p1-road-a"></div><div class="p1-road p1-road-b"></div><div class="p1-road p1-road-c"></div>
          <span class="p1-pin p1-pin-red" style="left: 58%; top: 34%"></span>
          <span class="p1-pin p1-pin-gold" style="left: 28%; top: 62%"></span>
          <span class="p1-pin p1-pin-gold" style="left: 78%; top: 70%"></span>
          <span class="p1-me-dot" style="left: 44%; top: 50%"></span>
          <div class="p1-card">
            <span class="p1-dot"></span>
            <div><b>Mom + 2 kids · dead battery</b><small>I-44 at Yale · 2.1 mi · waiting 6 min · 38°F</small></div>
          </div>
        </div>
        <div>
          <p class="p1-kicker">What Matt sees</p>
          <h2 class="p1-h2">The most urgent call, first.</h2>
          <p class="p1-body">
            Everyone waiting is on one map. Kids in the car, a freezing night or a dark shoulder
            moves them to the top. Matt taps a pin and goes, and the line keeps both of them updated
            until he pulls up.
          </p>
          <p class="p1-body p1-muted">
            On nights he can't make it, the line points people to Oklahoma 211 and nearby shelters, so
            no one is left with nothing.
          </p>
        </div>
      </div>
    </section>

    <!-- 4. Proof -->
    <section class="p1-proof">
      <div class="p1-wrap">
        <p class="p1-big">2.57M</p>
        <p class="p1-big-label">people watch Matt help strangers for free.</p>
        <div class="p1-proof-row">
          <div><b>1,284</b><span>people helped</span></div>
          <div><b>312</b><span>hotel nights</span></div>
          <div><b>47</b><span>cars given away</span></div>
        </div>
      </div>
    </section>

    <!-- 5. Give -->
    <section id="give" class="p1-give">
      <div class="p1-wrap">
        <p class="p1-kicker">Give</p>
        <h2 class="p1-h2">Cover the next family.</h2>
        <p class="p1-body p1-center">Pick what you pay for. When it helps someone, you get a text.</p>
        <div class="p1-gifts">
          <button class="p1-gift" @click="mock('Give a battery')"><b>$150</b><span>A battery</span></button>
          <button class="p1-gift" @click="mock('Give a hotel night')"><b>$89</b><span>A hotel night</span></button>
          <button class="p1-gift" @click="mock('Give a tank of gas')"><b>$60</b><span>A tank of gas</span></button>
          <button class="p1-gift" @click="mock('Give a tire')"><b>$120</b><span>A tire</span></button>
        </div>
        <p class="p1-alt">
          Have a car to give? <button class="p1-textbtn" @click="mock('Donate a car')">Donate a car</button>
          · A mechanic or driver in Tulsa? <button class="p1-textbtn" @click="mock('Volunteer')">Volunteer</button>
        </p>
      </div>
    </section>

    <!-- 6. Paid repairs -->
    <section id="repairs" class="p1-repairs">
      <div class="p1-wrap p1-repairs-in">
        <div>
          <p class="p1-kicker">Repairs</p>
          <h2 class="p1-h2">Any vehicle. We come to you.</h2>
          <p class="p1-body">
            Licensed and certified, with upfront prices. Every paid repair helps pay for a free one.
          </p>
          <button class="p1-btn p1-btn-gold" @click="mock('Book a repair')">Book a repair</button>
        </div>
        <p class="p1-hours">Mon–Sat<br /><b>8 AM–6 PM</b><br /><small>The help line answers 24/7.</small></p>
      </div>
    </section>

    <footer class="p1-foot">
      <div class="p1-wrap p1-foot-in">
        <span class="p1-lockup p1-lockup-foot"><img src="/mattparker/logo.png" alt="Parker's Mobile Mechanics" class="p1-logo-img" /></span>
        <span>Tulsa, Oklahoma · Matthewparker4415@gmail.com</span>
        <span>
          <a href="https://youtube.com/@ParkersMobile" target="_blank" rel="noopener">YouTube</a>
          <a href="https://www.tiktok.com/@mattthemechanic43" target="_blank" rel="noopener">TikTok</a>
          <a href="https://instagram.com/matthew_parker43" target="_blank" rel="noopener">Instagram</a>
          <a href="https://www.facebook.com/parkermobilemechanics" target="_blank" rel="noopener">Facebook</a>
        </span>
      </div>
    </footer>

    <transition name="p1-fade"><div v-if="notice" class="p1-toast" role="status">{{ notice }}</div></transition>
  </div>
</template>

<style scoped>
.p1 {
  --gold: #f7b32b;
  --gold-deep: #e09a12;
  --teal: #3fc1c9;
  --teal-deep: #137b83;
  --ink: #111111;
  --cream: #fff8ea;
  --gray: #6b6b6b;
  font-family: 'Inter', system-ui, sans-serif;
  color: var(--ink);
  background: #fff;
  line-height: 1.55;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}
:where(.p1) h1, :where(.p1) h2, :where(.p1) p { margin: 0; }
.p1-wrap { max-width: 1080px; margin: 0 auto; padding: 0 24px; }
.p1-ribbon { background: var(--ink); color: #cfcfcf; font-size: 12px; text-align: center; padding: 7px 16px; }
.p1-ribbon a { color: var(--gold); }

.p1-nav { position: sticky; top: 0; z-index: 20; background: rgba(247, 179, 43, .92); backdrop-filter: saturate(1.4) blur(12px); }
.p1-nav-in { height: 80px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.p1-lockup { display: flex; align-items: center; gap: 10px; text-decoration: none; color: var(--ink); }
.p1-logo-img { display: block; height: 62px; width: auto; }
.p1-lockup-foot .p1-logo-img { height: 64px; background: var(--cream); padding: 8px 12px; border-radius: 14px; }
.p1-hero-logo { position: absolute; z-index: 2; width: 220px !important; height: auto; left: -56px; top: -44px; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; aspect-ratio: auto !important; transform: rotate(-5deg) !important; filter: drop-shadow(0 12px 20px rgba(0,0,0,.3)); }
@keyframes p1-spin { to { transform: rotate(360deg); } }
.p1-logo { display: flex; flex-direction: column; line-height: .9; color: var(--ink); text-decoration: none; }
.p1-logo b { font-family: 'Anton', sans-serif; font-weight: 400; font-size: 24px; letter-spacing: 1px; }
.p1-logo i { font-family: 'Kaushan Script', cursive; font-style: normal; font-size: 14px; color: var(--teal-deep); }
.p1-logo-light b { color: #fff; }
.p1-logo-light i { color: var(--teal); }
.p1-links { display: flex; gap: 28px; }
.p1-links a { color: var(--ink); text-decoration: none; font-size: 14px; font-weight: 500; opacity: .8; }
.p1-links a:hover { opacity: 1; }
.p1-pill { background: var(--ink); color: #fff; border: 0; border-radius: 999px; padding: 9px 16px; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; }

/* Hero */
.p1-hero { background: var(--gold); position: relative; padding: 120px 0 170px; overflow: hidden; }
.p1-eyebrow { font-size: 14px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; opacity: .7; margin-bottom: 22px; }
.p1-h1 { font-family: 'Anton', sans-serif; font-weight: 400; font-size: clamp(56px, 9vw, 116px); line-height: .95; letter-spacing: .5px; max-width: 900px; }
.p1-lede { font-size: clamp(20px, 2.4vw, 26px); font-weight: 500; margin-top: 28px; max-width: 560px; }
.p1-ctas { display: flex; align-items: center; flex-wrap: wrap; gap: 24px; margin-top: 40px; }
.p1-btn { border: 0; cursor: pointer; font: inherit; font-weight: 700; font-size: 17px; border-radius: 999px; padding: 16px 28px; transition: transform .15s ease; }
.p1-btn:hover { transform: translateY(-1px); }
.p1-btn-ink { background: var(--ink); color: #fff; }
.p1-btn-gold { background: var(--gold); color: var(--ink); margin-top: 28px; }
.p1-link { color: var(--ink); font-weight: 600; font-size: 17px; text-decoration: none; border-bottom: 2px solid var(--ink); padding-bottom: 2px; }
.p1-fine { margin-top: 28px !important; font-size: 14px; opacity: .7; }
.p1-hero-in { display: grid; grid-template-columns: 1.15fr .85fr; gap: 56px; align-items: center; position: relative; z-index: 1; }
.p1-hero .p1-h1 { font-size: clamp(48px, 6.2vw, 82px); }
.p1-hero-photo { position: relative; margin: 0; }
.p1-hero-photo img { display: block; width: 100%; aspect-ratio: 4 / 5; object-fit: cover; object-position: 40% 30%; border-radius: 32px; border: 6px solid var(--ink); box-shadow: 0 40px 80px rgba(0,0,0,.25); transform: rotate(2deg); }
.p1-badge { position: absolute; left: -36px; bottom: 48px; background: var(--ink); color: #fff; border-radius: 20px; padding: 14px 18px; box-shadow: 0 16px 40px rgba(0,0,0,.3); max-width: 220px; }
.p1-badge b { display: block; font-family: 'Anton', sans-serif; font-weight: 400; font-size: 38px; line-height: 1; color: var(--gold); }
.p1-badge span { font-size: 13px; color: #ddd; }
.p1-badge-live { left: auto; right: -20px; bottom: auto; top: 28px; background: #fff; color: var(--ink); font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; max-width: none; padding: 10px 14px; border-radius: 999px; }
.p1-badge-live i { width: 9px; height: 9px; border-radius: 50%; background: #e2433a; box-shadow: 0 0 0 0 rgba(226,67,58,.6); animation: p1-pulse 1.6s infinite; }
@keyframes p1-pulse { 0% { box-shadow: 0 0 0 0 rgba(226,67,58,.55); } 100% { box-shadow: 0 0 0 10px rgba(226,67,58,0); } }

.p1-reel { background: var(--ink); padding: 28px 0; overflow: hidden; }
.p1-reel-track { display: flex; gap: 16px; width: max-content; animation: p1-scroll 60s linear infinite; padding-left: 16px; }
.p1-reel:hover .p1-reel-track { animation-play-state: paused; }
.p1-reel-item { position: relative; width: 320px; flex: none; border-radius: 18px; overflow: hidden; text-decoration: none; }
.p1-reel-item img { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; }
.p1-reel-item span { position: absolute; left: 12px; bottom: 10px; background: var(--gold); color: var(--ink); font-size: 13px; font-weight: 700; padding: 4px 10px; border-radius: 999px; }
@keyframes p1-scroll { to { transform: translateX(-50%); } }

.p1-band { position: absolute; left: -5%; right: -5%; bottom: 46px; height: 64px; transform: rotate(-3deg); }
.p1-band span { display: block; height: 12px; background: var(--ink); }
.p1-band span + span { height: 22px; background: var(--teal); margin-top: 8px; }

/* Show */
.p1-show { padding: 140px 0; }
.p1-show-in { display: grid; grid-template-columns: 1fr 380px; gap: 80px; align-items: center; }
.p1-kicker { font-size: 14px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--gold-deep); margin-bottom: 14px !important; }
.p1-h2 { font-family: 'Anton', sans-serif; font-weight: 400; font-size: clamp(40px, 5.5vw, 64px); line-height: 1; letter-spacing: .3px; margin-bottom: 22px !important; }
.p1-body { font-size: 19px; color: #2a2a2a; max-width: 520px; }
.p1-body + .p1-body { margin-top: 16px; }
.p1-muted { color: var(--gray); font-size: 17px; }
.p1-center { margin: 0 auto !important; text-align: center; }
.p1-points { list-style: none; padding: 0; margin: 32px 0 0; display: grid; gap: 14px; }
.p1-points li { font-size: 17px; padding-left: 22px; position: relative; color: #333; }
.p1-points li::before { content: ''; position: absolute; left: 0; top: 10px; width: 10px; height: 10px; border-radius: 50%; background: var(--gold); }

.p1-phone { background: var(--ink); border-radius: 44px; padding: 14px; box-shadow: 0 40px 80px rgba(0,0,0,.18), 0 0 0 1px rgba(0,0,0,.05); }
.p1-phone-bar { color: #fff; text-align: center; font-size: 13px; font-weight: 600; padding: 8px 0 12px; }
.p1-thread { background: #f6f3ec; border-radius: 32px; padding: 18px 14px; min-height: 520px; display: flex; flex-direction: column; gap: 8px; }
.p1-msg { max-width: 80%; padding: 9px 13px; border-radius: 18px; font-size: 14px; line-height: 1.35; }
.p1-me { align-self: flex-end; background: var(--teal-deep); color: #fff; border-bottom-right-radius: 5px; }
.p1-them { align-self: flex-start; background: #fff; border-bottom-left-radius: 5px; box-shadow: 0 1px 0 rgba(0,0,0,.06); }
.p1-good { background: var(--gold); }
.p1-photo { width: 168px; height: 95px; display: block; border-radius: 10px; margin-bottom: 5px; }
.p1-typing { align-self: flex-start; background: #fff; border-radius: 18px; padding: 12px 14px; display: flex; gap: 4px; }
.p1-typing i { width: 7px; height: 7px; border-radius: 50%; background: #b5b5b5; animation: p1-blink 1.2s infinite; }
.p1-typing i:nth-child(2) { animation-delay: .2s; }
.p1-typing i:nth-child(3) { animation-delay: .4s; }
@keyframes p1-blink { 0%, 80%, 100% { opacity: .3; } 40% { opacity: 1; } }
.p1-msg-enter-active { transition: opacity .45s ease, transform .45s ease; }
.p1-msg-enter-from { opacity: 0; transform: translateY(10px); }

/* Matt */
.p1-matt { background: var(--cream); padding: 140px 0; }
.p1-matt-in { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
.p1-map { position: relative; aspect-ratio: 1 / 1; border-radius: 28px; background: #ece7da; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,.08); }
.p1-road { position: absolute; background: #fff; }
.p1-road-a { left: -10%; right: -10%; top: 46%; height: 26px; transform: rotate(-12deg); }
.p1-road-b { top: -10%; bottom: -10%; left: 30%; width: 18px; transform: rotate(8deg); }
.p1-road-c { top: -10%; bottom: -10%; left: 70%; width: 14px; }
.p1-pin { position: absolute; width: 22px; height: 22px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,.2); }
.p1-pin-red { background: #e2433a; width: 30px; height: 30px; }
.p1-pin-gold { background: var(--gold); }
.p1-me-dot { position: absolute; width: 16px; height: 16px; border-radius: 50%; background: var(--teal-deep); box-shadow: 0 0 0 10px rgba(19,123,131,.18); }
.p1-card { position: absolute; left: 20px; right: 20px; bottom: 20px; background: #fff; border-radius: 16px; padding: 14px 16px; display: flex; gap: 12px; align-items: center; box-shadow: 0 10px 30px rgba(0,0,0,.12); }
.p1-card b { display: block; font-size: 15px; }
.p1-card small { color: var(--gray); font-size: 13px; }
.p1-dot { width: 12px; height: 12px; border-radius: 50%; background: #e2433a; flex: none; }

/* Proof */
.p1-proof { background: var(--ink); color: #fff; padding: 140px 0; text-align: center; }
.p1-big { font-family: 'Anton', sans-serif; font-size: clamp(90px, 16vw, 200px); line-height: 1; color: var(--gold); }
.p1-big-label { font-size: clamp(20px, 2.4vw, 26px); margin-top: 14px !important; color: #e8e8e8; }
.p1-proof-row { display: flex; justify-content: center; gap: 72px; margin-top: 72px; flex-wrap: wrap; }
.p1-proof-row b { display: block; font-family: 'Anton', sans-serif; font-weight: 400; font-size: 48px; color: #fff; }
.p1-proof-row span { color: #a9a9a9; font-size: 15px; }

/* Give */
.p1-give { padding: 140px 0; text-align: center; }
.p1-give .p1-h2 { margin-left: auto; margin-right: auto; }
.p1-gifts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 48px; }
.p1-gift { background: var(--gold); border: 0; border-radius: 24px; padding: 34px 16px; cursor: pointer; font: inherit; color: var(--ink); transition: transform .15s ease, background .15s ease; }
.p1-gift:hover { transform: translateY(-3px); background: #ffc148; }
.p1-gift b { display: block; font-family: 'Anton', sans-serif; font-weight: 400; font-size: 46px; line-height: 1; }
.p1-gift span { display: block; margin-top: 8px; font-weight: 600; }
.p1-alt { margin-top: 36px !important; color: var(--gray); font-size: 16px; }
.p1-textbtn { background: none; border: 0; padding: 0; font: inherit; font-weight: 700; color: var(--teal-deep); cursor: pointer; text-decoration: underline; }

/* Repairs */
.p1-repairs { background: var(--cream); padding: 120px 0; }
.p1-repairs-in { display: flex; justify-content: space-between; align-items: center; gap: 40px; }
.p1-hours { font-size: 22px; text-align: right; color: #333; }
.p1-hours b { font-family: 'Anton', sans-serif; font-weight: 400; font-size: 44px; color: var(--ink); }
.p1-hours small { color: var(--gray); font-size: 15px; }

.p1-foot { background: var(--ink); color: #bdbdbd; padding: 40px 0; font-size: 14px; }
.p1-foot-in { display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; }
.p1-foot a { color: #fff; text-decoration: none; margin-left: 16px; }

.p1-toast { position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); background: var(--ink); color: #fff; padding: 12px 18px; border-radius: 999px; font-size: 14px; z-index: 50; max-width: calc(100% - 32px); text-align: center; }
.p1-fade-enter-active, .p1-fade-leave-active { transition: opacity .2s; }
.p1-fade-enter-from, .p1-fade-leave-to { opacity: 0; }

@media (max-width: 900px) {
  .p1-links { display: none; }
  .p1-hero { padding: 64px 0 130px; }
  .p1-hero-in { grid-template-columns: 1fr; gap: 48px; }
  .p1-hero-photo { max-width: 420px; width: 100%; margin: 0 auto; }
  .p1-badge { left: -8px; }
  .p1-hero-logo { width: 160px !important; left: -10px; top: -40px; }
  .p1-logo-img { height: 40px; }
  .p1-badge-live { left: auto; right: -6px; top: 22px; }
  .p1-reel-item { width: 240px; }
  .p1-show, .p1-matt, .p1-proof, .p1-give { padding: 88px 0; }
  .p1-show-in, .p1-matt-in { grid-template-columns: 1fr; gap: 48px; }
  .p1-phone { max-width: 360px; margin: 0 auto; width: 100%; }
  .p1-gifts { grid-template-columns: 1fr 1fr; }
  .p1-repairs-in { flex-direction: column; align-items: flex-start; }
  .p1-hours { text-align: left; }
  .p1-proof-row { gap: 40px; }
}
@media (max-width: 480px) {
  .p1-wrap { padding: 0 16px; }
  .p1-foot a { margin: 0 14px 0 0; }
}
@media (prefers-reduced-motion: reduce) {
  .p1-msg-enter-active { transition: none; }
  .p1-typing i { animation: none; }
  .p1-reel-track { animation: none; }
  .p1-badge-live i { animation: none; }
}
</style>
