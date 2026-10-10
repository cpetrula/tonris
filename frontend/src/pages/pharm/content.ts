// Shared copy and helpers for the private Pharmavite pitch pages (/pharm, /pharm2, /pharm3).
// Facts about Criton come from claims already published on criton.ai. Ideas for Pharmavite
// are labeled as ideas — no invented clients, numbers, or quotes.
import { onMounted } from 'vue'

export const contact = {
  email: 'info@criton.ai',
  mailto: 'mailto:info@criton.ai?subject=Pharmavite%20%C3%97%20Criton',
  phone: '(805) 300-1857',
  tel: 'tel:+18053001857'
}

export const hero = {
  eyebrow: 'AI Studio · Los Angeles',
  lede:
    'Criton is an AI studio. We design, build, and ship production AI — voice agents, internal copilots, and custom platforms — for teams that want to own what gets built, not rent it.'
}

// Each stat restates a claim from criton.ai.
export const proof = [
  { value: 'Week 2', label: 'Clickable prototype in your hands' },
  { value: 'Weekly', label: 'Releases to a live staging environment' },
  { value: '70+', label: 'Languages our voice agents answer calls in' },
  { value: '1 team', label: 'Design, build, deploy, and run — one contract' }
]
export const proofFootnote = 'Commitments and capabilities as published on criton.ai.'

export const capabilities = [
  {
    title: 'Production AI agents',
    description:
      'Agents that do one job well inside a real workflow, with logging, human review, and a clear owner.'
  },
  {
    title: 'Voice AI & telephony',
    description:
      'Phone agents that answer real calls, book appointments, and route to people when it matters.'
  },
  {
    title: 'Custom platforms',
    description:
      'Full-stack web products built around your operations — database, API, frontend, and deployment.'
  },
  {
    title: 'Native mobile apps',
    description: 'iOS and Android from a single codebase, shipped to the App Store and Play Store.'
  }
]

export const ideasNote =
  "These ideas come from public information about Pharmavite. We haven't discussed them with your team — they're starting points for a conversation."

export const ideas = [
  {
    tag: 'Operations',
    title: 'SOP and training copilot for plant teams',
    problem: 'New team members need fast, correct answers from approved procedures.',
    approach:
      'An assistant that answers only from approved SOPs and cites the document and version it used.',
    measure: 'Time to answer, questions escalated, and answers traced to source.'
  },
  {
    tag: 'Quality',
    title: 'Label-claim and supplier-document checks',
    problem: 'Label copy and incoming supplier documents must match approved specifications.',
    approach:
      'A checker that compares documents against specs and flags every mismatch for a human reviewer.',
    measure: 'Review hours saved and mismatches caught before release.'
  },
  {
    tag: 'Consumer care',
    title: 'Support agent grounded in product labels',
    problem: 'Consumers ask the same product questions across brands, by phone and chat.',
    approach:
      'A voice or chat agent that answers from label data and hands any health concern to a person immediately.',
    measure: 'Contacts resolved, handoff accuracy, and wait time.'
  },
  {
    tag: 'Commercial',
    title: 'Retail data assistant',
    problem: 'Sales data arrives from many retailer portals in many formats.',
    approach: 'A tool that pulls retailer exports into one view and flags out-of-stocks early.',
    measure: 'Hours spent on reporting and out-of-stocks caught.'
  }
]

export const process = [
  {
    num: '01',
    title: 'Discover',
    description: 'We map one workflow, its users, and the point where AI can actually help.'
  },
  {
    num: '02',
    title: 'Prototype',
    description: 'A clickable prototype by week two. Fast feedback, no big reveal.'
  },
  {
    num: '03',
    title: 'Build',
    description: 'Weekly releases to a live staging environment you can use the whole time.'
  },
  {
    num: '04',
    title: 'Ship & hand off',
    description:
      'We deploy with logging and an audit trail, then run it or hand it to your team — your call.'
  }
]

export const regulated = [
  {
    title: 'People decide',
    description: 'Agents flag and draft. A named person approves anything that matters.'
  },
  {
    title: 'Every answer is traceable',
    description: 'Each output records its source document, version, and time.'
  },
  {
    title: 'You own it',
    description: 'The code, the accounts, and the data are yours from day one.'
  },
  {
    title: 'Security review first',
    description: 'Send us your security questionnaire. We answer it before any work starts.'
  }
]

// For the platform / integration team: how a Criton build fits the systems they already run.
// Deliberately generic — no named vendors or internal systems.
export const stack = {
  experience: 'Our team works hands-on with SQL Server and enterprise integration and middleware.',
  points: [
    {
      title: 'Connects through what you run',
      description:
        'We use your existing integration tools, APIs, and database views. No new shadow databases.'
    },
    {
      title: 'Least privilege',
      description:
        'Read-only by default, scoped to the data one workflow needs, with single sign-on through your identity provider.'
    },
    {
      title: 'Fits your release process',
      description:
        'Separate environments, versioned releases, and rollback, through your change management.'
    },
    {
      title: 'Observable from day one',
      description: 'Logs, monitoring, and alerts your team can see — not a black box.'
    },
    {
      title: 'Built to hand off',
      description:
        'Runbooks, architecture docs, and a walkthrough with your platform team before we step back.'
    }
  ]
}

export const platformIdeas = [
  {
    tag: 'Platform',
    title: 'Plain-English questions over reporting data',
    problem: 'People wait on report requests for questions the data could already answer.',
    approach:
      'An assistant that turns a question into a read-only query against approved reporting views — and shows the query it ran.',
    measure: 'Report requests deflected and answers checked against source.'
  },
  {
    tag: 'Platform',
    title: 'Integration and job-failure triage',
    problem: 'Failed integration and database jobs pile up in logs and inboxes.',
    approach:
      'An agent that groups failures, finds the likely cause, and drafts the ticket. A person decides what happens next.',
    measure: 'Time to triage and repeat failures caught.'
  },
  {
    tag: 'Platform',
    title: 'Answers from your internal system docs',
    problem: 'Knowledge about internal systems lives in runbooks and a few people’s heads.',
    approach: 'An assistant that answers from your runbooks and documentation and cites the page it used.',
    measure: 'Questions answered without an escalation.'
  }
]

// Illustration of a first engagement — not a past client project.
export const example = {
  meta: [
    { label: 'Scope', value: 'One agent, one workflow' },
    { label: 'Timeline', value: 'Prototype in week 2' },
    { label: 'Stack', value: 'Fits your existing systems' },
    { label: 'Ownership', value: 'Yours' }
  ],
  setOut:
    'Pick one workflow where people spend hours on repeat questions or document checks, and agree on how we measure success.',
  cameTogether:
    'A prototype in week two, then weekly releases in staging. Your team tests with real documents the whole way.',
  result:
    'One agent in production with an audit trail, a dashboard of the agreed measures, and a team that knows how to run it.'
}

export const team = [
  { name: 'Chris Petrula', initials: 'CP', role: 'Co-founder' },
  { name: 'Tony Vazquez', initials: 'TV', role: 'Co-founder' }
]

export const disclaimer =
  'Pharmavite and its brand names are trademarks of their owners. This page is not affiliated with or endorsed by Pharmavite.'

export const variants = [
  { path: '/pharm', label: 'A · Daylight' },
  { path: '/pharm2', label: 'B · Lab Notebook' },
  { path: '/pharm3', label: 'C · Studio Proof' },
  { path: '/pharm4', label: 'D · Batch Record' }
]

// Private page setup: noindex, title, and Google Fonts loaded with a <link>
// (a CSS @import placed after Tailwind is ignored by browsers).
export function usePitchPage(title: string, fontsHref: string) {
  onMounted(() => {
    const robots = document.querySelector('meta[name="robots"]')
    if (robots) robots.setAttribute('content', 'noindex, nofollow')
    else {
      const m = document.createElement('meta')
      m.name = 'robots'
      m.content = 'noindex, nofollow'
      document.head.appendChild(m)
    }
    document.title = title
    window.scrollTo(0, 0)

    if (!document.querySelector(`link[href="${fontsHref}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = fontsHref
      document.head.appendChild(link)
    }
  })
}
