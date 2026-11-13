<script setup lang="ts">
// Private website mockup for Matthew Parker, version 2: bold, truck-wrap look, built
// around his audience. Gold leads; teal and black come from the wrap. Not indexed.
import { ref, onMounted } from 'vue'

const notice = ref('')
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
  document.title = "Parker's Mobile Mechanics: website mockup 2"
  const href = 'https://fonts.googleapis.com/css2?family=Anton&family=Kaushan+Script&family=Inter:wght@400;500;600;700;800&display=swap'
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
  }
  window.scrollTo(0, 0)
})

const feed = [
  { when: '11:42 PM', what: 'Mom and 2 kids, dead battery on I-44. Back on the road.', paid: 'Battery paid by Dana in Ohio' },
  { when: '9:15 PM', what: 'Flat tire on Hwy 75 in the rain. Fixed in 25 minutes.', paid: 'Tire paid by the crew' },
  { when: '6:03 PM', what: 'Alternator out in Broken Arrow. Hotel night while the part comes in.', paid: 'Hotel night paid by Luis in Texas' },
  { when: '2:30 PM', what: 'Out of gas with a newborn on 11th St. Tank filled.', paid: 'Gas paid by Kim in Tulsa' },
]

const tiers = [
  { amt: '$5', per: '/mo', title: 'Crew', body: 'Covers a tank of gas every year. Your name on the crew wall.' },
  { amt: '$25', per: '/mo', title: 'Road crew', body: 'Covers a battery every six months. A text each time you help.', featured: true },
  { amt: '$89', per: ' once', title: 'One night', body: 'One hotel night for a family stuck overnight.' },
]
</script>

<template>
  <div class="p2">
    <div class="p2-ribbon">
      Website mockup for Matthew Parker by <a href="https://criton.ai">Criton.AI</a>. Not live. Stories, names and numbers are examples.
    </div>

    <!-- Hero: the truck -->
    <section class="p2-hero">
      <div class="p2-wrap-stripes" aria-hidden="true">
        <span class="s1"></span><span class="s2"></span><span class="s3"></span>
      </div>
      <div class="p2-wrap p2-hero-in">
        <div class="p2-plate">
          <span class="p2-brand">PARKER'S</span>
          <span class="p2-script">Mobile Mechanics</span>
        </div>
        <h1 class="p2-h1">Nobody gets left on the side of the road.</h1>
        <p class="p2-lede">Free help for families stranded in Tulsa. Paid for by 2.57 million people who watch it happen.</p>

        <div class="p2-choose">
          <button class="p2-door p2-door-ink" @click="mock('Text the help line')">
            <small>I'm stranded</small>
            <b>Text (918) HELP-NOW</b>
            <span>Answers every time, day or night →</span>
          </button>
          <a href="#crew" class="p2-door p2-door-teal">
            <small>I want to help</small>
            <b>Join the crew</b>
            <span>Pay for the next rescue →</span>
          </a>
        </div>
        <p class="p2-911">In danger or in a live lane? Call 911 first.</p>
      </div>
    </section>

    <!-- Stranded -->
    <section class="p2-stranded">
      <div class="p2-wrap">
        <h2 class="p2-h2 p2-light">Stranded? <span>Here's what happens.</span></h2>
        <div class="p2-steps">
          <div class="p2-step">
            <i>01</i>
            <h3>Text or call</h3>
            <p>The help line picks up every time, in English or Spanish. No voicemail.</p>
          </div>
          <div class="p2-step">
            <i>02</i>
            <h3>Tap to share where you are</h3>
            <p>One tap sends your exact spot, even on a dark shoulder.</p>
          </div>
          <div class="p2-step p2-step-photo">
            <i>03</i>
            <h3>Send a photo</h3>
            <p>Snap the car and the dash. Matt sees it before he leaves and brings the right part.</p>
            <div class="p2-snap" aria-hidden="true">
              <svg viewBox="0 0 160 90"><rect width="160" height="90" rx="8" fill="#1d2629" /><rect y="60" width="160" height="30" fill="#2b3539" /><path d="M32 58 L47 39 H104 L124 58 Z" fill="#c7cfd2" /><rect x="24" y="56" width="112" height="16" rx="5" fill="#e3e8ea" /><circle cx="50" cy="74" r="8" fill="#0b0b0b" /><circle cx="110" cy="74" r="8" fill="#0b0b0b" /><rect x="26" y="60" width="10" height="5" rx="2" fill="#F7B32B" /><rect x="124" y="60" width="10" height="5" rx="2" fill="#F7B32B" /></svg>
              <span>📷 Photo sent</span>
            </div>
          </div>
          <div class="p2-step">
            <i>04</i>
            <h3>Matt's on the way</h3>
            <p>You get a text when he's coming, and updates until he pulls up. If you can't pay, you don't pay.</p>
          </div>
        </div>
        <p class="p2-211">Can't get to you tonight? The line connects you with Oklahoma 211 and nearby shelters.</p>
      </div>
    </section>

    <!-- Feed -->
    <section class="p2-feed">
      <div class="p2-wrap p2-feed-in">
        <div>
          <p class="p2-kicker">Today on the help line</p>
          <h2 class="p2-h2">Every rescue, and who paid for it.</h2>
          <p class="p2-body">When your gift fixes someone's car, it shows up here, and you get a text.</p>
        </div>
        <ul class="p2-list">
          <li v-for="f in feed" :key="f.when">
            <time>{{ f.when }}</time>
            <div><b>{{ f.what }}</b><span>{{ f.paid }}</span></div>
          </li>
        </ul>
      </div>
    </section>

    <!-- Crew -->
    <section id="crew" class="p2-crew">
      <div class="p2-wrap">
        <p class="p2-kicker p2-kicker-ink">Join the crew</p>
        <h2 class="p2-h2">2.57M people watch. Be one who helps.</h2>
        <div class="p2-tiers">
          <div v-for="t in tiers" :key="t.title" :class="['p2-tier', { 'p2-tier-hot': t.featured }]">
            <p class="p2-tier-title">{{ t.title }}</p>
            <p class="p2-tier-amt">{{ t.amt }}<small>{{ t.per }}</small></p>
            <p class="p2-tier-body">{{ t.body }}</p>
            <button class="p2-btn" @click="mock(`Join ${t.title}`)">Join</button>
          </div>
        </div>
        <div class="p2-extras">
          <button class="p2-extra" @click="mock('Donate a car')"><b>Donate a car</b><span>Text a photo. Matt fixes it and hands over the keys.</span></button>
          <button class="p2-extra" @click="mock('Volunteer')"><b>Volunteer</b><span>Mechanics and drivers in Tulsa get sent to nearby calls.</span></button>
        </div>
      </div>
    </section>

    <!-- Repairs -->
    <section class="p2-repairs">
      <div class="p2-wrap p2-repairs-in">
        <div>
          <p class="p2-kicker">Need a repair?</p>
          <h2 class="p2-h2 p2-light">Any vehicle. Any repair. We come to you.</h2>
          <p class="p2-body p2-light-body">Licensed and certified, upfront prices, Mon–Sat 8 AM–6 PM. Every paid job helps pay for a free one.</p>
        </div>
        <button class="p2-btn p2-btn-gold" @click="mock('Book a repair')">Book a repair</button>
      </div>
    </section>

    <footer class="p2-foot">
      <div class="p2-wrap p2-foot-in">
        <div class="p2-plate p2-plate-sm"><span class="p2-brand">PARKER'S</span><span class="p2-script">Mobile Mechanics</span></div>
        <nav>
          <a href="https://youtube.com/@ParkersMobile" target="_blank" rel="noopener">YouTube</a>
          <a href="https://www.tiktok.com/@mattthemechanic43" target="_blank" rel="noopener">TikTok</a>
          <a href="https://instagram.com/matthew_parker43" target="_blank" rel="noopener">Instagram</a>
          <a href="https://www.facebook.com/parkermobilemechanics" target="_blank" rel="noopener">Facebook</a>
        </nav>
        <p>Tulsa, Oklahoma · Matthewparker4415@gmail.com</p>
      </div>
    </footer>

    <transition name="p2-fade"><div v-if="notice" class="p2-toast" role="status">{{ notice }}</div></transition>
  </div>
</template>

<style scoped>
.p2 {
  --gold: #f7b32b;
  --gold-hi: #ffc54d;
  --teal: #3fc1c9;
  --teal-deep: #137b83;
  --ink: #111111;
  --cream: #fff4dc;
  font-family: 'Inter', system-ui, sans-serif;
  color: var(--ink);
  background: var(--gold);
  line-height: 1.5;
  overflow-x: hidden;
}
:where(.p2) h1, :where(.p2) h2, :where(.p2) h3, :where(.p2) p { margin: 0; }
.p2-wrap { max-width: 1120px; margin: 0 auto; padding: 0 24px; position: relative; }
.p2-ribbon { background: var(--ink); color: #cfcfcf; font-size: 12px; text-align: center; padding: 7px 16px; }
.p2-ribbon a { color: var(--gold); }

/* Hero */
.p2-hero { position: relative; background: var(--gold); padding: 80px 0 96px; overflow: hidden; }
.p2-wrap-stripes { position: absolute; top: -20%; bottom: -20%; right: -12%; width: 38%; transform: skewX(-18deg); display: flex; gap: 14px; }
.p2-wrap-stripes span { display: block; height: 100%; }
.p2-wrap-stripes .s1 { width: 18px; background: var(--ink); }
.p2-wrap-stripes .s2 { flex: 1; background: var(--teal); }
.p2-wrap-stripes .s3 { width: 18px; background: var(--ink); }
.p2-hero-in { max-width: 1120px; }
.p2-plate { display: inline-flex; flex-direction: column; background: var(--teal); border: 5px solid var(--ink); border-radius: 18px; padding: 10px 26px 12px; transform: rotate(-3deg); box-shadow: 8px 8px 0 var(--ink); }
.p2-brand { font-family: 'Anton', sans-serif; font-size: clamp(48px, 7vw, 84px); line-height: .9; letter-spacing: 2px; color: var(--ink); }
.p2-script { font-family: 'Kaushan Script', cursive; font-size: clamp(24px, 3vw, 36px); color: var(--gold); -webkit-text-stroke: 1.5px var(--ink); line-height: 1; margin-top: -2px; }
.p2-plate-sm { transform: none; box-shadow: none; padding: 6px 16px 8px; border-width: 3px; }
.p2-plate-sm .p2-brand { font-size: 30px; }
.p2-plate-sm .p2-script { font-size: 17px; -webkit-text-stroke: .8px var(--ink); }
.p2-h1 { font-family: 'Anton', sans-serif; font-weight: 400; font-size: clamp(46px, 7vw, 92px); line-height: .98; max-width: 640px; margin-top: 44px !important; }
.p2-lede { font-size: clamp(18px, 2.2vw, 23px); font-weight: 600; max-width: 600px; margin-top: 22px !important; }
.p2-choose { display: grid; grid-template-columns: repeat(2, minmax(0, 340px)); gap: 18px; margin-top: 40px; }
.p2-door { text-align: left; border: 4px solid var(--ink); border-radius: 20px; padding: 22px 24px; cursor: pointer; font: inherit; text-decoration: none; display: flex; flex-direction: column; gap: 4px; box-shadow: 6px 6px 0 var(--ink); transition: transform .12s, box-shadow .12s; }
.p2-door:hover { transform: translate(-2px, -2px); box-shadow: 8px 8px 0 var(--ink); }
.p2-door small { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: .1em; opacity: .75; }
.p2-door b { font-family: 'Anton', sans-serif; font-weight: 400; font-size: 32px; line-height: 1.05; }
.p2-door span { font-weight: 600; font-size: 15px; }
.p2-door-ink { background: var(--ink); color: #fff; }
.p2-door-ink b { color: var(--gold); }
.p2-door-teal { background: #fff; color: var(--ink); }
.p2-911 { margin-top: 24px !important; font-weight: 600; font-size: 14px; }

/* Stranded */
.p2-stranded { background: var(--ink); padding: 110px 0; border-top: 10px solid var(--teal); }
.p2-h2 { font-family: 'Anton', sans-serif; font-weight: 400; font-size: clamp(38px, 5.2vw, 62px); line-height: 1.02; }
.p2-h2 span { color: var(--gold); }
.p2-light { color: #fff; }
.p2-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-top: 52px; }
.p2-step { background: #1c1c1c; border-radius: 20px; padding: 26px; color: #ddd; border: 1px solid #2c2c2c; }
.p2-step i { font-style: normal; font-family: 'Anton', sans-serif; font-size: 40px; color: var(--gold); line-height: 1; }
.p2-step h3 { color: #fff; font-size: 20px; margin: 14px 0 8px; font-weight: 800; }
.p2-step p { font-size: 15px; }
.p2-step-photo { background: var(--teal-deep); border-color: var(--teal); }
.p2-step-photo p { color: #e6f6f7; }
.p2-snap { margin-top: 16px; background: rgba(0,0,0,.25); border-radius: 12px; padding: 8px; }
.p2-snap svg { width: 100%; height: auto; display: block; border-radius: 8px; }
.p2-snap span { display: block; font-size: 12px; color: #fff; margin-top: 6px; }
.p2-211 { color: #a8a8a8; margin-top: 36px !important; font-size: 15px; }

/* Feed */
.p2-feed { background: var(--cream); padding: 110px 0; }
.p2-feed-in { display: grid; grid-template-columns: .9fr 1.1fr; gap: 60px; align-items: start; }
.p2-kicker { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: .12em; color: var(--teal-deep); margin-bottom: 12px !important; }
.p2-kicker-ink { color: var(--ink); opacity: .7; }
.p2-body { font-size: 18px; margin-top: 18px !important; max-width: 460px; }
.p2-light-body { color: #cfcfcf; }
.p2-list { list-style: none; margin: 0; padding: 0; border-top: 3px solid var(--ink); }
.p2-list li { display: grid; grid-template-columns: 92px 1fr; gap: 16px; padding: 20px 0; border-bottom: 1px solid #e3d6b8; }
.p2-list time { font-family: 'Anton', sans-serif; font-size: 20px; color: var(--teal-deep); }
.p2-list b { display: block; font-size: 17px; }
.p2-list span { display: inline-block; margin-top: 6px; background: var(--gold); padding: 2px 10px; border-radius: 999px; font-size: 13px; font-weight: 700; }

/* Crew */
.p2-crew { background: var(--gold); padding: 110px 0; }
.p2-tiers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 48px; }
.p2-tier { background: #fff; border: 4px solid var(--ink); border-radius: 22px; padding: 28px; display: flex; flex-direction: column; box-shadow: 6px 6px 0 var(--ink); }
.p2-tier-hot { background: var(--ink); color: #fff; }
.p2-tier-title { font-weight: 800; text-transform: uppercase; letter-spacing: .1em; font-size: 13px; }
.p2-tier-hot .p2-tier-title { color: var(--gold); }
.p2-tier-amt { font-family: 'Anton', sans-serif; font-size: 64px; line-height: 1.05; margin-top: 8px !important; }
.p2-tier-amt small { font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 600; opacity: .7; }
.p2-tier-body { font-size: 15px; margin: 10px 0 22px !important; }
.p2-tier .p2-btn { margin-top: auto; }
.p2-btn { border: 3px solid var(--ink); border-radius: 999px; background: var(--teal); color: var(--ink); font: inherit; font-weight: 800; font-size: 16px; padding: 12px 24px; cursor: pointer; }
.p2-btn:hover { background: #5fd0d6; }
.p2-btn-gold { background: var(--gold); padding: 16px 30px; font-size: 18px; flex: none; }
.p2-btn-gold:hover { background: var(--gold-hi); }
.p2-extras { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
.p2-extra { text-align: left; background: transparent; border: 3px dashed var(--ink); border-radius: 18px; padding: 20px 24px; font: inherit; color: var(--ink); cursor: pointer; }
.p2-extra:hover { background: rgba(255,255,255,.3); }
.p2-extra b { display: block; font-family: 'Anton', sans-serif; font-weight: 400; font-size: 26px; }

/* Repairs */
.p2-repairs { background: var(--ink); padding: 96px 0; border-bottom: 10px solid var(--teal); }
.p2-repairs-in { display: flex; align-items: center; justify-content: space-between; gap: 40px; }

.p2-foot { background: var(--ink); color: #aaa; padding: 40px 0; font-size: 14px; }
.p2-foot-in { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
.p2-foot nav a { color: #fff; text-decoration: none; margin-right: 18px; font-weight: 600; }

.p2-toast { position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); background: var(--ink); color: #fff; padding: 12px 18px; border-radius: 12px; border: 3px solid var(--gold); font-size: 14px; z-index: 50; max-width: calc(100% - 32px); text-align: center; }
.p2-fade-enter-active, .p2-fade-leave-active { transition: opacity .2s; }
.p2-fade-enter-from, .p2-fade-leave-to { opacity: 0; }

@media (max-width: 900px) {
  .p2-wrap-stripes { width: 60%; right: -30%; opacity: .5; }
  .p2-choose { grid-template-columns: 1fr; }
  .p2-steps { grid-template-columns: 1fr 1fr; }
  .p2-feed-in { grid-template-columns: 1fr; gap: 36px; }
  .p2-tiers, .p2-extras { grid-template-columns: 1fr; }
  .p2-repairs-in { flex-direction: column; align-items: flex-start; }
  .p2-stranded, .p2-feed, .p2-crew { padding: 80px 0; }
}
@media (max-width: 520px) {
  .p2-wrap { padding: 0 16px; }
  .p2-steps { grid-template-columns: 1fr; }
  .p2-list li { grid-template-columns: 1fr; gap: 4px; }
  .p2-hero { padding: 56px 0 72px; }
}
</style>
