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
    title: 'Getting Started',
    icon: 'pi pi-play',
    faqs: [
      {
        question: 'How long does it take to set up CRITON.AI?',
        answer: 'Most businesses are up and running within 10-15 minutes. Simply create your account, enter your business details, and forward your phone number. Our setup wizard guides you through each step.'
      },
      {
        question: 'Do I need any technical knowledge to use CRITON.AI?',
        answer: 'Not at all! CRITON.AI is designed to be simple and intuitive. If you can forward a phone call, you can use CRITON.AI. We provide step-by-step instructions for setting up call forwarding with all major phone carriers.'
      },
      {
        question: 'Can I keep my existing business phone number?',
        answer: 'Yes! You keep your existing phone number. You simply forward calls from your current number to your new CRITON.AI number. Your customers will never know the difference.'
      },
      {
        question: 'Is there a free trial?',
        answer: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required to start. You can cancel anytime during the trial period.'
      }
    ]
  },
  {
    title: 'Features & Capabilities',
    icon: 'pi pi-cog',
    faqs: [
      {
        question: 'What can the AI assistant do?',
        answer: 'Our AI assistant can answer common questions about your business, provide information about your services and pricing, schedule appointments, take messages, and transfer urgent calls. It handles natural conversations just like a human receptionist.'
      },
      {
        question: 'Can the AI book appointments?',
        answer: 'Absolutely! The AI integrates with Google Calendar, Outlook, and other popular calendar apps. When a customer requests an appointment, the AI checks your availability in real-time and books directly into your calendar.'
      },
      {
        question: 'What happens if a caller has a complex question?',
        answer: 'For questions the AI cannot answer, it offers to take a message or transfer the call to you directly. You can also set up custom responses for specific questions unique to your business.'
      },
      {
        question: 'Can I customize how the AI greets callers?',
        answer: 'Yes! You can fully customize the greeting, the AI voice, the information it provides, and how it handles different types of calls. You can even set different greetings for business hours vs. after hours.'
      },
      {
        question: 'Does CRITON.AI support multiple languages?',
        answer: 'Currently, CRITON.AI supports English and Spanish. The AI can automatically detect the language the caller is speaking and respond appropriately. More languages are coming soon.'
      }
    ]
  },
  {
    title: 'Pricing & Billing',
    icon: 'pi pi-dollar',
    faqs: [
      {
        question: 'How much does CRITON.AI cost?',
        answer: 'CRITON.AI offers two plans: Monthly at $99/month or Yearly at $79/month (billed annually, saving you $240/year). Both plans include unlimited calls, 24/7 coverage, appointment booking, and all core features.'
      },
      {
        question: 'Are there any per-minute or per-call charges?',
        answer: 'No! Your subscription includes unlimited incoming calls. There are no hidden fees, no per-minute charges, and no limits on call duration. What you see is what you pay.'
      },
      {
        question: 'Can I cancel anytime?',
        answer: 'Yes, you can cancel your subscription at any time. If you cancel, you will retain access until the end of your current billing period. We do not offer partial refunds for unused time.'
      },
      {
        question: 'Do you offer refunds?',
        answer: 'We offer a 14-day free trial so you can test CRITON.AI risk-free. After the trial, we do not offer refunds, but you can cancel at any time to prevent future charges.'
      }
    ]
  },
  {
    title: 'Technical & Security',
    icon: 'pi pi-shield',
    faqs: [
      {
        question: 'Is my data secure?',
        answer: 'Yes, security is our top priority. All calls are encrypted, and we use bank-level security for all data storage. We are compliant with industry standards and never share your data with third parties.'
      },
      {
        question: 'Are calls recorded?',
        answer: 'Yes, calls can be recorded for your records. Recordings are stored securely and only accessible by you. You can enable or disable call recording in your settings. All recordings comply with applicable laws.'
      },
      {
        question: 'What happens if the internet goes down?',
        answer: 'CRITON.AI runs in the cloud with multiple redundant systems. We maintain 99.9% uptime. If our systems detect an issue, calls can automatically forward to a backup number you specify.'
      },
      {
        question: 'Can I integrate CRITON.AI with my CRM or other tools?',
        answer: 'We integrate with Google Calendar, Outlook, Slack, and can send notifications via email or SMS. Additional integrations including Zapier and API access are available on our Enterprise plan.'
      }
    ]
  },
  {
    title: 'Support & Help',
    icon: 'pi pi-question-circle',
    faqs: [
      {
        question: 'How do I get help if I have issues?',
        answer: 'We offer multiple support channels: email support for all customers, live chat during business hours, and phone support for yearly subscribers. Most issues are resolved within 24 hours.'
      },
      {
        question: 'Do you offer onboarding assistance?',
        answer: 'Yes! All new customers receive a welcome email with video tutorials and a detailed setup guide. Yearly subscribers also get a complimentary onboarding call with our team.'
      },
      {
        question: 'Can I switch between monthly and yearly plans?',
        answer: 'Yes, you can upgrade from monthly to yearly at any time and receive prorated credit for your remaining monthly subscription. Contact support to make the switch.'
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
          Everything you need to know about CRITON.AI. Can't find the answer you're looking for? Feel free to contact us.
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
                  <span class="font-medium text-gray-900">{{ faq.question }}</span>
                </AccordionHeader>
                <AccordionContent>
                  <p class="text-gray-600 leading-relaxed">{{ faq.answer }}</p>
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
          <p class="text-gray-600 mb-8 max-w-xl mx-auto">
            Can't find the answer you're looking for? Our friendly team is here to help. Reach out and we'll get back to you as soon as possible.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:support@criton.ai">
              <Button
                label="Email Support"
                icon="pi pi-envelope"
                severity="secondary"
                outlined
                class="px-6"
              />
            </a>
            <a href="tel:18008667471">
              <Button
                label="Call Our Demo Line"
                icon="pi pi-phone"
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
          Ready to Get Started?
        </h2>
        <p class="text-lg text-violet-100 mb-8 max-w-2xl mx-auto">
          Try CRITON.AI free for 14 days. No credit card required.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <RouterLink to="/signup">
            <Button
              label="Start Free Trial"
              icon="pi pi-arrow-right"
              icon-pos="right"
              size="large"
              class="px-8 py-3 !bg-white !text-violet-600 hover:!bg-violet-50"
            />
          </RouterLink>
          <RouterLink to="/how-it-works">
            <Button
              label="See How It Works"
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
