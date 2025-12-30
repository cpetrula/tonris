<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import Divider from 'primevue/divider'
import Tag from 'primevue/tag'

const router = useRouter()
const searchQuery = ref('')

interface CarrierInstructions {
  name: string
  logo?: string
  type: 'wireless' | 'landline' | 'voip'
  forwardAll: {
    activate: string
    deactivate: string
  }
  forwardBusy?: {
    activate: string
    deactivate: string
  }
  forwardNoAnswer?: {
    activate: string
    deactivate: string
  }
  notes?: string[]
  website?: string
}

const carriers: CarrierInstructions[] = [
  // Major Wireless Carriers
  {
    name: 'AT&T',
    type: 'wireless',
    forwardAll: {
      activate: '*21*[forwarding number]#',
      deactivate: '#21#'
    },
    forwardBusy: {
      activate: '*67*[forwarding number]#',
      deactivate: '#67#'
    },
    forwardNoAnswer: {
      activate: '*61*[forwarding number]#',
      deactivate: '#61#'
    },
    notes: [
      'Replace [forwarding number] with your Criton.AI number',
      'You may need to dial the number and press Call',
      'Some plans may incur additional forwarding charges'
    ],
    website: 'https://www.att.com'
  },
  {
    name: 'Verizon',
    type: 'wireless',
    forwardAll: {
      activate: '*72 [forwarding number]',
      deactivate: '*73'
    },
    forwardBusy: {
      activate: '*90 [forwarding number]',
      deactivate: '*91'
    },
    forwardNoAnswer: {
      activate: '*92 [forwarding number]',
      deactivate: '*93'
    },
    notes: [
      'Wait for confirmation tone after dialing',
      'You must stay on the line until you hear the confirmation',
      'Can also be managed in My Verizon app'
    ],
    website: 'https://www.verizon.com'
  },
  {
    name: 'T-Mobile',
    type: 'wireless',
    forwardAll: {
      activate: '**21*[forwarding number]#',
      deactivate: '##21#'
    },
    forwardBusy: {
      activate: '**67*[forwarding number]#',
      deactivate: '##67#'
    },
    forwardNoAnswer: {
      activate: '**61*[forwarding number]#',
      deactivate: '##61#'
    },
    notes: [
      'Can also manage via T-Mobile app or 611',
      'Some One plans include free call forwarding',
      'International forwarding may incur charges'
    ],
    website: 'https://www.t-mobile.com'
  },
  {
    name: 'Sprint (now T-Mobile)',
    type: 'wireless',
    forwardAll: {
      activate: '*72 [forwarding number]',
      deactivate: '*720'
    },
    forwardBusy: {
      activate: '*74 [forwarding number]',
      deactivate: '*740'
    },
    forwardNoAnswer: {
      activate: '*73 [forwarding number]',
      deactivate: '*730'
    },
    notes: [
      'Sprint customers now follow T-Mobile procedures',
      'Legacy Sprint plans may still use these codes',
      'Contact T-Mobile support if codes don\'t work'
    ]
  },
  {
    name: 'US Cellular',
    type: 'wireless',
    forwardAll: {
      activate: '*72 [forwarding number]',
      deactivate: '*73'
    },
    forwardBusy: {
      activate: '*90 [forwarding number]',
      deactivate: '*91'
    },
    notes: [
      'Wait for confirmation beep before hanging up',
      'Can manage via My US Cellular app'
    ],
    website: 'https://www.uscellular.com'
  },
  // MVNOs (Mobile Virtual Network Operators)
  {
    name: 'Mint Mobile',
    type: 'wireless',
    forwardAll: {
      activate: '**21*[forwarding number]#',
      deactivate: '##21#'
    },
    forwardBusy: {
      activate: '**67*[forwarding number]#',
      deactivate: '##67#'
    },
    notes: [
      'Uses T-Mobile network - same codes apply',
      'Manage via Mint Mobile app or account portal'
    ],
    website: 'https://www.mintmobile.com'
  },
  {
    name: 'Visible',
    type: 'wireless',
    forwardAll: {
      activate: '*72 [forwarding number]',
      deactivate: '*73'
    },
    notes: [
      'Uses Verizon network',
      'Can also manage through Visible app'
    ],
    website: 'https://www.visible.com'
  },
  {
    name: 'Cricket Wireless',
    type: 'wireless',
    forwardAll: {
      activate: '*21*[forwarding number]#',
      deactivate: '#21#'
    },
    notes: [
      'Uses AT&T network - same codes apply',
      'Contact Cricket support for assistance'
    ],
    website: 'https://www.cricketwireless.com'
  },
  {
    name: 'Metro by T-Mobile',
    type: 'wireless',
    forwardAll: {
      activate: '**21*[forwarding number]#',
      deactivate: '##21#'
    },
    forwardBusy: {
      activate: '**67*[forwarding number]#',
      deactivate: '##67#'
    },
    notes: [
      'Uses T-Mobile network - same codes apply',
      'Can manage through Metro app or *611'
    ],
    website: 'https://www.metrobyt-mobile.com'
  },
  {
    name: 'Boost Mobile',
    type: 'wireless',
    forwardAll: {
      activate: '*72 [forwarding number]',
      deactivate: '*73'
    },
    notes: [
      'Network varies by region (AT&T or T-Mobile)',
      'Try T-Mobile codes if these don\'t work'
    ],
    website: 'https://www.boostmobile.com'
  },
  {
    name: 'Google Fi',
    type: 'wireless',
    forwardAll: {
      activate: 'Settings > Calls > Call forwarding in Fi app',
      deactivate: 'Toggle off in Fi app'
    },
    notes: [
      'Forwarding is managed through the Google Fi app only',
      'Cannot use star codes on Google Fi',
      'Supports forwarding to any US number'
    ],
    website: 'https://fi.google.com'
  },
  // VoIP Providers
  {
    name: 'Google Voice',
    type: 'voip',
    forwardAll: {
      activate: 'Settings > Calls > Forward calls',
      deactivate: 'Toggle off in settings'
    },
    notes: [
      'Configure in Google Voice web or app',
      'Can forward to multiple phones',
      'Supports Do Not Disturb schedules'
    ],
    website: 'https://voice.google.com'
  },
  {
    name: 'Vonage',
    type: 'voip',
    forwardAll: {
      activate: '*72 [forwarding number]',
      deactivate: '*73'
    },
    notes: [
      'Can also configure via Vonage online portal',
      'Simultaneous ring available',
      'Business plans have more forwarding options'
    ],
    website: 'https://www.vonage.com'
  },
  {
    name: 'Ooma',
    type: 'voip',
    forwardAll: {
      activate: 'Configure in My Ooma portal',
      deactivate: 'Disable in My Ooma portal'
    },
    notes: [
      'Forwarding is configured online only',
      'Premier subscribers have more options',
      'Can set up sequential or simultaneous ring'
    ],
    website: 'https://www.ooma.com'
  },
  {
    name: 'RingCentral',
    type: 'voip',
    forwardAll: {
      activate: 'Admin Portal > Phone System > Call Handling',
      deactivate: 'Disable in Admin Portal'
    },
    notes: [
      'Business VoIP - configure via admin portal',
      'Supports complex call routing rules',
      'Contact your RingCentral admin if needed'
    ],
    website: 'https://www.ringcentral.com'
  },
  {
    name: 'Grasshopper',
    type: 'voip',
    forwardAll: {
      activate: 'Settings > Extensions > Edit > Forwarding',
      deactivate: 'Remove forwarding number'
    },
    notes: [
      'Virtual phone system for small business',
      'Configure in Grasshopper portal or app',
      'Supports multiple extensions'
    ],
    website: 'https://grasshopper.com'
  },
  // Landline / Traditional
  {
    name: 'Spectrum (Charter)',
    type: 'landline',
    forwardAll: {
      activate: '*72 [forwarding number]',
      deactivate: '*73'
    },
    forwardBusy: {
      activate: '*90 [forwarding number]',
      deactivate: '*91'
    },
    notes: [
      'Wait for dial tone, then confirmation tone',
      'Can also manage via Spectrum app',
      'Voice service required'
    ],
    website: 'https://www.spectrum.com'
  },
  {
    name: 'Xfinity (Comcast)',
    type: 'landline',
    forwardAll: {
      activate: '*72 [forwarding number]',
      deactivate: '*73'
    },
    forwardBusy: {
      activate: '*90',
      deactivate: '*91'
    },
    notes: [
      'Xfinity Voice customers only',
      'Can configure in Xfinity app or online',
      'Listen for confirmation tone'
    ],
    website: 'https://www.xfinity.com'
  },
  {
    name: 'Cox',
    type: 'landline',
    forwardAll: {
      activate: '*72 [forwarding number]',
      deactivate: '*73'
    },
    notes: [
      'Cox Voice service required',
      'Can also configure online at cox.com',
      'Wait for confirmation before hanging up'
    ],
    website: 'https://www.cox.com'
  },
  {
    name: 'CenturyLink / Lumen',
    type: 'landline',
    forwardAll: {
      activate: '*72 [forwarding number]',
      deactivate: '*73'
    },
    forwardBusy: {
      activate: '*90 [forwarding number]',
      deactivate: '*91'
    },
    notes: [
      'Traditional landline service',
      'May need to add call forwarding feature to plan',
      'Contact support if codes don\'t work'
    ],
    website: 'https://www.centurylink.com'
  },
  {
    name: 'Frontier',
    type: 'landline',
    forwardAll: {
      activate: '*72 [forwarding number]',
      deactivate: '*73'
    },
    notes: [
      'Standard landline forwarding codes',
      'Feature must be enabled on your account',
      'Call Frontier support to verify availability'
    ],
    website: 'https://frontier.com'
  },
  {
    name: 'Optimum (Altice)',
    type: 'landline',
    forwardAll: {
      activate: '*72 [forwarding number]',
      deactivate: '*73'
    },
    notes: [
      'Optimum Voice customers',
      'Can manage via Optimum app',
      'Wait for confirmation tone'
    ],
    website: 'https://www.optimum.com'
  }
]

const filteredCarriers = computed(() => {
  if (!searchQuery.value) return carriers
  const query = searchQuery.value.toLowerCase()
  return carriers.filter(carrier =>
    carrier.name.toLowerCase().includes(query) ||
    carrier.type.toLowerCase().includes(query)
  )
})

const wirelessCarriers = computed(() =>
  filteredCarriers.value.filter(c => c.type === 'wireless')
)

const voipCarriers = computed(() =>
  filteredCarriers.value.filter(c => c.type === 'voip')
)

const landlineCarriers = computed(() =>
  filteredCarriers.value.filter(c => c.type === 'landline')
)

function getTypeColor(type: string): 'info' | 'success' | 'warn' {
  switch (type) {
    case 'wireless': return 'info'
    case 'voip': return 'success'
    case 'landline': return 'warn'
    default: return 'info'
  }
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <Button
        label="Back"
        icon="pi pi-arrow-left"
        text
        class="mb-4"
        @click="goBack"
      />
      <h1 class="text-2xl font-bold text-gray-900">Phone Forwarding Instructions</h1>
      <p class="text-gray-600 mt-2">
        Set up call forwarding from your business phone to your Criton.AI number so our AI receptionist can handle your calls.
      </p>
    </div>

    <!-- Quick Setup Card -->
    <Card class="mb-6 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
      <template #content>
        <div class="flex items-start gap-4">
          <div class="bg-violet-100 p-3 rounded-lg">
            <i class="pi pi-info-circle text-2xl text-violet-600"></i>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 mb-2">Quick Setup</h3>
            <ol class="list-decimal list-inside space-y-2 text-gray-700">
              <li>Find your carrier below and note the activation code</li>
              <li>Replace <code class="bg-violet-100 px-2 py-1 rounded text-violet-800">[forwarding number]</code> with your Criton.AI number</li>
              <li>Dial the code on your business phone</li>
              <li>Wait for the confirmation tone or message</li>
              <li>Test by calling your business line from another phone</li>
            </ol>
          </div>
        </div>
      </template>
    </Card>

    <!-- Search -->
    <div class="mb-6">
      <div class="relative">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <InputText
          v-model="searchQuery"
          placeholder="Search for your carrier..."
          class="w-full pl-10"
        />
      </div>
    </div>

    <!-- Wireless Carriers -->
    <div v-if="wirelessCarriers.length > 0" class="mb-8">
      <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <i class="pi pi-mobile text-blue-500"></i>
        Wireless Carriers
      </h2>
      <Card>
        <template #content>
          <Accordion>
            <AccordionPanel
              v-for="carrier in wirelessCarriers"
              :key="carrier.name"
              :value="carrier.name"
            >
              <AccordionHeader>
                <div class="flex items-center gap-3">
                  <span class="font-medium">{{ carrier.name }}</span>
                  <Tag :value="carrier.type" :severity="getTypeColor(carrier.type)" />
                </div>
              </AccordionHeader>
              <AccordionContent>
                <div class="space-y-4">
                  <!-- Forward All Calls -->
                  <div>
                    <h4 class="font-medium text-gray-900 mb-2">Forward All Calls</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div class="bg-green-50 p-3 rounded-lg">
                        <p class="text-xs text-green-600 font-medium mb-1">ACTIVATE</p>
                        <code class="text-green-800">{{ carrier.forwardAll.activate }}</code>
                      </div>
                      <div class="bg-red-50 p-3 rounded-lg">
                        <p class="text-xs text-red-600 font-medium mb-1">DEACTIVATE</p>
                        <code class="text-red-800">{{ carrier.forwardAll.deactivate }}</code>
                      </div>
                    </div>
                  </div>

                  <!-- Forward When Busy -->
                  <div v-if="carrier.forwardBusy">
                    <Divider />
                    <h4 class="font-medium text-gray-900 mb-2">Forward When Busy</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div class="bg-green-50 p-3 rounded-lg">
                        <p class="text-xs text-green-600 font-medium mb-1">ACTIVATE</p>
                        <code class="text-green-800">{{ carrier.forwardBusy.activate }}</code>
                      </div>
                      <div class="bg-red-50 p-3 rounded-lg">
                        <p class="text-xs text-red-600 font-medium mb-1">DEACTIVATE</p>
                        <code class="text-red-800">{{ carrier.forwardBusy.deactivate }}</code>
                      </div>
                    </div>
                  </div>

                  <!-- Forward When No Answer -->
                  <div v-if="carrier.forwardNoAnswer">
                    <Divider />
                    <h4 class="font-medium text-gray-900 mb-2">Forward When No Answer</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div class="bg-green-50 p-3 rounded-lg">
                        <p class="text-xs text-green-600 font-medium mb-1">ACTIVATE</p>
                        <code class="text-green-800">{{ carrier.forwardNoAnswer.activate }}</code>
                      </div>
                      <div class="bg-red-50 p-3 rounded-lg">
                        <p class="text-xs text-red-600 font-medium mb-1">DEACTIVATE</p>
                        <code class="text-red-800">{{ carrier.forwardNoAnswer.deactivate }}</code>
                      </div>
                    </div>
                  </div>

                  <!-- Notes -->
                  <div v-if="carrier.notes && carrier.notes.length > 0">
                    <Divider />
                    <h4 class="font-medium text-gray-900 mb-2">Notes</h4>
                    <ul class="list-disc list-inside space-y-1 text-gray-600">
                      <li v-for="note in carrier.notes" :key="note">{{ note }}</li>
                    </ul>
                  </div>

                  <!-- Website -->
                  <div v-if="carrier.website">
                    <a
                      :href="carrier.website"
                      target="_blank"
                      class="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800"
                    >
                      <i class="pi pi-external-link"></i>
                      Visit {{ carrier.name }} website
                    </a>
                  </div>
                </div>
              </AccordionContent>
            </AccordionPanel>
          </Accordion>
        </template>
      </Card>
    </div>

    <!-- VoIP Providers -->
    <div v-if="voipCarriers.length > 0" class="mb-8">
      <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <i class="pi pi-globe text-green-500"></i>
        VoIP Providers
      </h2>
      <Card>
        <template #content>
          <Accordion>
            <AccordionPanel
              v-for="carrier in voipCarriers"
              :key="carrier.name"
              :value="carrier.name"
            >
              <AccordionHeader>
                <div class="flex items-center gap-3">
                  <span class="font-medium">{{ carrier.name }}</span>
                  <Tag :value="carrier.type" :severity="getTypeColor(carrier.type)" />
                </div>
              </AccordionHeader>
              <AccordionContent>
                <div class="space-y-4">
                  <div>
                    <h4 class="font-medium text-gray-900 mb-2">Forward All Calls</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div class="bg-green-50 p-3 rounded-lg">
                        <p class="text-xs text-green-600 font-medium mb-1">ACTIVATE</p>
                        <code class="text-green-800">{{ carrier.forwardAll.activate }}</code>
                      </div>
                      <div class="bg-red-50 p-3 rounded-lg">
                        <p class="text-xs text-red-600 font-medium mb-1">DEACTIVATE</p>
                        <code class="text-red-800">{{ carrier.forwardAll.deactivate }}</code>
                      </div>
                    </div>
                  </div>

                  <div v-if="carrier.notes && carrier.notes.length > 0">
                    <Divider />
                    <h4 class="font-medium text-gray-900 mb-2">Notes</h4>
                    <ul class="list-disc list-inside space-y-1 text-gray-600">
                      <li v-for="note in carrier.notes" :key="note">{{ note }}</li>
                    </ul>
                  </div>

                  <div v-if="carrier.website">
                    <a
                      :href="carrier.website"
                      target="_blank"
                      class="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800"
                    >
                      <i class="pi pi-external-link"></i>
                      Visit {{ carrier.name }} website
                    </a>
                  </div>
                </div>
              </AccordionContent>
            </AccordionPanel>
          </Accordion>
        </template>
      </Card>
    </div>

    <!-- Landline Providers -->
    <div v-if="landlineCarriers.length > 0" class="mb-8">
      <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <i class="pi pi-phone text-orange-500"></i>
        Landline / Cable Providers
      </h2>
      <Card>
        <template #content>
          <Accordion>
            <AccordionPanel
              v-for="carrier in landlineCarriers"
              :key="carrier.name"
              :value="carrier.name"
            >
              <AccordionHeader>
                <div class="flex items-center gap-3">
                  <span class="font-medium">{{ carrier.name }}</span>
                  <Tag :value="carrier.type" :severity="getTypeColor(carrier.type)" />
                </div>
              </AccordionHeader>
              <AccordionContent>
                <div class="space-y-4">
                  <div>
                    <h4 class="font-medium text-gray-900 mb-2">Forward All Calls</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div class="bg-green-50 p-3 rounded-lg">
                        <p class="text-xs text-green-600 font-medium mb-1">ACTIVATE</p>
                        <code class="text-green-800">{{ carrier.forwardAll.activate }}</code>
                      </div>
                      <div class="bg-red-50 p-3 rounded-lg">
                        <p class="text-xs text-red-600 font-medium mb-1">DEACTIVATE</p>
                        <code class="text-red-800">{{ carrier.forwardAll.deactivate }}</code>
                      </div>
                    </div>
                  </div>

                  <div v-if="carrier.forwardBusy">
                    <Divider />
                    <h4 class="font-medium text-gray-900 mb-2">Forward When Busy</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div class="bg-green-50 p-3 rounded-lg">
                        <p class="text-xs text-green-600 font-medium mb-1">ACTIVATE</p>
                        <code class="text-green-800">{{ carrier.forwardBusy.activate }}</code>
                      </div>
                      <div class="bg-red-50 p-3 rounded-lg">
                        <p class="text-xs text-red-600 font-medium mb-1">DEACTIVATE</p>
                        <code class="text-red-800">{{ carrier.forwardBusy.deactivate }}</code>
                      </div>
                    </div>
                  </div>

                  <div v-if="carrier.notes && carrier.notes.length > 0">
                    <Divider />
                    <h4 class="font-medium text-gray-900 mb-2">Notes</h4>
                    <ul class="list-disc list-inside space-y-1 text-gray-600">
                      <li v-for="note in carrier.notes" :key="note">{{ note }}</li>
                    </ul>
                  </div>

                  <div v-if="carrier.website">
                    <a
                      :href="carrier.website"
                      target="_blank"
                      class="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800"
                    >
                      <i class="pi pi-external-link"></i>
                      Visit {{ carrier.name }} website
                    </a>
                  </div>
                </div>
              </AccordionContent>
            </AccordionPanel>
          </Accordion>
        </template>
      </Card>
    </div>

    <!-- No Results -->
    <div v-if="filteredCarriers.length === 0" class="text-center py-12">
      <i class="pi pi-search text-4xl text-gray-300 mb-4"></i>
      <p class="text-gray-600">No carriers found matching "{{ searchQuery }}"</p>
      <p class="text-gray-500 text-sm mt-2">
        Try a different search term or <a href="#" class="text-violet-600" @click.prevent="searchQuery = ''">clear the search</a>
      </p>
    </div>

    <!-- Help Card -->
    <Card class="bg-gray-50 border-gray-200">
      <template #content>
        <div class="flex items-start gap-4">
          <div class="bg-gray-200 p-3 rounded-lg">
            <i class="pi pi-question-circle text-2xl text-gray-600"></i>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 mb-2">Don't see your carrier?</h3>
            <p class="text-gray-600 mb-3">
              Most carriers use standard codes. Try <code class="bg-gray-200 px-2 py-1 rounded">*72</code> to forward
              and <code class="bg-gray-200 px-2 py-1 rounded">*73</code> to deactivate. If that doesn't work,
              contact your carrier's customer support for specific instructions.
            </p>
            <Button
              label="Contact Criton.AI Support"
              icon="pi pi-envelope"
              outlined
              size="small"
              @click="router.push('/app/settings')"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>
