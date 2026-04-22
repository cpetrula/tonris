<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'

const mobileMenuOpen = ref(false)

const heroImages = [
  'https://kawaikids.com/wp-content/uploads/2021/10/girl-playing-legos-1920x1280-1.jpg',
  'https://kawaikids.com/wp-content/uploads/2021/10/writing-1920x1280-1.jpg',
  'https://kawaikids.com/wp-content/uploads/2021/09/playing-game-1920x1280-1.jpg',
]
const currentHeroIndex = ref(0)
let heroInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  heroInterval = setInterval(() => {
    currentHeroIndex.value = (currentHeroIndex.value + 1) % heroImages.length
  }, 5000)
})

onUnmounted(() => {
  if (heroInterval) clearInterval(heroInterval)
})

const programs = [
  {
    name: 'Infants',
    ages: '3 – 18 months',
    description: 'Our infant program is designed to nurture and support each child through engaging, hands-on experiences, including sensory play, music, movement, and early language development through talking and baby sign language. We focus on building strong bonds, trust, and communication while following a routine tailored to each child\'s individual needs. In a warm and nurturing environment, our infants are encouraged to explore, grow, and thrive at their own pace.',
    image: 'https://kawaikids.com/wp-content/uploads/2021/10/infant-1920x1280-1-408x250.jpg',
    color: 'from-pink-400 to-rose-500'
  },
  {
    name: 'Toddlers',
    ages: '18 – 24+ months',
    description: 'Our toddler program is designed to keep busy little learners engaged through hands-on activities, play-based learning, music, movement, and language development. We focus on building independence, communication, and social skills while maintaining a consistent routine that supports each child\'s growth. Through exploration, creativity, and guided learning, toddlers are encouraged to learn, play, and thrive in a fun and nurturing environment.',
    image: 'https://kawaikids.com/wp-content/uploads/2017/06/baby-alphabet-1920x1280-1-408x250.jpg',
    color: 'from-orange-400 to-amber-500'
  },
  {
    name: 'Early Preschool',
    ages: '2 – 3 years',
    description: 'Our early preschool program focuses on engaging, hands-on learning that builds independence, communication, and social skills. Children are introduced to letters, numbers, shapes, and colors through interactive activities. Language enrichment is incorporated through Spanish and Mandarin, and weekly themed lesson plans spark curiosity and exploration.',
    image: 'https://kawaikids.com/wp-content/uploads/2021/10/kids-playing-music-1920x1280-1-408x250.jpg',
    color: 'from-violet-400 to-purple-500'
  },
  {
    name: 'Preschool',
    ages: '3 – 4 years',
    description: 'Our preschool program encourages active, hands-on learning that builds confidence, independence, and strong social skills. Children develop early academic foundations, including letters, numbers, shapes, and colors, through engaging and meaningful activities. We incorporate Spanish and Mandarin for language enrichment, and weekly themed lesson plans inspire creativity, curiosity, and a deeper love for learning.',
    image: 'https://kawaikids.com/wp-content/uploads/2021/10/painting-1920x1280-1-450x450.jpg',
    color: 'from-cyan-400 to-teal-500'
  },
  {
    name: 'Pre-Kindergarten',
    ages: '4 – 5 years',
    description: 'Our Pre-Kindergarten program prepares children for a successful transition into Kindergarten by building strong foundations in early literacy, including early reading skills, math, and problem-solving. Children develop confidence, independence, and essential school-readiness skills. Language enrichment is incorporated through Spanish and Mandarin, and weekly themed lesson plans support continued growth, curiosity, and a love for learning.',
    image: 'https://kawaikids.com/wp-content/uploads/2021/11/reading-with-children-1920x1280-1-408x250.jpg',
    color: 'from-blue-400 to-indigo-500'
  },
  {
    name: 'School Age',
    ages: 'TK – 12 years',
    description: 'Homework assistance during the school year and recreational programs during school breaks and early dismissal days, with indoor and outdoor activities and character development.',
    image: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=800&h=500&fit=crop',
    color: 'from-emerald-400 to-green-500',
    montebelloOnly: true
  }
]

const reviews = [
  {
    text: 'The staff here truly care about the well-being and continued growth and development of your child. If I could give more than 5 stars I would!',
    author: 'Parent',
    location: 'Montebello',
    stars: 5
  },
  {
    text: 'Kawai Kids has been a true blessing in disguise for our two babies and our family. The teachers truly love what they do.',
    author: 'Parent',
    location: 'Alhambra',
    stars: 5
  },
  {
    text: 'Teachers are really patient and attentive. My daughter has grown so much since attending. Best decision we ever made for our family.',
    author: 'Parent',
    location: 'Montebello',
    stars: 5
  },
  {
    text: 'Home to a team of teachers who truly love what they do, all under the fantastic leadership of the Director, Ms. Jenna.',
    author: 'Parent',
    location: 'Alhambra',
    stars: 5
  }
]

const blogPosts = [
  {
    title: 'Why Reading with Children is Important',
    category: 'Parenting Tips',
    date: 'March 28, 2026',
    excerpt: 'Reading with your child at least 10 minutes a day is very important for your child\'s brain development and helps in getting ready for future school success.',
    image: 'https://kawaikids.com/wp-content/uploads/2021/11/reading-with-children-1920x1280-1-408x250.jpg',
  },
  {
    title: 'Importance of Art in Early Child Development',
    category: 'Kids Education',
    date: 'March 27, 2026',
    excerpt: 'Art since prehistoric times has garnered immense significance in the development of mankind. Today\'s education system has realized the vitality of including arts in the curriculum.',
    image: 'https://kawaikids.com/wp-content/uploads/2021/11/kids-blocks-1920x1280-1-408x250.jpg',
  },
  {
    title: 'Importance of Free Play',
    category: 'Parenting Tips',
    date: 'March 26, 2026',
    excerpt: 'Play is essential to development because it contributes to the cognitive, physical, social and emotional well-being of children and youth.',
    image: 'https://kawaikids.com/wp-content/uploads/2021/09/playing-game-1920x1280-1-408x250.jpg',
  },
]

const highlights = [
  { icon: 'pi pi-clock', label: 'Open 7AM – 6PM', sublabel: 'Monday through Friday' },
  { icon: 'pi pi-heart', label: 'Est. 2007', sublabel: '19 years of trusted care' },
  { icon: 'pi pi-star', label: '5.0 Stars', sublabel: 'on Yelp reviews' },
  { icon: 'pi pi-users', label: 'Newborn – 12 yrs', sublabel: 'Programs for every age' },
  { icon: 'pi pi-sun', label: 'On-Site Chef', sublabel: 'All meals included' },
  { icon: 'pi pi-shield', label: 'Licensed & Certified', sublabel: 'First Aid & CPR trained' }
]

const faqs = [
  {
    question: 'What ages do you accept?',
    answer: 'We accept children from 3 months old through 12 years of age, covering infant care, toddler, preschool, pre-kindergarten, and school-age programs.'
  },
  {
    question: 'Are meals included?',
    answer: 'Yes! Our on-site chef prepares breakfast, lunch, and two snacks daily. Milk is provided and water is available throughout the day.'
  },
  {
    question: 'What are your hours?',
    answer: 'We are open Monday–Friday 7am–6pm.'
  },
  {
    question: 'What schedule options are available?',
    answer: 'We offer flexible schedules: 5 days (Mon–Fri), 3 days (Mon/Wed/Fri), or 2 days (Tue/Thu).'
  },
  {
    question: 'What qualifications do your staff have?',
    answer: 'All staff have criminal clearance, a minimum of 12 ECE units, First Aid/CPR certification, and meet all Title 22 requirements. Infant and toddler teachers have additional specialized training.'
  },
  {
    question: 'How does your waitlist work?',
    answer: 'If no spots are currently available, families are placed on our waitlist and contacted when an opening arises. You\'ll have 48–72 hours to confirm your spot.'
  }
]

const kawaiPhone = '(323) 728-5437'
</script>

<template>
  <div class="kawai-kids-page">
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Caveat:wght@400;700&display=swap" rel="stylesheet" />

    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <img
              src="https://kawaikids.com/wp-content/uploads/2025/03/logo-2025-trans.png"
              alt="Kawai Kids"
              class="h-14 w-auto"
            />
          </div>

          <!-- Desktop Nav -->
          <div class="hidden md:flex items-center gap-8">
            <a href="#programs" class="font-medium text-gray-700 hover:text-purple-600 transition-colors" style="font-family: 'Fredoka', sans-serif;">Programs</a>
            <a href="#why-us" class="font-medium text-gray-700 hover:text-purple-600 transition-colors" style="font-family: 'Fredoka', sans-serif;">Why Us</a>
            <a href="#reviews" class="font-medium text-gray-700 hover:text-purple-600 transition-colors" style="font-family: 'Fredoka', sans-serif;">Reviews</a>
            <a href="#locations" class="font-medium text-gray-700 hover:text-purple-600 transition-colors" style="font-family: 'Fredoka', sans-serif;">Locations</a>
            <a href="#faq" class="font-medium text-gray-700 hover:text-purple-600 transition-colors" style="font-family: 'Fredoka', sans-serif;">FAQ</a>
            <a
              :href="`tel:${kawaiPhone.replace(/[^0-9]/g, '')}`"
              class="inline-flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-purple-700 transition-colors"
              style="font-family: 'Fredoka', sans-serif;"
            >
              <i class="pi pi-phone text-sm"></i>
              Call Us
            </a>
          </div>

          <!-- Mobile menu button -->
          <button
            class="md:hidden p-2 rounded-lg hover:bg-gray-100"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <i :class="mobileMenuOpen ? 'pi pi-times' : 'pi pi-bars'" class="text-xl text-gray-700"></i>
          </button>
        </div>

        <!-- Mobile Nav -->
        <div v-if="mobileMenuOpen" class="md:hidden pb-4 border-t border-gray-100">
          <div class="flex flex-col gap-3 pt-4">
            <a href="#programs" class="font-medium text-gray-700 px-3 py-2 rounded-lg hover:bg-purple-50" style="font-family: 'Fredoka', sans-serif;" @click="mobileMenuOpen = false">Programs</a>
            <a href="#why-us" class="font-medium text-gray-700 px-3 py-2 rounded-lg hover:bg-purple-50" style="font-family: 'Fredoka', sans-serif;" @click="mobileMenuOpen = false">Why Us</a>
            <a href="#reviews" class="font-medium text-gray-700 px-3 py-2 rounded-lg hover:bg-purple-50" style="font-family: 'Fredoka', sans-serif;" @click="mobileMenuOpen = false">Reviews</a>
            <a href="#locations" class="font-medium text-gray-700 px-3 py-2 rounded-lg hover:bg-purple-50" style="font-family: 'Fredoka', sans-serif;" @click="mobileMenuOpen = false">Locations</a>
            <a href="#faq" class="font-medium text-gray-700 px-3 py-2 rounded-lg hover:bg-purple-50" style="font-family: 'Fredoka', sans-serif;" @click="mobileMenuOpen = false">FAQ</a>
            <a
              :href="`tel:${kawaiPhone.replace(/[^0-9]/g, '')}`"
              class="inline-flex items-center justify-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-full font-semibold"
              style="font-family: 'Fredoka', sans-serif;"
            >
              <i class="pi pi-phone text-sm"></i>
              Call Us
            </a>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative pt-20 overflow-hidden">
      <!-- Background with overlay -->
      <div class="absolute inset-0">
        <img
          v-for="(img, index) in heroImages"
          :key="img"
          :src="img"
          alt="Children at Kawai Kids"
          class="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          :class="index === currentHeroIndex ? 'opacity-100' : 'opacity-0'"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-purple-900/85 via-purple-800/75 to-fuchsia-900/70"></div>
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p class="text-purple-200 text-lg mb-3" style="font-family: 'Caveat', cursive; font-size: 1.5rem;">
              Where the love of learning begins
            </p>
            <h1
              class="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
              style="font-family: 'Fredoka', sans-serif;"
            >
              A Nurturing Place for Your Little One to
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-pink-300">Play, Learn & Grow</span>
            </h1>
            <p class="text-lg text-purple-100 mb-8 leading-relaxed">
              Since 2007, Kawai Kids has provided safe, loving childcare for children newborn–12 years old.
              With on-site meals, flexible schedules, and a curriculum that balances play and academics — your child will thrive.
            </p>

            <div class="flex flex-col sm:flex-row gap-4">
              <a
                href="/kawaikids/enroll"

                class="inline-flex items-center justify-center gap-2 bg-amber-400 text-purple-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-amber-300 transition-all hover:scale-105 shadow-lg shadow-amber-400/30"
                style="font-family: 'Fredoka', sans-serif;"
              >
                Join Our Waitlist
                <i class="pi pi-arrow-right"></i>
              </a>
            </div>
          </div>

          <!-- Stats Card -->
          <div class="hidden lg:block">
            <div class="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div class="grid grid-cols-2 gap-6">
                <div class="text-center p-4">
                  <div class="text-4xl font-bold text-amber-300 mb-1" style="font-family: 'Fredoka', sans-serif;">19+</div>
                  <div class="text-purple-200 text-sm">Years of Excellence</div>
                </div>
                <div class="text-center p-4">
                  <div class="text-4xl font-bold text-amber-300 mb-1" style="font-family: 'Fredoka', sans-serif;">5.0</div>
                  <div class="text-purple-200 text-sm">Yelp Stars</div>
                </div>
                <div class="text-center p-4">
                  <div class="text-4xl font-bold text-amber-300 mb-1" style="font-family: 'Fredoka', sans-serif;">1:4</div>
                  <div class="text-purple-200 text-sm">Infant Ratio</div>
                </div>
                <div class="text-center p-4">
                  <div class="text-4xl font-bold text-amber-300 mb-1" style="font-family: 'Fredoka', sans-serif;">2</div>
                  <div class="text-purple-200 text-sm">Locations</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Wave separator -->
      <div class="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>

    <!-- Highlights Bar -->
    <section class="py-12 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div
            v-for="item in highlights"
            :key="item.label"
            class="text-center group"
          >
            <div class="w-14 h-14 mx-auto mb-3 bg-purple-100 rounded-2xl flex items-center justify-center group-hover:bg-purple-200 transition-colors group-hover:scale-110 transform duration-200">
              <i :class="item.icon" class="text-2xl text-purple-600"></i>
            </div>
            <div class="font-semibold text-gray-900 text-sm" style="font-family: 'Fredoka', sans-serif;">{{ item.label }}</div>
            <div class="text-xs text-gray-500">{{ item.sublabel }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Programs Section -->
    <section id="programs" class="py-16 md:py-24 bg-gradient-to-b from-white to-purple-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <p class="text-purple-500 font-bold mb-2" style="font-family: 'Caveat', cursive; font-size: 1.5rem;">Our Programs</p>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style="font-family: 'Fredoka', sans-serif;">
            Programs for Every Stage
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            From their very first steps to homework help after school — we have a nurturing program designed for every age and stage.
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="program in programs"
            :key="program.name"
            class="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div class="relative h-48 overflow-hidden">
              <img
                :src="program.image"
                :alt="program.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div :class="`absolute inset-0 bg-gradient-to-t ${program.color} opacity-30`"></div>
              <div class="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-purple-700">
                {{ program.ages }}
              </div>
              <div
                v-if="program.montebelloOnly"
                class="absolute bottom-3 left-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 shadow-md"
              >
                <i class="pi pi-map-marker text-[10px]"></i>
                Montebello only
              </div>
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2" style="font-family: 'Fredoka', sans-serif;">{{ program.name }}</h3>
              <p class="text-gray-600 text-sm leading-relaxed">{{ program.description }}</p>
            </div>
          </div>
        </div>

        <div class="text-center mt-12">
          <p class="text-gray-500 mb-4">Flexible scheduling: 2, 3, or 5 days per week</p>
          <a
            href="/kawaikids/enroll"

            class="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors"
            style="font-family: 'Fredoka', sans-serif;"
          >
            Join Our Waitlist
            <i class="pi pi-arrow-right"></i>
          </a>
        </div>
      </div>
    </section>

    <!-- Why Us Section -->
    <section id="why-us" class="py-16 md:py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p class="text-purple-500 font-bold mb-2" style="font-family: 'Caveat', cursive; font-size: 1.5rem;">Why Choose Us</p>
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6" style="font-family: 'Fredoka', sans-serif;">
              More Than Just Daycare
            </h2>
            <p class="text-gray-600 mb-8 leading-relaxed">
              At Kawai Kids, we believe every child deserves a safe, stimulating, and loving environment.
              Our curriculum balances hands-on and academic learning through weekly themes that encourage curiosity and exploration.
            </p>

            <div class="space-y-5">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i class="pi pi-sun text-xl text-amber-600"></i>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900" style="font-family: 'Fredoka', sans-serif;">Chef-Prepared Meals Daily</h4>
                  <p class="text-sm text-gray-600">Breakfast, lunch, and two snacks prepared fresh on-site every day.</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i class="pi pi-book text-xl text-teal-600"></i>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900" style="font-family: 'Fredoka', sans-serif;">Hands-on Curriculum</h4>
                  <p class="text-sm text-gray-600">Teacher-directed and child-initiated activities that support the whole child — emotionally, socially, physically, and cognitively.</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i class="pi pi-comments text-xl text-pink-600"></i>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900" style="font-family: 'Fredoka', sans-serif;">Parent Communication</h4>
                  <p class="text-sm text-gray-600">We keep families connected through daily updates, photos, and videos shared on the Brightwheel app, providing a window into your child's day.</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i class="pi pi-shield text-xl text-violet-600"></i>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900" style="font-family: 'Fredoka', sans-serif;">Trained & Certified Staff</h4>
                  <p class="text-sm text-gray-600">Our team consists of experienced educators who hold ECE units, Pediatric First Aid and CPR certifications, and meet all Title 22 requirements, ensuring a safe and high-quality learning environment.</p>
                </div>
              </div>

            </div>
          </div>

          <!-- Image Collage -->
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-4">
              <img
                src="https://kawaikids.com/wp-content/uploads/2021/10/painting-1920x1280-1-450x450.jpg"
                alt="Children painting"
                class="rounded-2xl shadow-lg w-full object-cover h-64"
              />
              <img
                src="https://kawaikids.com/wp-content/uploads/2021/10/kids-playing-music-1920x1280-1-408x250.jpg"
                alt="Kids playing music"
                class="rounded-2xl shadow-lg w-full object-cover h-44"
              />
            </div>
            <div class="space-y-4 pt-8">
              <img
                src="https://kawaikids.com/wp-content/uploads/2021/11/reading-with-children-1920x1280-1-408x250.jpg"
                alt="Reading with children"
                class="rounded-2xl shadow-lg w-full object-cover h-44"
              />
              <img
                src="https://kawaikids.com/wp-content/uploads/2021/10/girl-playing-legos-1920x1280-1.jpg"
                alt="Girl playing legos"
                class="rounded-2xl shadow-lg w-full object-cover h-64"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Reviews Section -->
    <section id="reviews" class="py-16 md:py-24 bg-gradient-to-b from-purple-50 to-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <p class="text-purple-500 font-bold mb-2" style="font-family: 'Caveat', cursive; font-size: 1.5rem;">Parent Love</p>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style="font-family: 'Fredoka', sans-serif;">
            What Parents Are Saying
          </h2>
          <div class="flex items-center justify-center gap-2 mb-2">
            <i class="pi pi-star-fill text-amber-400 text-xl" v-for="n in 5" :key="n"></i>
          </div>
          <p class="text-gray-600">5.0 out of 5 stars on Yelp</p>
        </div>

        <div class="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div
            v-for="(review, index) in reviews"
            :key="index"
            class="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow border border-purple-100"
          >
            <div class="flex gap-1 mb-4">
              <i class="pi pi-star-fill text-amber-400" v-for="n in review.stars" :key="n"></i>
            </div>
            <p class="text-gray-700 leading-relaxed mb-6 italic text-lg">
              "{{ review.text }}"
            </p>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <i class="pi pi-user text-purple-500"></i>
              </div>
              <div>
                <div class="font-semibold text-gray-900" style="font-family: 'Fredoka', sans-serif;">{{ review.author }}</div>
                <div class="text-sm text-gray-500">{{ review.location }} Location</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Locations Section -->
    <section id="locations" class="py-16 md:py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style="font-family: 'Fredoka', sans-serif;">
            Our Locations
          </h2>
        </div>

        <div class="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <!-- Montebello -->
          <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
            <div class="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center mb-5">
              <i class="pi pi-building text-2xl text-white"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-1" style="font-family: 'Fredoka', sans-serif;">Montebello</h3>
            <p class="text-sm text-purple-500 font-medium mb-4">License #198013467</p>
            <div class="space-y-3 text-gray-700">
              <div class="flex items-start gap-3">
                <i class="pi pi-map-marker text-purple-500 mt-0.5"></i>
                <span>2433 W. Via Camille<br/>Montebello, CA 90640</span>
              </div>
              <div class="flex items-center gap-3">
                <i class="pi pi-phone text-purple-500"></i>
                <a href="tel:3237285437" class="hover:text-purple-600 transition-colors font-medium">(323) 728-KIDS (5437)</a>
              </div>
              <div class="flex items-center gap-3">
                <i class="pi pi-clock text-purple-500"></i>
                <span>Mon – Fri, 7:00 AM – 6:00 PM</span>
              </div>
            </div>
          </div>

          <!-- Alhambra -->
          <div class="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl p-8 border border-cyan-100">
            <div class="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center mb-5">
              <i class="pi pi-building text-2xl text-white"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-1" style="font-family: 'Fredoka', sans-serif;">Alhambra</h3>
            <p class="text-sm text-teal-500 font-medium mb-4">License #198021736</p>
            <div class="space-y-3 text-gray-700">
              <div class="flex items-start gap-3">
                <i class="pi pi-map-marker text-teal-500 mt-0.5"></i>
                <span>2218 S. Fremont Ave<br/>Alhambra, CA 91803</span>
              </div>
              <div class="flex items-center gap-3">
                <i class="pi pi-phone text-teal-500"></i>
                <a href="tel:6266288327" class="hover:text-teal-600 transition-colors font-medium">(626) 628-8327</a>
              </div>
              <div class="flex items-center gap-3">
                <i class="pi pi-clock text-teal-500"></i>
                <span>Mon – Fri, 7:00 AM – 6:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section id="faq" class="py-16 md:py-24 bg-purple-50">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <p class="text-purple-500 font-bold mb-2" style="font-family: 'Caveat', cursive; font-size: 1.5rem;">Questions?</p>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style="font-family: 'Fredoka', sans-serif;">
            Frequently Asked Questions
          </h2>
        </div>

        <Accordion class="kawai-accordion">
          <AccordionPanel v-for="(faq, index) in faqs" :key="index" :value="String(index)">
            <AccordionHeader>
              <span class="font-semibold text-gray-900" style="font-family: 'Fredoka', sans-serif;">{{ faq.question }}</span>
            </AccordionHeader>
            <AccordionContent>
              <p class="text-gray-600 leading-relaxed">{{ faq.answer }}</p>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </div>
    </section>

    <!-- Blog / Parenting Tips Section -->
    <section class="py-16 md:py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <p class="text-purple-500 font-bold mb-2" style="font-family: 'Caveat', cursive; font-size: 1.5rem;">From Our Blog</p>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style="font-family: 'Fredoka', sans-serif;">
            Parenting Tips & Resources
          </h2>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div
            v-for="post in blogPosts"
            :key="post.title"
            class="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
          >
            <div class="relative h-48 overflow-hidden">
              <img
                :src="post.image"
                :alt="post.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div class="absolute top-3 left-3 bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                {{ post.category }}
              </div>
            </div>
            <div class="p-6">
              <p class="text-xs text-gray-400 mb-2">{{ post.date }}</p>
              <h3 class="text-lg font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors" style="font-family: 'Fredoka', sans-serif;">
                {{ post.title }}
              </h3>
              <p class="text-sm text-gray-600 leading-relaxed">{{ post.excerpt }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 md:py-20 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-4" style="font-family: 'Fredoka', sans-serif;">
          Ready to Give Your Child the Best Start?
        </h2>
        <p class="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
          Join our waitlist today and become part of the Kawai Kids family. Flexible schedules, loving staff, and a curriculum designed to help your child thrive.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/kawaikids/enroll"

            class="inline-flex items-center justify-center gap-2 bg-amber-400 text-purple-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-amber-300 transition-all shadow-lg"
            style="font-family: 'Fredoka', sans-serif;"
          >
            Join Our Waitlist
            <i class="pi pi-arrow-right"></i>
          </a>
          <a
            href="tel:3237285437"
            class="inline-flex items-center justify-center gap-2 bg-white/15 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/25 transition-all border border-white/30"
            style="font-family: 'Fredoka', sans-serif;"
          >
            <i class="pi pi-phone"></i>
            (323) 728-KIDS
          </a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-400 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-3 gap-8">
          <div>
            <img
              src="https://kawaikids.com/wp-content/uploads/2017/06/logo-2025-trans-3d.png"
              alt="Kawai Kids"
              class="h-16 w-auto mb-4"
            />
            <p class="text-sm leading-relaxed">
              Serving families since 2007.
            </p>
          </div>
          <div>
            <h4 class="font-bold text-white mb-4" style="font-family: 'Fredoka', sans-serif;">Quick Links</h4>
            <div class="space-y-2 text-sm">
              <a href="#programs" class="block hover:text-white transition-colors">Programs</a>
              <a href="#why-us" class="block hover:text-white transition-colors">Why Choose Us</a>
              <a href="#reviews" class="block hover:text-white transition-colors">Reviews</a>
              <a href="#locations" class="block hover:text-white transition-colors">Locations</a>
              <a href="#faq" class="block hover:text-white transition-colors">FAQ</a>
            </div>
          </div>
          <div>
            <h4 class="font-bold text-white mb-4" style="font-family: 'Fredoka', sans-serif;">Contact</h4>
            <div class="space-y-2 text-sm">
              <a href="tel:3237285437" class="block hover:text-white transition-colors">
                <i class="pi pi-phone mr-2"></i>(323) 728-KIDS (5437)
              </a>
              <a href="tel:6266288327" class="block hover:text-white transition-colors">
                <i class="pi pi-phone mr-2"></i>(626) 628-8327
              </a>
              <a href="mailto:info@kawaikids.com" class="block hover:text-white transition-colors">
                <i class="pi pi-envelope mr-2"></i>info@kawaikids.com
              </a>
            </div>
          </div>
        </div>
        <!-- Social Links -->
        <div class="border-t border-gray-800 mt-8 pt-8">
          <div class="flex flex-col md:flex-row justify-between items-center gap-6">
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-500">Follow us:</span>
              <a href="https://www.instagram.com/kawaikidsmontebello/" target="_blank" class="text-gray-400 hover:text-white transition-colors text-sm">
                <i class="pi pi-instagram mr-1"></i>Montebello
              </a>
              <a href="https://www.instagram.com/kawaikidsalhambra/" target="_blank" class="text-gray-400 hover:text-white transition-colors text-sm">
                <i class="pi pi-instagram mr-1"></i>Alhambra
              </a>
              <a href="https://www.facebook.com/kawaikids" target="_blank" class="text-gray-400 hover:text-white transition-colors">
                <i class="pi pi-facebook text-lg"></i>
              </a>
              <a href="https://www.yelp.com/biz/kawai-kids-montebello" target="_blank" class="text-gray-400 hover:text-white transition-colors text-sm font-bold">
                Yelp
              </a>
            </div>
            <div class="flex items-center gap-4 text-xs text-gray-500">
              <a href="https://kawaikids.com/our-policy/" target="_blank" class="hover:text-gray-300 transition-colors">Our Policy</a>
              <span>|</span>
              <a href="https://kawaikids.com/terms-of-use/" target="_blank" class="hover:text-gray-300 transition-colors">Terms of Use</a>
              <span>|</span>
              <a href="https://kawaikids.com/privacy-policy/" target="_blank" class="hover:text-gray-300 transition-colors">Privacy Policy</a>
            </div>
          </div>
          <div class="flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
            <p class="text-sm">&copy; {{ new Date().getFullYear() }} Kawai Kids Learning Center. All rights reserved.</p>
            <div class="flex items-center gap-2 text-sm">
              <span>Website powered by</span>
              <a href="/" class="text-purple-400 hover:text-purple-300 font-semibold transition-colors">CRITON.AI</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.kawai-kids-page {
  font-family: 'Fredoka', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Smooth scroll */
html {
  scroll-behavior: smooth;
}

/* Custom accordion styling */
:deep(.kawai-accordion .p-accordionpanel) {
  border: 1px solid #e9d5ff;
  border-radius: 1rem;
  margin-bottom: 0.75rem;
  overflow: hidden;
  background: white;
}

:deep(.kawai-accordion .p-accordionheader) {
  padding: 1.25rem 1.5rem;
  background: white;
  border: none;
}

:deep(.kawai-accordion .p-accordioncontent-content) {
  padding: 0 1.5rem 1.25rem;
}
</style>
