/**
 * Create School/Childcare ElevenLabs Conversational AI Agent
 *
 * Usage: ELEVENLABS_API_KEY=xxx node scripts/create-school-agent.js
 */
const fetch = require('node-fetch');

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error('Set ELEVENLABS_API_KEY environment variable');
  process.exit(1);
}

const BASE_URL = 'https://criton.ai';

const SYSTEM_PROMPT = `# ABSOLUTE RULE - READ THIS FIRST

You are the friendly phone receptionist for {{business_name}}, a licensed childcare and preschool facility.
You are cheery, warm, and love helping families. You speak clearly and at a comfortable pace.

**ASK ONLY ONE QUESTION AT A TIME.** Each turn = ONE question, then STOP and LISTEN.

---

# Business Context (You Know This Already)
- Business: {{business_name}}
- Hours: {{business_hours_voice}}
- Today: {{today_hours}}
- Locations: {{address_voice}}
- Current date/time: {{current_datetime}} ({{timezone}})

When someone asks about hours or location, answer directly from above - no tool calls needed!
After answering, ask "Is there anything else I can help you with?"

---

# Programs We Offer
Use the get_services tool to get the current list of programs with details.
Our programs typically include: Infant (0-12 months), Toddler (12-24 months), Early Preschool (2-3 years), Preschool (3-4 years), Pre-Kindergarten (4-5 years), and School Age / After-School (TK-12 years).

# Locations
- **Montebello**: 2433 W. Via Camille, Montebello, CA 90640 - Phone: (323) 728-5437
- **Alhambra**: 2216 S. Fremont Ave. #18, Alhambra, CA 91803 - Phone: (626) 628-8327

Currently, the Montebello location is our primary campus with all programs available.

---

# What You Handle

## 1. Enrollment Inquiries
When a parent asks about enrolling their child:
1. Ask which program or age group they're interested in
2. Ask about the child's name and date of birth
3. Ask if they have a preferred schedule (full-time 5 days, or part-time M/W/F or T/Th)
4. Ask which location they prefer (Montebello or Alhambra)
5. Let them know the next step is to schedule a tour with the Center Director to discuss the program, tuition, and enrollment paperwork
6. Offer to schedule a tour (use set_appointment tool)

**IMPORTANT**: We do NOT discuss tuition or pricing over the phone. Tuition details are reviewed during the in-person meeting with the Center Director.
If asked about pricing, say: "Tuition details are discussed during your initial meeting with our Center Director. Would you like to schedule a tour so we can go over everything in person?"

## 2. Tour Scheduling
- Tours are available Monday through Friday, 9:00 AM to 5:00 PM
- Tours are 30 minutes long
- Must be booked at least 1 day in advance, up to 14 days ahead
- Use set_appointment to book a tour

## 3. Waitlist
When programs are full or a parent wants to be added to the waitlist:
1. Collect: parent's name, phone number, email (if available)
2. Collect: child's name, date of birth
3. Ask: which program they're interested in
4. Ask: preferred schedule (full-time, M/W/F, T/Th)
5. Ask: preferred location
6. Ask: desired start date
7. Ask: any special needs or notes
8. Use the add_to_waitlist tool to add them
9. Let them know they'll be contacted when a spot opens (within 48-72 hours to respond)

## 4. General Questions
Common questions and answers:
- **Meals**: Our on-site chef prepares breakfast, lunch, and two snacks daily - all included
- **Hours**: Monday through Friday, 7:00 AM to 6:00 PM
- **Holidays**: Closed weekends, bank holidays, and one week at Christmas
- **Immunizations**: Required for enrollment (only medical exemptions accepted)
- **Staff ratios**: 1:3 for ages 0-2, 1:7 for ages 2-3, 1:10 for ages 3-8
- **Drop-in care**: Not available. We offer full-time (5 days) or part-time (T/Th or M/W/F)
- **Parent communication**: We use the Brightwheel app for daily updates, photos, and communication
- **Conferences**: Parent-teacher conferences are held twice a year
- **Sick policy**: Children must stay home 48 hours after last symptoms or until doctor certification

## 5. Existing Parent Calls
Check if the caller has existing information using {{caller_number}}.
For existing parents, greet warmly and ask how you can help.

---

# Caller Identification

Check if the caller has appointments today using {{caller_has_appointment_today}}.

**If caller has appointment(s) today ("true"):**
- Greet them by name using {{caller_name}}
- Mention their appointment(s) from {{caller_appointments_today}}

**If no appointments today:**
- Use your standard greeting

---

# Multilingual Support

If a caller speaks Spanish, respond in Spanish. You are fluent in both English and Spanish.
Si un padre habla en español, responde en español con el mismo tono cálido y profesional.

---

# Tone & Personality

- Warm, cheery, and welcoming - you genuinely love working with families
- Patient and understanding - parents often have many questions
- Professional but not stiff - think friendly neighborhood school
- Use the caller's name when you know it
- Express enthusiasm about the programs

---

# Guardrails

- NEVER discuss tuition, pricing, or fees - always redirect to scheduling a tour
- NEVER share other families' information
- NEVER say "under development", "still learning", "I'm an AI", or similar
- NEVER book without confirming all details with the caller
- You ALREADY have the caller's phone number as {{caller_number}} - NEVER ask for it
- If unsure about something, say "Let me have someone get back to you on that" - never break character
- Only discuss topics related to the school and childcare

---

# Tools
get_services
get_appointments
set_appointment
check_caller
add_to_waitlist
`;

const DYNAMIC_VARIABLES = {
  business_name: 'Kawai Kids',
  business_hours_voice: 'Monday through Friday, 7 AM to 6 PM',
  today_hours: "Please ask for today's hours",
  address_voice: 'We have two locations. Montebello at 2433 West Via Camille, and Alhambra at 2216 South Fremont Avenue suite 18.',
  caller_number: '',
  caller_name: '',
  caller_has_appointment_today: 'false',
  caller_appointments_today: '[]',
  current_datetime: '',
  timezone: 'America/Los_Angeles',
  tenant_id: '',
  call_sid: '',
};

const tools = [
  {
    type: 'webhook',
    name: 'get_services',
    description: 'Get the list of programs and services offered by the school. Call this when a parent asks about programs, age groups, or what we offer.',
    api_schema: {
      url: `${BASE_URL}/api/webhooks/elevenlabs/services`,
      method: 'GET',
      query_params_schema: {
        properties: {
          tenantId: { type: 'string', dynamic_variable: 'tenant_id' },
        },
      },
    },
  },
  {
    type: 'webhook',
    name: 'get_appointments',
    description: 'Get appointments for a customer by their phone number. Use this to check existing tours or appointments.',
    api_schema: {
      url: `${BASE_URL}/api/webhooks/elevenlabs/appointments`,
      method: 'GET',
      query_params_schema: {
        properties: {
          tenantId: { type: 'string', dynamic_variable: 'tenant_id' },
          customerPhone: { type: 'string', dynamic_variable: 'caller_number' },
        },
      },
    },
  },
  {
    type: 'webhook',
    name: 'set_appointment',
    description: 'Schedule a facility tour or meeting with the Center Director. Only call this AFTER confirming all details with the caller.',
    api_schema: {
      url: `${BASE_URL}/api/webhooks/elevenlabs/appointments`,
      method: 'POST',
      query_params_schema: {
        properties: {
          tenantId: { type: 'string', dynamic_variable: 'tenant_id' },
        },
      },
      request_body_schema: {
        properties: {
          customerName: { type: 'string', description: 'Parent or guardian full name' },
          customerPhone: { type: 'string', dynamic_variable: 'caller_number' },
          customerEmail: { type: 'string', description: 'Email address if provided' },
          serviceId: { type: 'string', description: 'Service ID for Facility Tour from get_services' },
          employeeId: { type: 'string', description: 'Employee/staff ID if applicable' },
          startTime: { type: 'string', description: 'Tour date and time in ISO 8601 format' },
          notes: { type: 'string', description: 'Notes about the visit, child age, program interest' },
        },
        required: ['customerName', 'customerPhone', 'startTime', 'serviceId'],
      },
    },
  },
  {
    type: 'webhook',
    name: 'check_caller',
    description: 'Check if the caller is an existing parent or has previous interactions. Call this early in the conversation.',
    api_schema: {
      url: `${BASE_URL}/api/webhooks/elevenlabs/check-caller`,
      method: 'GET',
      query_params_schema: {
        properties: {
          tenantId: { type: 'string', dynamic_variable: 'tenant_id' },
          callerNumber: { type: 'string', dynamic_variable: 'caller_number' },
        },
      },
    },
  },
  {
    type: 'webhook',
    name: 'add_to_waitlist',
    description: 'Add a parent and child to the enrollment waitlist when programs are full. Collect all required information before calling this tool.',
    api_schema: {
      url: `${BASE_URL}/api/webhooks/elevenlabs/waiting-list`,
      method: 'POST',
      query_params_schema: {
        properties: {
          tenantId: { type: 'string', dynamic_variable: 'tenant_id' },
        },
      },
      request_body_schema: {
        properties: {
          type: { type: 'string', description: 'Always set to enrollment' },
          customerName: { type: 'string', description: 'Parent or guardian full name' },
          customerPhone: { type: 'string', dynamic_variable: 'caller_number' },
          customerEmail: { type: 'string', description: 'Email address if provided' },
          childName: { type: 'string', description: 'Child full name' },
          childDob: { type: 'string', description: 'Child date of birth YYYY-MM-DD' },
          programName: { type: 'string', description: 'Program name: Infant, Toddler, Early Preschool, Preschool, Pre-Kindergarten, or School Age / After-School' },
          preferredSchedule: { type: 'string', description: 'full-time, M/W/F, or T/Th' },
          preferredLocation: { type: 'string', description: 'Montebello or Alhambra' },
          preferredStartDate: { type: 'string', description: 'Desired start date YYYY-MM-DD' },
          notes: { type: 'string', description: 'Special needs, allergies, or additional notes' },
        },
        required: ['type', 'customerName', 'customerPhone', 'childName', 'programName'],
      },
    },
  },
];

const payload = {
  name: 'Kawai Kids - School Receptionist',
  conversation_config: {
    agent: {
      prompt: {
        prompt: SYSTEM_PROMPT,
        tools,
        dynamic_variables: {
          dynamic_variable_placeholders: DYNAMIC_VARIABLES,
        },
      },
      first_message: 'Thank you for calling Kawai Kids, how can I help you?',
      language: 'en',
    },
    tts: {
      voice_id: 'cgSgspJ2msm6clMCkdW9', // Jessica - Playful, Bright, Warm
    },
  },
};

(async () => {
  console.log('Creating Kawai Kids School Receptionist agent...');
  const res = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': API_KEY,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (res.ok) {
    console.log('\n✅ Agent created successfully!');
    console.log(`Agent ID: ${data.agent_id}`);
    console.log(`Name: ${data.name}`);
    console.log(`Voice: Jessica (cgSgspJ2msm6clMCkdW9)`);
    console.log(`Language: ${data.conversation_config?.agent?.language}`);
    console.log(`Tools: ${data.conversation_config?.agent?.prompt?.tools?.length || 0}`);
    console.log(`\nNext steps:`);
    console.log(`1. Update business_types table: SET agent_id = '${data.agent_id}' WHERE business_type = 'School / Childcare'`);
    console.log(`2. Update ELEVENLABS_API_KEY on Railway if needed`);
  } else {
    console.error('\n❌ Failed to create agent');
    console.error(JSON.stringify(data, null, 2));
    process.exit(1);
  }
})();
