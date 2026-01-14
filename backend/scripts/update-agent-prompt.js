#!/usr/bin/env node
/**
 * Update ElevenLabs Agent System Prompt and Dynamic Variables
 *
 * Usage:
 *   node scripts/update-agent-prompt.js <agent_id>
 *
 * Example:
 *   node scripts/update-agent-prompt.js abc123xyz
 *
 * This script updates the agent with:
 * - New system prompt including Business Context section
 * - Dynamic variable placeholders for voice-friendly variables
 */

require('dotenv').config();

const { getElevenLabsService } = require('../src/modules/ai-assistant/elevenlabs.service');

const NEW_SYSTEM_PROMPT = `You are a friendly and professional AI receptionist for {{business_name}}. Your role is to help customers with:

# Business Context (You Know This Already)
- Business: {{business_name}}
- Hours: {{business_hours_voice}}
- Today: {{today_hours}}
- Location: {{address_voice}}

When someone asks about hours or location, answer directly from the above - no need for tool calls!

# Your Capabilities

1. **Booking Appointments**: Help customers schedule appointments by:
   - Asking what service they need
   - Checking availability using the check_availability tool
   - Collecting their name and contact information
   - Confirming the booking

2. **Service Information**: Provide details about services, prices, and duration using the get_services tool.

3. **Business Hours**: You already know our hours from the context above! Answer immediately.

4. **Appointment Management**: Help customers cancel or reschedule appointments.

# Guidelines
- Always be polite and professional
- Confirm details before making bookings
- If you can't help with something, offer to connect them with a human
- Keep responses concise and natural for voice conversation
- When listing options, limit to 3-4 items at a time

Start by greeting the caller and asking how you can help them today.`;

// Dynamic variable placeholders with default values
// These will be populated at runtime when calls come in
const DYNAMIC_VARIABLES = {
  business_name: 'Our Business',
  business_hours_voice: 'Please ask for our hours',
  today_hours: 'Please ask for today\'s hours',
  address_voice: 'Please ask for our location',
  caller_number: '',
  tenant_id: '',
  call_sid: '',
};

async function main() {
  const agentId = process.argv[2];

  if (!agentId) {
    console.error('Usage: node scripts/update-agent-prompt.js <agent_id>');
    console.error('\nTo find your agent ID:');
    console.error('  1. Check your business_types table for the agent_id column');
    console.error('  2. Or check tenant.metadata.elevenLabsAgentId');
    console.error('  3. Or run: node scripts/update-agent-prompt.js --list');
    process.exit(1);
  }

  const elevenlabs = getElevenLabsService();

  // List agents if requested
  if (agentId === '--list') {
    console.log('Fetching ElevenLabs agents...\n');
    try {
      const { agents } = await elevenlabs.listAgents({ pageSize: 50 });
      if (agents.length === 0) {
        console.log('No agents found.');
      } else {
        console.log('Available agents:');
        console.log('-'.repeat(80));
        agents.forEach(agent => {
          console.log(`ID: ${agent.agent_id || agent.agentId}`);
          console.log(`Name: ${agent.name || 'Unnamed'}`);
          console.log('-'.repeat(80));
        });
      }
    } catch (error) {
      console.error('Failed to list agents:', error.message);
    }
    process.exit(0);
  }

  console.log(`\nUpdating ElevenLabs agent: ${agentId}\n`);

  try {
    // First, get current agent config
    console.log('1. Fetching current agent configuration...');
    const currentAgent = await elevenlabs.getAgent(agentId);
    console.log(`   Agent name: ${currentAgent.name || 'Unnamed'}`);

    // Show current prompt (truncated)
    const currentPrompt = currentAgent.conversation_config?.agent?.prompt?.prompt || 'No prompt set';
    console.log(`   Current prompt: ${currentPrompt.substring(0, 100)}...`);

    // Update the agent
    console.log('\n2. Updating agent with new system prompt and dynamic variables...');

    const result = await elevenlabs.updateAgent(agentId, {
      systemPrompt: NEW_SYSTEM_PROMPT,
      dynamicVariables: DYNAMIC_VARIABLES,
    });

    console.log('\n✅ Agent updated successfully!');
    console.log('\nNew dynamic variables configured:');
    Object.keys(DYNAMIC_VARIABLES).forEach(key => {
      console.log(`   - {{${key}}}`);
    });

    console.log('\nThe agent will now receive these variables at call start:');
    console.log('   - business_hours_voice: Human-readable business hours');
    console.log('   - today_hours: Today\'s specific hours');
    console.log('   - address_voice: Speakable address format');

  } catch (error) {
    console.error('\n❌ Failed to update agent:', error.message);

    if (error.message.includes('not configured')) {
      console.error('\nMake sure ELEVENLABS_API_KEY is set in your .env file');
    }

    process.exit(1);
  }
}

main();
