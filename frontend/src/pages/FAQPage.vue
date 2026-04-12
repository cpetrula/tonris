<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Button from 'primevue/button'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'

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
        answer: 'We build custom AI-powered platforms for businesses \u2014 from AI voice agents and phone systems to video generation pipelines, workflow automation dashboards, and social media tools. If it involves AI and your business needs it, we can build it.'
      },
      {
        question: 'How does a project typically start?',
        answer: 'It starts with a conversation. You tell us what\u2019s slowing your business down, and we scope out how AI can solve it. From there, we design the system, build it, and get it running \u2014 usually within weeks, not months.'
      },
      {
        question: 'Do you work with small businesses or just enterprise?',
        answer: 'Both. Our clients range from indie film productions to car dealerships. What matters isn\u2019t size \u2014 it\u2019s whether AI can meaningfully improve how you operate.'
      },
      {
        question: 'What industries do you work in?',
        answer: 'We\u2019ve built platforms for film and television production, automotive marketing, childcare, and professional services. Our approach is industry-specific \u2014 we learn how your business actually works before we build anything.'
      }
    ]
  },
  {
    title: 'Our Technology',
    icon: 'pi pi-cog',
    faqs: [
      {
        question: 'What AI technologies do you use?',
        answer: 'We work with the best tools for each job \u2014 OpenAI (GPT, Sora, DALL-E), ElevenLabs for voice synthesis, Twilio for telephony, and custom integrations as needed. We\u2019re not locked into one vendor.'
      },
      {
        question: 'Do you build from scratch or use templates?',
        answer: 'From scratch. Every platform we build is custom-designed for the client\u2019s specific workflow. We don\u2019t reskin templates \u2014 we architect systems around how your team actually works.'
      },
      {
        question: 'Can you integrate with our existing tools?',
        answer: 'Yes. We regularly integrate with existing phone systems, CRMs, social media accounts, calendars, and cloud storage. If it has an API, we can connect to it.'
      },
      {
        question: 'Do you handle hosting and maintenance?',
        answer: 'Yes. We deploy, monitor, and maintain the platforms we build. You don\u2019t need your own engineering team to keep things running.'
      }
    ]
  },
  {
    title: 'Process & Timeline',
    icon: 'pi pi-clock',
    faqs: [
      {
        question: 'How long does a typical project take?',
        answer: 'It depends on scope. A focused tool like an AI phone system can be live in 2\u20133 weeks. A full platform with multiple modules typically takes 6\u201310 weeks. We\u2019ll give you a realistic timeline upfront.'
      },
      {
        question: 'What does the development process look like?',
        answer: 'Discovery call \u2192 scope & proposal \u2192 design & architecture \u2192 iterative build with regular check-ins \u2192 deployment \u2192 ongoing support. You\u2019re involved at every stage.'
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
        answer: 'We price per project based on scope, complexity, and timeline. No per-seat fees, no surprise charges. We\u2019ll give you a clear proposal before any work begins.'
      },
      {
        question: 'Is there a minimum project size?',
        answer: 'We don\u2019t have a hard minimum, but our sweet spot is projects where AI can create real operational impact \u2014 not just a chatbot on a website. Reach out and we\u2019ll tell you honestly if we\u2019re the right fit.'
      },
      {
        question: 'Do you do retainer or ongoing engagements?',
        answer: 'Yes. Many clients start with a project and move to a retainer for ongoing development, new features, and support. We\u2019re flexible.'
      }
    ]
  },
  {
    title: 'Security & Privacy',
    icon: 'pi pi-shield',
    faqs: [
      {
        question: 'How do you handle data security?',
        answer: 'All platforms we build use encryption at rest and in transit, role-based access control, and industry-standard security practices. We take data isolation seriously \u2014 your data stays yours.'
      },
      {
        question: 'Are your platforms compliant with industry regulations?',
        answer: 'We build with compliance in mind. For example, our production office platform handles SAG-AFTRA compliance, and we support e-signatures and audit trails. We\u2019ll work with you to meet your industry\u2019s requirements.'
      }
    ]
  }
]
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white py-16 md:py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-6">
          Frequently Asked Questions
        </h1>
        <p class="text-xl text-violet-100 mb-8 max-w-3xl mx-auto">
          Everything you need to know about working with Criton.ai. Can't find the answer you're looking for? Feel free to contact us.
        </p>
      </div>
    </section>

    <!-- FAQ Categories -->
    <section class="py-16 md:py-20 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="space-y-8">
          <div
            v-for="(category, categoryIndex) in faqCategories"
            :key="category.title"
            class="bg-gray-50 rounded-xl p-6"
          >
            <!-- Category Header -->
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <i :class="[category.icon, 'text-violet-600']"></i>
              </div>
              <h2 class="text-xl font-bold text-gray-900">{{ category.title }}</h2>
            </div>

            <!-- FAQ Accordion -->
            <Accordion :value="categoryIndex === 0 ? ['0'] : []" multiple>
              <AccordionPanel
                v-for="(faq, faqIndex) in category.faqs"
                :key="faqIndex"
                :value="String(faqIndex)"
              >
                <AccordionHeader>
                  <span class="font-medium text-white-900">{{ faq.question }}</span>
                </AccordionHeader>
                <AccordionContent>
                  <p class="text-white-600 leading-relaxed">{{ faq.answer }}</p>
                </AccordionContent>
              </AccordionPanel>
            </Accordion>
          </div>
        </div>
      </div>
    </section>

    <!-- Still Have Questions Section -->
    <section class="py-16 md:py-20 bg-gray-50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
          <div class="w-16 h-16 mx-auto mb-6 bg-violet-100 rounded-full flex items-center justify-center">
            <i class="pi pi-comments text-3xl text-violet-600"></i>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h2>
          <p class="text-gray-600 mb-2">
            Phone: <a href="tel:+18185316200" class="text-violet-600 hover:underline">(818) 531-6200</a>
          </p>
          <p class="text-gray-600 mb-8">
            Email: <a href="mailto:info@criton.ai" class="text-violet-600 hover:underline">info@criton.ai</a>
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <RouterLink to="/contact">
              <Button
                label="Contact Us"
                icon="pi pi-send"
                class="px-6"
              />
            </RouterLink>
            <a href="mailto:info@criton.ai">
              <Button
                label="Email Us"
                icon="pi pi-envelope"
                severity="secondary"
                outlined
                class="px-6"
              />
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 md:py-20 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">
          Ready to Talk?
        </h2>
        <p class="text-lg text-violet-100 mb-8 max-w-2xl mx-auto">
          Tell us about your business. We'll tell you what AI can do for it.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <RouterLink to="/contact">
            <Button
              label="Get in Touch"
              icon="pi pi-arrow-right"
              icon-pos="right"
              size="large"
              class="px-8 py-3 !bg-white !text-violet-600 hover:!bg-violet-50"
            />
          </RouterLink>
          <RouterLink to="/work">
            <Button
              label="See Our Work"
              severity="secondary"
              outlined
              size="large"
              class="px-8 py-3 !text-white !border-white hover:!bg-white/10"
            />
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>
