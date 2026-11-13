<script setup lang="ts">
// Private website mockup for Matthew Parker (Parker's Mobile Mechanics, Tulsa). Not indexed.
// Colors come from his truck wrap: teal, orange, black and cream.
import { ref, onMounted } from 'vue'

onMounted(() => {
  const existing = document.querySelector('meta[name="robots"]')
  if (existing) existing.setAttribute('content', 'noindex, nofollow')
  else {
    const m = document.createElement('meta')
    m.name = 'robots'
    m.content = 'noindex, nofollow'
    document.head.appendChild(m)
  }
  document.title = "Parker's Mobile Mechanics: website mockup"
  const href = 'https://fonts.googleapis.com/css2?family=Anton&family=Kaushan+Script&family=Inter:wght@400;500;600;700;800&display=swap'
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
  }
  window.scrollTo(0, 0)
})

const notice = ref('')
const mock = (what: string) => {
  notice.value = `Mockup: "${what}" will work once the help line is built.`
  window.setTimeout(() => (notice.value = ''), 3500)
}

const steps = [
  { n: '1', title: 'Call or text the help line', body: 'Someone answers every time, day or night, in English or Spanish. No voicemail.' },
  { n: '2', title: 'Share where you are', body: 'One tap sends your exact location, even on the shoulder of I-44 at midnight.' },
  { n: '3', title: 'Send a photo of the car', body: "Snap the car, the dashboard light or what's leaking. Matt sees it before he leaves, so he brings the right part." },
  { n: '4', title: "Matt's on the way", body: 'You get a text when he is coming, and updates until he pulls up.' },
]

const gifts = [
  { icon: 'hotel', title: 'A hotel night', amount: '$89', body: 'Keeps a family with kids out of a cold car tonight.' },
  { icon: 'battery', title: 'A new battery', amount: '$150', body: 'The most common fix on the side of the road.' },
  { icon: 'gas', title: 'A tank of gas', amount: '$60', body: 'Gets someone home, or to work in the morning.' },
  { icon: 'tire', title: 'A tire', amount: '$120', body: 'A blowout should not cost someone their job.' },
]

const stats = [
  { value: '1,284', label: 'People helped' },
  { value: '312', label: 'Hotel nights given' },
  { value: '47', label: 'Cars given away' },
  { value: '2.57M', label: 'People following along' },
]

const services = ['Batteries and jump starts', 'Brakes', 'Tires and flats', 'Starters and alternators',
  'Engine diagnostics', 'Belts and hoses', 'Cooling systems', 'Pre-purchase inspections']

const social = [
  { name: 'YouTube', href: 'https://youtube.com/@ParkersMobile' },
  { name: 'TikTok', href: 'https://www.tiktok.com/@mattthemechanic43' },
  { name: 'Instagram', href: 'https://instagram.com/matthew_parker43' },
  { name: 'Facebook', href: 'https://www.facebook.com/parkermobilemechanics' },
]
</script>

<template>
  <div class="pm">
    <div class="pm-ribbon">
      Website mockup prepared for Matthew Parker by
      <a href="https://criton.ai">Criton.AI</a>. Not live. Numbers and prices are examples.
    </div>

    <!-- Nav -->
    <header class="pm-nav">
      <div class="pm-wrap pm-nav-in">
        <a href="#top" class="pm-logo">
          <span class="pm-logo-big">PARKER'S</span>
          <span class="pm-logo-script">Mobile Mechanics</span>
        </a>
        <nav class="pm-links">
          <a href="#help">Get help</a>
          <a href="#give">Give</a>
          <a href="#videos">Videos</a>
          <a href="#repairs">Repairs</a>
        </nav>
        <a href="#help" class="pm-btn pm-btn-orange pm-btn-sm">Stranded? Get help</a>
      </div>
    </header>

    <!-- Hero -->
    <section id="top" class="pm-hero">
      <div class="pm-stripes" aria-hidden="true"></div>
      <div class="pm-wrap pm-hero-in">
        <div class="pm-hero-copy">
          <p class="pm-eyebrow">Tulsa and surrounding areas · free for families in need</p>
          <h1 class="pm-h1">STRANDED?<br /><span>Help is one text away.</span></h1>
          <p class="pm-lede">
            Call or text the Parker's Help Line. We answer every time, find out where you are and
            what's wrong, and get Matt on the way. If you can't pay, you don't pay.
          </p>
          <div class="pm-ctas">
            <button class="pm-btn pm-btn-orange pm-btn-lg" @click="mock('Text the help line')">
              Text or call (918) HELP-NOW
            </button>
            <a href="#give" class="pm-btn pm-btn-ghost pm-btn-lg">Help someone else</a>
          </div>
          <p class="pm-safety">
            <strong>In danger, hurt or stopped in a live lane?</strong> Call 911 first.
          </p>
        </div>

        <!-- Phone -->
        <div class="pm-phone" aria-label="Example text conversation with the help line">
          <div class="pm-phone-top">Parker's Help Line</div>
          <div class="pm-chat">
            <div class="pm-msg pm-me">Car died on I-44 near Yale. My 2 kids are with me</div>
            <div class="pm-msg pm-them">You're not alone. Are you off the road and somewhere safe?</div>
            <div class="pm-msg pm-me">Yes, on the shoulder with hazards on</div>
            <div class="pm-msg pm-them">Good. Tap to share where you are: <u>parkers.help/7KQ</u></div>
            <div class="pm-msg pm-me pm-loc">📍 Location shared</div>
            <div class="pm-msg pm-them">Can you send a photo of the car and the dashboard?</div>
            <div class="pm-msg pm-me pm-photo">
              <svg viewBox="0 0 160 90" role="img" aria-label="Photo of a car on the shoulder">
                <rect width="160" height="90" rx="6" fill="#2b3a40" />
                <rect y="62" width="160" height="28" fill="#3d4b50" />
                <path d="M30 60 L45 40 H105 L125 60 Z" fill="#c9d3d6" />
                <rect x="22" y="58" width="116" height="16" rx="5" fill="#dfe6e8" />
                <circle cx="48" cy="76" r="8" fill="#141414" /><circle cx="112" cy="76" r="8" fill="#141414" />
                <rect x="126" y="62" width="10" height="5" rx="2" fill="#F4A23B" />
                <rect x="24" y="62" width="10" height="5" rx="2" fill="#F4A23B" />
              </svg>
              <span>Photo · dashboard battery light</span>
            </div>
            <div class="pm-msg pm-them pm-good">
              Looks like the battery. Matt has one on the truck and is on the way. About 20 minutes.
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section id="help" class="pm-section pm-cream">
      <div class="pm-wrap">
        <p class="pm-kicker">How the help line works</p>
        <h2 class="pm-h2">From stuck to safe, in four steps</h2>
        <div class="pm-steps">
          <div v-for="s in steps" :key="s.n" class="pm-step">
            <span class="pm-step-n">{{ s.n }}</span>
            <h3>{{ s.title }}</h3>
            <p>{{ s.body }}</p>
          </div>
        </div>
        <div class="pm-nights">
          <strong>Can't make it tonight?</strong> The help line still answers. It points you to
          Oklahoma 211 and nearby shelters so no one is left with nothing, and Matt picks it up in
          the morning.
        </div>
      </div>
    </section>

    <!-- Impact -->
    <section class="pm-impact">
      <div class="pm-wrap">
        <div class="pm-stats">
          <div v-for="s in stats" :key="s.label" class="pm-stat">
            <p class="pm-stat-v">{{ s.value }}</p>
            <p class="pm-stat-l">{{ s.label }}</p>
          </div>
        </div>
        <p class="pm-impact-note">Updated live from the help line every time someone gets home.</p>
      </div>
    </section>

    <!-- Give -->
    <section id="give" class="pm-section">
      <div class="pm-wrap">
        <p class="pm-kicker">Give</p>
        <h2 class="pm-h2">Pay for the next rescue</h2>
        <p class="pm-sub">
          Pick what you want to cover. When your gift helps someone, you get a text saying so.
        </p>
        <div class="pm-gifts">
          <div v-for="g in gifts" :key="g.title" class="pm-gift">
            <div class="pm-gift-icon" aria-hidden="true">
              <svg v-if="g.icon === 'hotel'" viewBox="0 0 24 24"><path d="M3 20V6h2v8h6V8h7a3 3 0 0 1 3 3v9h-2v-3H5v3z" /></svg>
              <svg v-else-if="g.icon === 'battery'" viewBox="0 0 24 24"><path d="M4 7h3V5h3v2h4V5h3v2h3v13H4zm3 6v2h4v-2zm7 0v2h1.5v1.5h2V15H19v-2h-1.5v-1.5h-2V13z" /></svg>
              <svg v-else-if="g.icon === 'gas'" viewBox="0 0 24 24"><path d="M5 3h9v8h1a2 2 0 0 1 2 2v4a1 1 0 0 0 2 0V9l-3-3 1.4-1.4L21 8.2V17a3 3 0 0 1-6 0v-4h-1v8H5zm2 2v4h5V5z" /></svg>
              <svg v-else viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" /></svg>
            </div>
            <h3>{{ g.title }}</h3>
            <p class="pm-gift-amt">{{ g.amount }}</p>
            <p>{{ g.body }}</p>
            <button class="pm-btn pm-btn-teal" @click="mock(`Give ${g.title.toLowerCase()}`)">Give {{ g.amount }}</button>
          </div>
        </div>
        <div class="pm-more">
          <div class="pm-more-card">
            <h3>Donate a car</h3>
            <p>Text a photo of the car to the help line. Matt fixes it up and hands the keys to a family who needs one. You can follow it from pickup to keys.</p>
            <button class="pm-btn pm-btn-orange" @click="mock('Donate a car')">Donate a car</button>
          </div>
          <div class="pm-more-card">
            <h3>Volunteer</h3>
            <p>Mechanics and drivers in the Tulsa area can sign up. When someone is stranded near you, the help line can send you instead, so more people get help faster.</p>
            <button class="pm-btn pm-btn-orange" @click="mock('Volunteer sign-up')">Sign up to help</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Videos -->
    <section id="videos" class="pm-section pm-dark">
      <div class="pm-wrap">
        <p class="pm-kicker pm-kicker-orange">Watch the work</p>
        <h2 class="pm-h2 pm-h2-light">2.57 million people follow along</h2>
        <div class="pm-videos">
          <a v-for="i in 3" :key="i" class="pm-video" href="https://youtube.com/@ParkersMobile" target="_blank" rel="noopener">
            <span class="pm-play" aria-hidden="true">▶</span>
            <span class="pm-video-label">Latest video {{ i }} plays here</span>
          </a>
        </div>
        <div class="pm-social">
          <a v-for="s in social" :key="s.name" :href="s.href" target="_blank" rel="noopener" class="pm-chip">{{ s.name }}</a>
        </div>
      </div>
    </section>

    <!-- Repairs -->
    <section id="repairs" class="pm-section pm-cream">
      <div class="pm-wrap pm-repairs">
        <div>
          <p class="pm-kicker">Not stranded? Book a repair</p>
          <h2 class="pm-h2">Any vehicle, any repair. We come to you.</h2>
          <p class="pm-sub">
            Fully licensed and certified, with fair and upfront prices. Every paid repair helps pay
            for the free ones.
          </p>
          <p class="pm-hours"><strong>Repairs:</strong> Mon to Sat, 8 AM to 6 PM<br /><strong>Help line:</strong> answers 24/7</p>
          <button class="pm-btn pm-btn-teal pm-btn-lg" @click="mock('Book a repair')">Book a repair</button>
        </div>
        <ul class="pm-services">
          <li v-for="s in services" :key="s">{{ s }}</li>
        </ul>
      </div>
    </section>

    <!-- Footer -->
    <footer class="pm-foot">
      <div class="pm-wrap pm-foot-in">
        <div>
          <p class="pm-logo"><span class="pm-logo-big">PARKER'S</span><span class="pm-logo-script">Mobile Mechanics</span></p>
          <p>Tulsa, Oklahoma</p>
        </div>
        <div>
          <p>Help line: (918) HELP-NOW</p>
          <p>Matthewparker4415@gmail.com</p>
        </div>
        <div>
          <p>In danger? Call 911.</p>
          <p>Need shelter tonight? Dial 211.</p>
        </div>
      </div>
      <p class="pm-credit">Mockup by <a href="https://criton.ai">Criton.AI</a></p>
    </footer>

    <transition name="pm-fade">
      <div v-if="notice" class="pm-toast" role="status">{{ notice }}</div>
    </transition>
  </div>
</template>

<style scoped>
.pm {
  --teal: #45b8be;
  --teal-dark: #1f7f86;
  --orange: #f4a23b;
  --orange-dark: #d9821a;
  --ink: #141414;
  --cream: #fff6e6;
  --line: #e7dcc6;
  font-family: 'Inter', system-ui, sans-serif;
  color: var(--ink);
  background: #fff;
  line-height: 1.55;
}
.pm { overflow-x: hidden; }
.pm h3 { font-weight: 800; }
.pm-wrap { max-width: 1120px; margin: 0 auto; padding: 0 20px; }
.pm-ribbon { background: var(--ink); color: #fff; font-size: 13px; text-align: center; padding: 8px 16px; }
.pm-ribbon a { color: var(--orange); font-weight: 600; }

/* Nav */
.pm-nav { background: #fff; border-bottom: 4px solid var(--orange); position: sticky; top: 0; z-index: 20; }
.pm-nav-in { display: flex; align-items: center; justify-content: space-between; gap: 16px; height: 72px; }
.pm-logo { display: flex; flex-direction: column; line-height: 0.9; text-decoration: none; color: var(--ink); margin: 0; }
.pm-logo-big { font-family: 'Anton', sans-serif; font-size: 30px; letter-spacing: 1px; color: var(--ink); }
.pm-logo-script { font-family: 'Kaushan Script', cursive; font-size: 17px; color: var(--teal-dark); margin-top: 2px; }
.pm-links { display: flex; gap: 26px; }
.pm-links a { color: var(--ink); text-decoration: none; font-weight: 600; font-size: 15px; }
.pm-links a:hover { color: var(--teal-dark); }

/* Buttons */
.pm-btn { display: inline-block; border: 0; cursor: pointer; font: inherit; font-weight: 700; border-radius: 10px; padding: 12px 20px; text-decoration: none; transition: transform .1s, background .15s; }
.pm-btn:active { transform: translateY(1px); }
.pm-btn-sm { padding: 9px 14px; font-size: 14px; }
.pm-btn-lg { padding: 16px 24px; font-size: 17px; }
.pm-btn-orange { background: var(--orange); color: var(--ink); box-shadow: 0 3px 0 var(--orange-dark); }
.pm-btn-orange:hover { background: #ffb24f; }
.pm-btn-teal { background: var(--teal-dark); color: #fff; box-shadow: 0 3px 0 #155e63; }
.pm-btn-teal:hover { background: #24909a; }
.pm-btn-ghost { background: transparent; color: #fff; border: 2px solid #fff; }
.pm-btn-ghost:hover { background: rgba(255,255,255,.12); }

/* Hero */
.pm-hero { position: relative; background: var(--teal); overflow: hidden; color: var(--ink); }
.pm-stripes { position: absolute; inset: 0; background:
  linear-gradient(115deg, transparent 58%, var(--ink) 58%, var(--ink) 61%, var(--orange) 61%, var(--orange) 72%, var(--ink) 72%, var(--ink) 75%, transparent 75%); opacity: .95; }
.pm-hero-in { position: relative; display: grid; grid-template-columns: 1.2fr .8fr; gap: 40px; align-items: center; padding: 64px 20px 72px; }
.pm-eyebrow { font-weight: 700; text-transform: uppercase; letter-spacing: .08em; font-size: 13px; margin: 0 0 14px; }
.pm-h1 { font-family: 'Anton', sans-serif; font-weight: 400; font-size: clamp(54px, 8vw, 96px); line-height: .95; margin: 0 0 18px; letter-spacing: 1px; }
.pm-h1 span { display: block; font-family: 'Kaushan Script', cursive; font-size: clamp(30px, 4vw, 46px); color: #fff; text-shadow: 2px 2px 0 var(--ink); margin-top: 10px; letter-spacing: 0; }
.pm-lede { font-size: 19px; max-width: 540px; margin: 0 0 26px; font-weight: 500; }
.pm-ctas { display: flex; flex-wrap: wrap; gap: 12px; }
.pm-hero .pm-btn-ghost { color: var(--ink); border-color: var(--ink); }
.pm-safety { margin: 20px 0 0; background: rgba(255,255,255,.85); display: inline-block; padding: 8px 12px; border-radius: 8px; font-size: 14px; }

/* Phone */
.pm-phone { background: var(--ink); border-radius: 34px; padding: 12px; box-shadow: 0 24px 50px rgba(0,0,0,.35); max-width: 330px; justify-self: center; width: 100%; }
.pm-phone-top { color: #fff; text-align: center; font-size: 13px; font-weight: 600; padding: 6px 0 10px; }
.pm-chat { background: #f4f1ea; border-radius: 24px; padding: 14px 12px; display: flex; flex-direction: column; gap: 8px; }
.pm-msg { max-width: 82%; padding: 8px 11px; border-radius: 14px; font-size: 13px; line-height: 1.35; }
.pm-me { align-self: flex-end; background: var(--teal-dark); color: #fff; border-bottom-right-radius: 4px; }
.pm-them { align-self: flex-start; background: #fff; border: 1px solid var(--line); border-bottom-left-radius: 4px; }
.pm-good { background: #fff3df; border-color: var(--orange); }
.pm-photo { padding: 5px; display: flex; flex-direction: column; gap: 4px; }
.pm-photo svg { width: 160px; height: 90px; display: block; border-radius: 8px; }
.pm-photo span { font-size: 11px; padding: 0 4px 2px; opacity: .9; }

/* Sections */
.pm-section { padding: 80px 0; }
.pm-cream { background: var(--cream); }
.pm-dark { background: var(--ink); color: #fff; }
.pm-kicker { font-weight: 800; text-transform: uppercase; letter-spacing: .1em; font-size: 13px; color: var(--teal-dark); margin: 0 0 8px; }
.pm-kicker-orange { color: var(--orange); }
.pm-h2 { font-family: 'Anton', sans-serif; font-weight: 400; font-size: clamp(34px, 5vw, 52px); line-height: 1.05; margin: 0 0 14px; letter-spacing: .5px; }
.pm-h2-light { color: #fff; }
.pm-sub { font-size: 18px; max-width: 620px; margin: 0 0 32px; }

/* Steps */
.pm-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-top: 30px; }
.pm-step { background: #fff; border: 2px solid var(--ink); border-radius: 14px; padding: 22px; box-shadow: 5px 5px 0 var(--teal); }
.pm-step-n { display: inline-grid; place-items: center; width: 38px; height: 38px; border-radius: 50%; background: var(--orange); font-family: 'Anton', sans-serif; font-size: 20px; }
.pm-step h3 { margin: 14px 0 6px; font-size: 18px; }
.pm-step p { margin: 0; font-size: 15px; }
.pm-nights { margin-top: 30px; background: #fff; border-left: 6px solid var(--orange); padding: 16px 20px; border-radius: 8px; font-size: 16px; }

/* Impact */
.pm-impact { background: var(--orange); padding: 44px 0; border-top: 6px solid var(--ink); border-bottom: 6px solid var(--ink); }
.pm-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; text-align: center; }
.pm-stat-v { font-family: 'Anton', sans-serif; font-size: clamp(38px, 5vw, 58px); margin: 0; line-height: 1; }
.pm-stat-l { margin: 6px 0 0; font-weight: 700; text-transform: uppercase; font-size: 13px; letter-spacing: .06em; }
.pm-impact-note { text-align: center; margin: 22px 0 0; font-weight: 600; }

/* Give */
.pm-gifts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
.pm-gift { border: 2px solid var(--ink); border-radius: 14px; padding: 22px; display: flex; flex-direction: column; gap: 4px; }
.pm-gift-icon { width: 46px; height: 46px; border-radius: 12px; background: var(--teal); display: grid; place-items: center; }
.pm-gift-icon svg { width: 26px; height: 26px; fill: var(--ink); }
.pm-gift h3 { margin: 12px 0 0; font-size: 18px; }
.pm .pm-gift-amt { font-family: 'Anton', sans-serif; font-size: 34px; line-height: 1.1; margin: 2px 0 6px; color: var(--teal-dark); }
.pm-gift p { margin: 0 0 14px; font-size: 15px; }
.pm-gift .pm-btn { margin-top: auto; }
.pm-more { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 22px; }
.pm-more-card { background: var(--cream); border-radius: 14px; padding: 26px; border: 2px solid var(--line); }
.pm-more-card h3 { margin: 0 0 8px; font-size: 22px; }
.pm-more-card p { margin: 0 0 18px; }

/* Videos */
.pm-videos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 28px; }
.pm-video { aspect-ratio: 9 / 12; border-radius: 14px; text-decoration: none; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
  background: linear-gradient(160deg, var(--teal-dark), #0e3e42); border: 2px solid var(--teal); }
.pm-play { width: 64px; height: 64px; border-radius: 50%; background: var(--orange); color: var(--ink); display: grid; place-items: center; font-size: 24px; }
.pm-video-label { font-size: 14px; opacity: .85; }
.pm-social { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 24px; }
.pm-chip { color: var(--ink); background: var(--teal); padding: 8px 16px; border-radius: 999px; text-decoration: none; font-weight: 700; font-size: 14px; }

/* Repairs */
.pm-repairs { display: grid; grid-template-columns: 1.1fr .9fr; gap: 40px; align-items: center; }
.pm-hours { margin: 0 0 22px; }
.pm-services { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.pm-services li { background: #fff; border: 2px solid var(--ink); border-radius: 10px; padding: 12px 14px; font-weight: 600; font-size: 15px; }

/* Footer */
.pm-foot { background: var(--ink); color: #fff; padding: 44px 0 24px; }
.pm-foot-in { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.pm-foot p { margin: 0 0 6px; }
.pm-foot .pm-logo-big { color: #fff; }
.pm-foot .pm-logo-script { color: var(--teal); }
.pm-credit { text-align: center; font-size: 13px; opacity: .7; margin-top: 28px !important; }
.pm-credit a { color: var(--orange); }

.pm-toast { position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); background: var(--ink); color: #fff; padding: 12px 18px; border-radius: 10px; border: 2px solid var(--orange); font-size: 14px; z-index: 50; max-width: calc(100% - 32px); }
.pm-fade-enter-active, .pm-fade-leave-active { transition: opacity .2s; }
.pm-fade-enter-from, .pm-fade-leave-to { opacity: 0; }

@media (max-width: 900px) {
  .pm-links { display: none; }
  .pm-hero-in { grid-template-columns: 1fr; padding: 44px 16px 56px; }
  .pm-stripes { opacity: .35; }
  .pm-steps, .pm-gifts { grid-template-columns: 1fr 1fr; }
  .pm-stats { grid-template-columns: 1fr 1fr; row-gap: 26px; }
  .pm-more, .pm-repairs, .pm-foot-in { grid-template-columns: 1fr; }
  .pm-videos { grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
}
@media (max-width: 560px) {
  .pm-wrap { padding: 0 16px; }
  .pm-steps, .pm-gifts { grid-template-columns: 1fr; }
  .pm-videos { grid-template-columns: 1fr; }
  .pm-video { aspect-ratio: 16 / 9; }
  .pm-services { grid-template-columns: 1fr; }
  .pm-nav .pm-btn-sm { font-size: 13px; padding: 8px 10px; }
  .pm-logo-big { font-size: 24px; }
  .pm-section { padding: 56px 0; }
}
</style>
