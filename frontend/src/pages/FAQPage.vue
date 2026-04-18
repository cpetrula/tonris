<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ref } from 'vue'

interface FAQItem {
  question: string
  answer: string
}

interface FAQCategory {
  title: string
  icon: string
  faqs: FAQItem[]
}

const faqCategories: FAQCategory[] = [
  {
    title: 'Working With Us',
    icon: 'pi pi-handshake',
    faqs: [
      {
        question: 'What kind of projects does Criton.ai take on?',
        answer: 'We build custom AI-powered platforms for businesses — from AI voice agents and phone systems to video generation pipelines, workflow automation dashboards, and social media tools. If it involves AI and your business needs it, we can build it.'
      },
      {
        question: 'How does a project typically start?',
        answer: 'It starts with a conversation. You tell us what's slowing your business down, and we scope out how AI can solve it. From there, we design the system, build it, and get it running — usually within weeks, not months.'
      },
      {
        question: 'Do you work with small businesses or just enterprise?',
        answer: 'Both. Our clients range from indie film productions to car dealerships. What matters isn't size — it's whether AI can meaningfully improve how you operate.'
      },
      {
        question: 'What industries do you work in?',
        answer: 'We've built platforms for film and television production, automotive marketing, childcare, and professional services. Our approach is industry-specific — we learn how your business actually works before we build anything.'
      }
    ]
  },
  {
    title: 'Our Technology',
    icon: 'pi pi-cog',
    faqs: [
      {
        question: 'What AI technologies do you use?',
        answer: 'We work with the best tools for each job — OpenAI (GPT, Sora, DALL-E), ElevenLabs for voice synthesis, Twilio for telephony, and custom integrations as needed. We're not locked into one vendor.'
      },
      {
        question: 'Do you build from scratch or use templates?',
        answer: 'From scratch. Every platform we build is custom-designed for the client's specific workflow. We don't reskin templates — we architect systems around how your team actually works.'
      },
      {
        question: 'Can you integrate with our existing tools?',
        answer: 'Yes. We regularly integrate with existing phone systems, CRMs, social media accounts, calendars, and cloud storage. If it has an API, we can connect to it.'
      },
      {
        question: 'Do you handle hosting and maintenance?',
        answer: 'Yes. We deploy, monitor, and maintain the platforms we build. You don't need your own engineering team to keep things running.'
      }
    ]
  },
  {
    title: 'Process & Timeline',
    icon: 'pi pi-clock',
    faqs: [
      {
        question: 'How long does a typical project take?',
        answer: 'It depends on scope. A focused tool like an AI phone system can be live in 2–3 weeks. A full platform with multiple modules typically takes 6–10 weeks. We'll give you a realistic timeline upfront.'
      },
      {
        question: 'What does the development process look like?',
        answer: 'Discovery call → scope & proposal → design & architecture → iterative build with regular check-ins → deployment → ongoing support. You're involved at every stage.'
      },
      {
        question: 'Do you offer ongoing support after launch?',
        answer: 'Absolutely. We provide ongoing maintenance, feature updates, and support. The platforms we build are living systems that evolve with your business.'
      }
    ]
  },
  {
    title: 'Pricing & Engagement',
    icon: 'pi pi-briefcase',
    faqs: [
      {
        question: 'How is pricing structured?',
        answer: 'We price per project based on scope, complexity, and timeline. No per-seat fees, no surprise charges. We'll give you a clear proposal before any work begins.'
      },
      {
        question: 'Is there a minimum project size?',
        answer: 'We don't have a hard minimum, but our sweet spot is projects where AI can create real operational impact — not just a chatbot on a website. Reach out and we'll tell you honestly if we're the right fit.'
      },
      {
        question: 'Do you do retainer or ongoing engagements?',
        answer: 'Yes. Many clients start with a project and move to a retainer for ongoing development, new features, and support. We're flexible.'
      }
    ]
  },
  {
    title: 'Security & Privacy',
    icon: 'pi pi-shield',
    faqs: [
      {
        question: 'How do you handle data security?',
        answer: 'All platforms we build use encryption at rest and in transit, role-based access control, and industry-standard security practices. We take data isolation seriously — your data stays yours.'
      },
      {
        question: 'Are your platforms compliant with industry regulations?',
        answer: 'We build with compliance in mind. For example, our production office platform handles SAG-AFTRA compliance, and we support e-signatures and audit trails. We'll work with you to meet your industry's requirements.'
      }
    ]
  }
]

// Track open panels per category
const openPanels = ref<Record<number, number | null>>({})

function togglePanel(categoryIndex: number, faqIndex: number) {
  if (openPanels.value[categoryIndex] === faqIndex) {
    openPanels.value[categoryIndex] = null
  } else {
    openPanels.value[categoryIndex] = faqIndex
  }
}
</script>

<template>
  <div class="bg-[color:var(--criton-bg)] text-[color:var(--criton-text)]">
    <!-- HERO -->
    <section class="criton-hero-bg relative overflow-hidden">
      <div class="max-w-6xl mx-auto px-6 lg:px-8 pt-28 pb-16 md:pt-36 md:pb-20 text-center">
        <div class="criton-pill mb-8">Questions & Answers</div>
        <h1
          class="font-display font-bold text-4xl md:text-6xl lg:text-7xl leading-[1.08] tracking-tight mb-7 max-w-4xl mx-auto"
        >
          Frequently Asked<br />
          <span class="italic criton-accent">Questions</span>
        </h1>
        <p
          class="text-lg md:text-xl text-[color:var(--criton-text-muted)] max-w-2xl mx-auto leading-relaxed"
        >
          Everything you need to know about working with Criton.ai. Can't find the answer you're looking for? Feel free to contact us.
        </p>
      </div>
    </section>

    <!-- FAQ CATEGORIES -->
    <section class="py-16 md:py-24 border-t border-[color:var(--criton-border)]">
      <div class="max-w-4xl mx-auto px-6 lg:px-8">
        <div class="space-y-8">
          <div
            v-for="(category, categoryIndex) in faqCategories"
            :key="category.title"
            class="criton-card rounded-xl overflow-hidden"
          >
            <!-- Category Header -->
            <div class="flex items-center gap-3 p-6 border-b border-[color:var(--criton-border)]">
              <div class="w-10 h-10 bg-[color:var(--criton-surface-2)] border border-[color:var(--criton-border)] rounded-lg flex items-center justify-center">
                <i :class="[category.icon, 'text-[color:var(--criton-gold)]']"></i>
              </div>
              <h2 class="font-display text-xl font-bold text-[color:var(--criton-ivory)]">{{ category.title }}</h2>
            </div>

            <!-- FAQ Items -->
            <div>
              <div
                v-for="(faq, faqIndex) in category.faqs"
                :key="faqIndex"
                class="border-b border-[color:var(--criton-border)] last:border-b-0"
              >
                <button
                  @click="togglePanel(categoryIndex, faqIndex)"
                  class="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-[color:var(--criton-surface-2)] transition-colors"
                >
                  <span class="font-medium text-[color:var(--criton-text)] pr-4">{{ faq.question }}</span>
                  <i
                    :class="[
                      'pi text-[color:var(--criton-gold)] transition-transform',
                      openPanels[categoryIndex] === faqIndex ? 'pi-minus' : 'pi-plus'
                    ]"
                  ></i>
                </button>
                <div
                  v-if="openPanels[categoryIndex] === faqIndex"
                  class="px-6 pb-5"
                >
                  <p class="text-[color:var(--criton-text-muted)] leading-relaxed">{{ faq.answer }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- STILL HAVE QUESTIONS -->
    <section class="py-16 md:py-24 border-t border-[color:var(--criton-border)] bg-[color:var(--criton-surface)]">
      <div class="max-w-4xl mx-auto px-6 lg:px-8">
        <div class="criton-card rounded-xl p-10 md:p-12 text-center">
          <div class="w-16 h-16 mx-auto mb-6 bg-[color:var(--criton-surface-2)] border border-[color:var(--criton-border)] rounded-full flex items-center justify-center">
            <i class="pi pi-comments text-3xl text-[color:var(--criton-gold)]"></i>
          </div>
          <h2 class="font-display text-2xl font-bold text-[color:var(--criton-ivory)] mb-6">
            Still have questions?
          </h2>
          <p class="text-[color:var(--criton-text-muted)] mb-2">
            Phone: <a href="tel:+18185316200" class="text-[color:var(--criton-gold)] hover:text-[color:var(--criton-gold-bright)] transition-colors">(818) 531-6200</a>
          </p>
          <p class="text-[color:var(--criton-text-muted)] mb-8">
            Email: <a href="mailto:info@criton.ai" class="text-[color:var(--criton-gold)] hover:text-[color:var(--criton-gold-bright)] transition-colors">info@criton.ai</a>
          </p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <RouterLink to="/contact" class="criton-btn-primary">
              Contact Us
              <i class="pi pi-send text-xs"></i>
            </RouterLink>
            <a href="mailto:info@criton.ai" class="criton-btn-ghost">
              <i class="pi pi-envelope text-xs"></i>
              Email Us
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="relative overflow-hidden border-t border-[color:var(--criton-border)]">
      <div class="criton-hero-bg absolute inset-0 opacity-60"></div>
      <div class="relative max-w-4xl mx-auto px-6 lg:px-8 py-24 md:py-32 text-center">
        <h2 class="font-display font-bold text-3xl md:text-5xl leading-tight mb-6">
          Ready to<br />
          <span class="italic criton-accent">talk?</span>
        </h2>
        <p class="text-lg text-[color:var(--criton-text-muted)] max-w-xl mx-auto mb-10">
          Tell us about your business. We'll tell you what AI can do for it.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <RouterLink to="/contact" class="criton-btn-primary">
            Get in Touch
            <i class="pi pi-arrow-right text-xs"></i>
          </RouterLink>
          <RouterLink to="/work" class="criton-btn-ghost">
            See Our Work
            <i class="pi pi-arrow-right text-xs"></i>
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>
