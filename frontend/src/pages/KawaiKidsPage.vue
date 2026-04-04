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
    ages: '0 – 12 months',
    description: 'Our Infant Program is a home away from home. The majority of our day is filled with cuddling, singing and talking with your baby. A schedule tailored to your child\'s individual needs.',
    image: 'https://kawaikids.com/wp-content/uploads/2021/10/infant-1920x1280-1-408x250.jpg',
    color: 'from-pink-400 to-rose-500'
  },
  {
    name: 'Toddlers',
    ages: '12 – 24 months',
    description: 'A structured schedule with balanced indoor and outdoor activities promoting overall development — language, literacy, physical, social, emotional, and cognitive growth.',
    image: 'https://kawaikids.com/wp-content/uploads/2017/06/baby-alphabet-1920x1280-1-408x250.jpg',
    color: 'from-orange-400 to-amber-500'
  },
  {
    name: 'Early Preschool',
    ages: '2 – 3 years',
    description: 'Structured indoor and outdoor activities promoting language, literacy, physical, social, emotional, and cognitive development through guided play and creative expression.',
    image: 'https://kawaikids.com/wp-content/uploads/2021/10/kids-playing-music-1920x1280-1-408x250.jpg',
    color: 'from-violet-400 to-purple-500'
  },
  {
    name: 'Preschool',
    ages: '3 – 4 years',
    description: 'Our curriculum provides engaging hands-on experiences that promote language development, independence, and exploration of their surroundings.',
    image: 'https://kawaikids.com/wp-content/uploads/2021/10/painting-1920x1280-1-450x450.jpg',
    color: 'from-cyan-400 to-teal-500'
  },
  {
    name: 'Pre-Kindergarten',
    ages: '4 – 5 years',
    description: 'Structured activities promoting language, literacy, physical, social, emotional, and cognitive development to prepare children for a smooth transition to kindergarten.',
    image: 'https://kawaikids.com/wp-content/uploads/2021/11/reading-with-children-1920x1280-1-408x250.jpg',
    color: 'from-blue-400 to-indigo-500'
  },
  {
    name: 'School Age',
    ages: 'TK – 12 years',
    description: 'Homework assistance during the school year and recreational programs during school breaks and early dismissal days, with indoor and outdoor activities and character development.',
    image: 'https://kawaikids.com/wp-content/uploads/2021/11/kids-blocks-1920x1280-1-408x250.jpg',
    color: 'from-emerald-400 to-green-500'
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

const highlights = [
  { icon: 'pi pi-clock', label: 'Open 7AM – 6PM', sublabel: 'Monday through Friday' },
  { icon: 'pi pi-heart', label: 'Est. 2007', sublabel: '19 years of trusted care' },
  { icon: 'pi pi-star', label: '4.9 Stars', sublabel: 'on Yelp reviews' },
  { icon: 'pi pi-users', label: 'Newborn – 12 yrs', sublabel: 'Programs for every age' },
  { icon: 'pi pi-apple', label: 'On-Site Chef', sublabel: 'All meals included' },
  { icon: 'pi pi-shield', label: 'Licensed & Certified', sublabel: 'First Aid & CPR trained' }
]

const faqs = [
  {
    question: 'What ages do you accept?',
    answer: 'We accept children from 3 months old through 12 years of age, covering infant care, toddler, preschool, pre-kindergarten, and school-age programs.'
  },
  {
    question: 'Are meals included?',
    answer: 'Yes! Our on-site chef prepares breakfast, lunch, and two snacks daily. We accommodate dietary needs — just let us know when enrolling. Milk is provided and water is available throughout the day.'
  },
  {
    question: 'What are your hours?',
    answer: 'We are open Monday through Friday, 7:00 AM to 6:00 PM, year-round. We are closed on bank holidays and for one week during Christmas.'
  },
  {
    question: 'What is the enrollment process?',
    answer: 'Step 1: Fill out our online enrollment form or call us and our AI assistant will help you enroll over the phone. Step 2: We\'ll review your application and contact you within 48-72 hours to schedule a tour. Step 3: Meet with our Director, pay registration fee + deposit + first month\'s tuition. Step 4: Submit immunization records and physician\'s report.'
  },
  {
    question: 'What schedule options are available?',
    answer: 'We offer flexible schedules: 5 days (Mon–Fri), 3 days (Mon/Wed/Fri), or 2 days (Tue/Thu). Full-day and half-day options are available.'
  },
  {
    question: 'What qualifications do your staff have?',
    answer: 'All staff have criminal clearance, minimum 12 ECE units, First Aid/CPR certification, and at least 1 year of experience in licensed childcare. Infant/toddler teachers have additional specialized training.'
  },
  {
    question: 'Do you have a waitlist?',
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
              Since 2007, Kawai Kids has provided safe, loving childcare for children ages newborn through 12.
              With on-site meals, flexible schedules, and a curriculum that balances play and academics — your child will thrive.
            </p>

            <div class="flex flex-col sm:flex-row gap-4">
              <a
                href="/kawaikids/enroll"

                class="inline-flex items-center justify-center gap-2 bg-amber-400 text-purple-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-amber-300 transition-all hover:scale-105 shadow-lg shadow-amber-400/30"
                style="font-family: 'Fredoka', sans-serif;"
              >
                Enroll Now
                <i class="pi pi-arrow-right"></i>
              </a>
              <a
                href="/kawaikids/tour"
                class="inline-flex items-center justify-center gap-2 bg-white/15 backdrop-blur text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/25 transition-all border border-white/30"
                style="font-family: 'Fredoka', sans-serif;"
              >
                <i class="pi pi-calendar"></i>
                Schedule a Tour
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
                  <div class="text-4xl font-bold text-amber-300 mb-1" style="font-family: 'Fredoka', sans-serif;">4.9</div>
                  <div class="text-purple-200 text-sm">Yelp Stars</div>
                </div>
                <div class="text-center p-4">
                  <div class="text-4xl font-bold text-amber-300 mb-1" style="font-family: 'Fredoka', sans-serif;">1:3</div>
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
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2" style="font-family: 'Fredoka', sans-serif;">{{ program.name }}</h3>
              <p class="text-gray-600 text-sm leading-relaxed">{{ program.description }}</p>
            </div>
          </div>
        </div>

        <div class="text-center mt-12">
          <p class="text-gray-500 mb-4">Flexible scheduling: 2, 3, or 5 days per week | Full-day and half-day available</p>
          <a
            href="/kawaikids/enroll"

            class="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors"
            style="font-family: 'Fredoka', sans-serif;"
          >
            Enroll Your Child
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
              Our curriculum balances play-based and academic learning, guided by the Early Years Foundation Stage framework.
            </p>

            <div class="space-y-5">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i class="pi pi-apple text-xl text-amber-600"></i>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900" style="font-family: 'Fredoka', sans-serif;">Chef-Prepared Meals Daily</h4>
                  <p class="text-sm text-gray-600">Breakfast, lunch, and two snacks prepared fresh on-site every day. Dietary needs accommodated.</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i class="pi pi-book text-xl text-teal-600"></i>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900" style="font-family: 'Fredoka', sans-serif;">Play-Based Curriculum</h4>
                  <p class="text-sm text-gray-600">Teacher-directed and child-initiated activities covering 7 key development areas.</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i class="pi pi-heart text-xl text-pink-600"></i>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900" style="font-family: 'Fredoka', sans-serif;">Key Person System</h4>
                  <p class="text-sm text-gray-600">Each child is assigned a dedicated staff member who tracks their individual progress and milestones.</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i class="pi pi-shield text-xl text-violet-600"></i>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900" style="font-family: 'Fredoka', sans-serif;">Trained & Certified Staff</h4>
                  <p class="text-sm text-gray-600">All staff hold ECE units, First Aid/CPR certifications, and specialized training including special needs awareness.</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i class="pi pi-mobile text-xl text-cyan-600"></i>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900" style="font-family: 'Fredoka', sans-serif;">Brightwheel Connected</h4>
                  <p class="text-sm text-gray-600">Real-time updates, photos, and daily reports straight to your phone. Stay connected to your child's day.</p>
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
          <p class="text-gray-600">4.9 out of 5 stars on Yelp</p>
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
          <p class="text-purple-500 font-bold mb-2" style="font-family: 'Caveat', cursive; font-size: 1.5rem;">Visit Us</p>
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
            <a
              href="/kawaikids/tour"
              class="inline-flex items-center gap-2 mt-6 bg-purple-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-purple-700 transition-colors text-sm"
              style="font-family: 'Fredoka', sans-serif;"
            >
              <i class="pi pi-calendar"></i>
              Schedule a Tour
            </a>
          </div>

          <!-- Alhambra -->
          <div class="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl p-8 border border-cyan-100">
            <div class="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center mb-5">
              <i class="pi pi-building text-2xl text-white"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-1" style="font-family: 'Fredoka', sans-serif;">Alhambra</h3>
            <p class="text-sm text-teal-500 font-medium mb-4">License #198018819</p>
            <div class="space-y-3 text-gray-700">
              <div class="flex items-start gap-3">
                <i class="pi pi-map-marker text-teal-500 mt-0.5"></i>
                <span>2216 S. Fremont Ave. #18<br/>Alhambra, CA 91803</span>
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
            <a
              href="/kawaikids/tour"
              class="inline-flex items-center gap-2 mt-6 bg-teal-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-teal-700 transition-colors text-sm"
              style="font-family: 'Fredoka', sans-serif;"
            >
              <i class="pi pi-calendar"></i>
              Schedule a Tour
            </a>
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

    <!-- Criton AI Phone Agent Section -->
    <section class="py-16 md:py-24 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white relative overflow-hidden">
      <!-- Decorative elements -->
      <div class="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div class="flex items-center gap-3 mb-6">
              <img src="/criton-logo.svg" alt="Criton AI" class="h-10 w-auto" />
              <span class="text-sm font-medium text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full">Powered by CRITON.AI</span>
            </div>
            <h2 class="text-3xl md:text-4xl font-bold mb-6" style="font-family: 'Fredoka', sans-serif;">
              Never Miss a Parent's Call Again
            </h2>
            <p class="text-lg text-purple-200 mb-8 leading-relaxed">
              Our AI phone receptionist answers calls 24/7, provides information about programs and availability,
              and helps parents schedule tours — even when your team is busy caring for kids.
            </p>

            <div class="space-y-4 mb-8">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <i class="pi pi-check text-green-400 text-sm"></i>
                </div>
                <span class="text-purple-100">Answers questions about programs, schedules, and enrollment</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <i class="pi pi-check text-green-400 text-sm"></i>
                </div>
                <span class="text-purple-100">Helps parents book tours and get started</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <i class="pi pi-check text-green-400 text-sm"></i>
                </div>
                <span class="text-purple-100">Available 24/7, even after hours and on weekends</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <i class="pi pi-check text-green-400 text-sm"></i>
                </div>
                <span class="text-purple-100">Natural, friendly voice — parents love it</span>
              </div>
            </div>
          </div>

          <!-- Phone Demo Card -->
          <div class="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 text-center">
            <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
              <i class="pi pi-phone text-3xl text-white"></i>
            </div>
            <h3 class="text-2xl font-bold mb-3" style="font-family: 'Fredoka', sans-serif;">
              Try the AI Receptionist
            </h3>
            <p class="text-purple-200 mb-6">
              Call now to hear exactly how it works for Kawai Kids
            </p>

            <a
              href="tel:+14242839238"
              class="block bg-white text-purple-700 rounded-xl p-6 hover:bg-purple-50 transition-colors mb-4"
            >
              <span class="text-sm text-gray-500 block mb-1">Demo Phone Number</span>
              <span class="text-3xl font-bold tracking-wide" style="font-family: 'Fredoka', sans-serif;">1-424-283-9238</span>
            </a>

            <p class="text-sm text-purple-300">
              <i class="pi pi-info-circle mr-1"></i>
              Free demo call — No signup required
            </p>
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
          Enroll today and join the Kawai Kids family. Flexible schedules, loving staff, and a curriculum designed to help your child thrive.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/kawaikids/enroll"

            class="inline-flex items-center justify-center gap-2 bg-amber-400 text-purple-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-amber-300 transition-all shadow-lg"
            style="font-family: 'Fredoka', sans-serif;"
          >
            Enroll Now
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
              A place where the love of learning begins. Serving families in Montebello and Alhambra since 2007.
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
        <div class="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="text-sm">&copy; {{ new Date().getFullYear() }} Kawai Kids Learning Center. All rights reserved.</p>
          <div class="flex items-center gap-2 text-sm">
            <span>Website powered by</span>
            <a href="/" class="text-purple-400 hover:text-purple-300 font-semibold transition-colors">CRITON.AI</a>
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
