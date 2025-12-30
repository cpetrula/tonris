/**
 * Lead Extraction Service
 * Extracts customer information from conversation transcripts
 * Ported from bolt-ai-node with enhancements
 */
const logger = require('../../utils/logger');

/**
 * Create a new lead session for tracking extracted information
 * @returns {Object} - Fresh lead session object
 */
const createLeadSession = () => ({
  customerName: null,
  customerEmail: null,
  businessType: null,
  companyName: null,
  contactPreference: null,
  emailFragments: [],
  companyNameFragments: [],
  // SMS consent tracking
  smsConsent: null,
  smsNumber: null,
  smsConsentConfirmed: false,
  smsQuestionAsked: false,
});

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
const validateEmail = (email) => {
  if (!email) return false;

  // Basic email validation regex
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!pattern.test(email)) return false;

  // Additional checks
  if ((email.match(/@/g) || []).length !== 1) return false;

  const [local, domain] = email.split('@');

  // Local part (before @) checks
  if (local.length === 0 || local.length > 64) return false;

  // Domain part checks
  if (domain.length === 0 || domain.length > 255) return false;

  // Domain must have at least one dot
  if (!domain.includes('.')) return false;

  return true;
};

/**
 * Fix common speech-to-text errors in email addresses
 * @param {string} email - Raw email string
 * @returns {string} - Normalized email
 */
const normalizeEmail = (email) => {
  const replacements = {
    // Number words
    '4ward': 'forward',
    '2': 'to',
    '4': 'for',
    '1': 'one',
    '8': 'eight',
    '0': 'o',

    // Common speech errors
    ' at ': '@',
    ' dot ': '.',
    'dot com': '.com',
    'dot net': '.net',
    'dot org': '.org',
    'dot io': '.io',

    // Remove spaces
    ' ': '',
  };

  let normalized = email.toLowerCase().trim();

  // Apply replacements in order
  for (const [old, newVal] of Object.entries(replacements)) {
    normalized = normalized.split(old).join(newVal);
  }

  // Ensure there's exactly one @
  if (!normalized.includes('@') && email.toLowerCase().includes('at')) {
    normalized = normalized.replace('at', '@');
  }

  return normalized;
};

/**
 * Normalize phone number to E.164 format
 * @param {string} phone - Raw phone number
 * @returns {string|null} - Normalized phone or null
 */
const normalizePhoneNumber = (phone) => {
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  if (digits.length > 10) {
    return `+${digits}`;
  }
  return null;
};

/**
 * Spoken email patterns for matching
 */
const spokenEmailPatterns = [
  // Handle "t bone 7777" being spoken as separate words for "tbone7777"
  {
    pattern: /([a-z])\s+bone\s+(\d+)\s+at\s+([a-z0-9-]+)\s+dot\s+(com|net|org|io|ai|us|uk|ca|gov|edu)/i,
    build: (m) => `${m[1]}bone${m[2]}@${m[3]}.${m[4]}`
  },
  // Word + numbers: "tbone 7777 at hotmail dot com"
  {
    pattern: /([a-z][a-z0-9]*)\s+(\d+)\s+at\s+([a-z0-9-]+)\s+dot\s+(com|net|org|io|ai|us|uk|ca|gov|edu)/i,
    build: (m) => `${m[1]}${m[2]}@${m[3]}.${m[4]}`
  },
  // Just word: "tbone7777 at hotmail dot com"
  {
    pattern: /([a-z][a-z0-9]+)\s+at\s+([a-z0-9-]+)\s+dot\s+(com|net|org|io|ai|us|uk|ca|gov|edu)/i,
    build: (m) => `${m[1]}@${m[2]}.${m[3]}`
  },
  // Standard: "name at domain dot com"
  {
    pattern: /([a-z0-9._-]+)\s+at\s+([a-z0-9-]+)\s+dot\s+(com|net|org|io|ai|us|uk|ca|gov|edu)/i,
    build: (m) => `${m[1].replace(/[\s.-]/g, '')}@${m[2]}.${m[3]}`
  },
  {
    pattern: /([a-z0-9._-]+)\s+at\s+([a-z0-9-]+)\s+dot\s+co\s+dot\s+(uk|nz|za)/i,
    build: (m) => `${m[1].replace(/[\s.-]/g, '')}@${m[2]}.co.${m[3]}`
  },
  {
    pattern: /([a-z0-9._-]+)\s+at\s+([a-z0-9-]+)\s+dot\s+co/i,
    build: (m) => `${m[1].replace(/[\s.-]/g, '')}@${m[2]}.co`
  },
  // Mixed format
  {
    pattern: /([a-z0-9._-]+)@([a-z0-9-]+)\s+dot\s+(com|net|org|io|ai|us|uk|ca|gov|edu)/i,
    build: (m) => `${m[1]}@${m[2]}.${m[3]}`
  },
  {
    pattern: /([a-z0-9._-]+)\s+at\s+([a-z0-9-]+)\.(com|net|org|io|ai|us|uk|ca|gov|edu)/i,
    build: (m) => `${m[1].replace(/[\s.-]/g, '')}@${m[2]}.${m[3]}`
  },
];

/**
 * Business type keywords
 */
const businessKeywords = [
  'salon', 'shop', 'gym', 'restaurant', 'cafe', 'bakery', 'hotel', 'motel',
  'spa', 'barbershop', 'pharmacy', 'clinic', 'hospital', 'practice',
  'school', 'daycare', 'library', 'bookstore', 'boutique', 'store',
  'bar', 'pub', 'nightclub', 'theater', 'theatre', 'museum', 'gallery',
  'garage', 'dealership', 'workshop', 'factory', 'warehouse', 'studio',
  'office', 'firm', 'agency', 'center', 'company', 'business',
  'hvac', 'plumbing', 'electrical', 'contractor', 'roofing', 'landscaping',
  'cleaning', 'painting', 'flooring', 'carpentry', 'handyman'
];

/**
 * Excluded name words
 */
const excludedNames = [
  'Sure', 'Yes', 'Yeah', 'Okay', 'Ok', 'Great', 'Perfect', 'Hello', 'Hi', 'Hey',
  'Thanks', 'Thank', 'Ready', 'Absolutely', 'Definitely', 'Yep', 'Yup', 'Nope', 'Nah',
  'Good', 'Fine', 'Well', 'Right', 'Cool', 'Awesome', 'Nice', 'Sounds',
  'You', 'Me', 'We', 'They', 'He', 'She', 'It', 'That', 'This', 'There', 'Here',
  'Just', 'Actually', 'Really', 'Maybe', 'Probably', 'Certainly',
  'Um', 'Uh', 'Like', 'So', 'Well', 'Anyway', 'Basically',
  'Today', 'Tomorrow', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
  'Interested', 'Calling', 'Looking', 'Wondering', 'Thinking', 'Hoping',
  'Going', 'Doing', 'Having', 'Getting', 'Making', 'Taking',
].map(n => n.toLowerCase());

/**
 * Extract customer information from conversation text
 * @param {string} text - Text to extract from
 * @param {Object} session - Lead session object
 * @param {boolean} isUserSpeech - True if this is user speech (not assistant)
 */
const extractCustomerInfo = (text, session, isUserSpeech = true) => {
  // Only extract from user speech, not assistant responses (except SMS question detection)
  const textLower = text.toLowerCase();

  // ==================== EMAIL EXTRACTION ====================
  if (isUserSpeech) {
    // Extract email (handle spoken emails like "john at gmail dot com")
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i;
    const emailMatch = text.match(emailPattern);

    if (emailMatch) {
      const rawEmail = emailMatch[0];
      const normalizedEmail = normalizeEmail(rawEmail);

      if (validateEmail(normalizedEmail)) {
        const oldEmail = session.customerEmail;
        session.customerEmail = normalizedEmail;
        if (oldEmail && oldEmail !== normalizedEmail) {
          logger.debug(`[Lead] EMAIL UPDATED: ${oldEmail} -> ${normalizedEmail}`);
        } else {
          logger.debug(`[Lead] EMAIL CAPTURED: ${normalizedEmail}`);
        }
      }
    }

    // Check for email fragments
    const isEmailFragment =
      textLower.includes('at') ||
      textLower.includes('@') ||
      textLower.includes('dot') ||
      textLower.includes('.com') ||
      textLower.includes('hotmail') ||
      textLower.includes('gmail');

    const excludedFragments = ['my email', 'email', 'my email address', 'email address', 'is', 'yes', 'no'];

    if (isEmailFragment && !excludedFragments.includes(textLower.trim())) {
      session.emailFragments.push(textLower);
      session.emailFragments = session.emailFragments.slice(-3); // Keep last 3
    }

    // Try to match patterns
    let combinedText = textLower;
    if (session.emailFragments.length >= 2) {
      combinedText = session.emailFragments.join(' ');
    }

    for (const { pattern, build } of spokenEmailPatterns) {
      const match = combinedText.match(pattern);
      if (match) {
        const email = build(match).toLowerCase();

        if (validateEmail(email)) {
          session.customerEmail = email;
          session.emailFragments = [];
          logger.debug(`[Lead] Captured spoken email: ${email}`);
          break;
        }
      }
    }
  }

  // ==================== BUSINESS TYPE EXTRACTION ====================
  if (isUserSpeech && !session.businessType) {
    // Multi-word business phrases (e.g., "dental office", "nail salon")
    for (const keyword of businessKeywords) {
      const pattern = new RegExp(`\\b([a-z]+)\\s+${keyword}\\b`, 'i');
      const match = textLower.match(pattern);
      if (match) {
        const adjective = match[1];
        const excluded = ['a', 'an', 'the', 'my', 'our', 'your', 'this', 'that', 'have', 'own', 'run'];
        if (!excluded.includes(adjective)) {
          session.businessType = `${adjective} ${keyword}`.replace(/\b\w/g, c => c.toUpperCase());
          logger.debug(`[Lead] Captured business type: ${session.businessType}`);
          break;
        }
      }
    }

    // Standalone keywords
    if (!session.businessType) {
      const textCleaned = textLower.replace(/[.,!?;:]/g, '');
      const words = textCleaned.split(/\s+/);
      for (const keyword of businessKeywords) {
        if (words.includes(keyword)) {
          session.businessType = keyword.charAt(0).toUpperCase() + keyword.slice(1);
          logger.debug(`[Lead] Captured business type: ${session.businessType}`);
          break;
        }
      }
    }
  }

  // ==================== CUSTOMER NAME EXTRACTION ====================
  if (isUserSpeech && !session.customerName) {
    const namePatterns = [
      /(?:my name is|my name's|i'm|i am|this is|call me)\s+([a-z]+(?:\s+[a-z]+)?)/i,
      /(?:it's|speaking with)\s+([a-z]+(?:\s+[a-z]+)?)/i,
    ];

    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) {
        const rawName = match[1].trim();
        const name = rawName.replace(/\b\w/g, c => c.toUpperCase());

        if (excludedNames.includes(rawName.toLowerCase())) {
          continue;
        }

        if (name.length >= 2 && name.length <= 20) {
          session.customerName = name;
          logger.debug(`[Lead] Captured customer name: ${name}`);
          break;
        }
      }
    }
  }

  // ==================== COMPANY NAME EXTRACTION ====================
  if (isUserSpeech) {
    const companyPatterns = [
      /(?:calling from|from)\s+([A-Z][A-Za-z0-9\s&']{2,30}?)(?:[.,!]|\s+and\s|$)/i,
      /(?:shop|salon|business|company|practice|office|firm|clinic|studio|center)(?:'s)?\s+(?:name\s+)?is\s+([A-Za-z0-9\s&']{2,30}?)(?:[.,]|\s+and\s|$)/i,
      /(?:it's|its)\s+called\s+([A-Za-z0-9\s&']{2,30}?)(?:[.,]|\s+and\s|$)/i,
      /(?:the\s+)?name\s+(?:of\s+my\s+(?:nail\s+salon|tattoo\s+shop|shop|salon|business|company)\s+)?is\s+([A-Za-z0-9\s&']{2,30}?)(?:[.,]|\s+and\s|$)/i,
    ];

    const excludedCompanyNames = [
      'your', 'my', 'the', 'a', 'an', 'there', 'here', 'you', 'we', 'they', 'our',
      'my email', 'my email address', 'email address', 'my phone', 'phone number',
      'that', 'this', 'it', 'something'
    ];

    for (const pattern of companyPatterns) {
      const match = text.match(pattern);
      if (match) {
        const companyName = match[1].trim();
        const isExcluded = excludedCompanyNames.some(excl => companyName.toLowerCase().includes(excl));
        if (!isExcluded && companyName.length > 1) {
          const oldName = session.companyName;
          session.companyName = companyName;
          if (oldName && oldName !== companyName) {
            logger.debug(`[Lead] Updated company name: ${oldName} -> ${companyName}`);
          } else {
            logger.debug(`[Lead] Captured company name: ${companyName}`);
          }
          break;
        }
      }
    }
  }

  // ==================== CONTACT PREFERENCE ====================
  if (isUserSpeech && !session.contactPreference) {
    if (/\b(call|phone|ring)\s*(me|back)?\b/i.test(textLower)) {
      session.contactPreference = 'call';
      logger.debug('[Lead] Contact preference: call');
    } else if (/\b(email|mail|send)\s*(me)?\b/i.test(textLower)) {
      session.contactPreference = 'email';
      logger.debug('[Lead] Contact preference: email');
    }
  }

  // ==================== SMS CONSENT EXTRACTION ====================

  // Detect when assistant asks about text confirmation
  if (!isUserSpeech && !session.smsQuestionAsked) {
    const smsQuestionPatterns = [
      /text\s*(confirmation|reminder)/i,
      /send\s*(you\s*)?(a\s*)?text/i,
      /would you like.*text/i,
      /want.*text.*confirmation/i,
    ];
    for (const pattern of smsQuestionPatterns) {
      if (pattern.test(textLower)) {
        session.smsQuestionAsked = true;
        logger.debug('[Lead] SMS question detected from assistant');
        break;
      }
    }
  }

  // Process user responses for SMS consent
  if (!session.smsConsentConfirmed && isUserSpeech) {
    // Patterns for YES to SMS
    const smsYesPatterns = [
      /\b(yes|yeah|yep|sure|absolutely|definitely|please|ok|okay)\b.*\b(text|sms|message)\b/i,
      /\b(text|sms|message)\b.*\b(yes|yeah|yep|sure|sounds good|that works|perfect)\b/i,
      /\bsend\s*(me\s*)?(a\s*)?(text|sms|message|reminder)\b/i,
      /\b(text|sms)\s*(me|is fine|works|sounds good)\b/i,
      /\bthat\s*(number|one)\s*(is\s*)?(fine|good|works|correct)\b/i,
      /\byes\b.*\b(this|that|the)\s*number\b/i,
      /\buse\s*this\s*number\b/i,
    ];

    const simpleYesPatterns = [
      /^(yes|yeah|yep|sure|please|ok|okay|absolutely|definitely)\.?$/i,
    ];

    const smsNoPatterns = [
      /\b(no|nope|nah)\b.*\b(text|sms|message)\b/i,
      /\bdon'?t\s*(text|sms|message|send)\b/i,
      /\b(no\s*)?(thanks|thank you)\b.*\b(text|sms)\b/i,
      /\bprefer\s*(not|no)\s*(text|sms)\b/i,
      /\bjust\s*(email|call)\b/i,
      /\bno\s*(text|sms|message)s?\b/i,
    ];

    const differentNumberPatterns = [
      /\b(different|another|other)\s*(number|phone)\b/i,
      /\bsend\s*(it\s*)?(to|at)\s*(\+?1?\s*)?(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/i,
      /\btext\s*(me\s*)?(at|to)\s*(\+?1?\s*)?(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/i,
      /\bmy\s*(cell|mobile|text)\s*(number\s*)?(is\s*)?(\+?1?\s*)?(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/i,
    ];

    // Check for different number request
    for (const pattern of differentNumberPatterns) {
      const match = text.match(pattern);
      if (match) {
        const phoneMatch = text.match(/(\+?1?\s*)?(\d{3})[-.\s]?(\d{3})[-.\s]?(\d{4})/);
        if (phoneMatch) {
          const phone = `+1${phoneMatch[2]}${phoneMatch[3]}${phoneMatch[4]}`;
          session.smsNumber = phone;
          session.smsConsent = true;
          session.smsConsentConfirmed = true;
          logger.debug(`[Lead] SMS consent YES with different number: ${phone}`);
          break;
        }
      }
    }

    // Check for explicit YES
    if (!session.smsConsentConfirmed) {
      for (const pattern of smsYesPatterns) {
        if (pattern.test(textLower)) {
          session.smsConsent = true;
          session.smsConsentConfirmed = true;
          logger.debug('[Lead] SMS consent: YES (explicit pattern)');
          break;
        }
      }
    }

    // Check for simple YES after SMS question
    if (!session.smsConsentConfirmed && session.smsQuestionAsked) {
      for (const pattern of simpleYesPatterns) {
        if (pattern.test(text.trim())) {
          session.smsConsent = true;
          session.smsConsentConfirmed = true;
          logger.debug('[Lead] SMS consent: YES (simple response after SMS question)');
          break;
        }
      }
    }

    // Check for NO
    if (!session.smsConsentConfirmed) {
      const simpleNoPatterns = [
        /^(no|nope|nah|no thanks|not now)\.?$/i,
      ];

      for (const pattern of smsNoPatterns) {
        if (pattern.test(textLower)) {
          session.smsConsent = false;
          session.smsConsentConfirmed = true;
          logger.debug('[Lead] SMS consent: NO (explicit pattern)');
          break;
        }
      }

      if (!session.smsConsentConfirmed && session.smsQuestionAsked) {
        for (const pattern of simpleNoPatterns) {
          if (pattern.test(text.trim())) {
            session.smsConsent = false;
            session.smsConsentConfirmed = true;
            logger.debug('[Lead] SMS consent: NO (simple response after SMS question)');
            break;
          }
        }
      }
    }
  }
};

/**
 * Get extracted lead data from session
 * @param {Object} session - Lead session
 * @returns {Object} - Extracted lead data
 */
const getExtractedLead = (session) => ({
  customerName: session.customerName,
  customerEmail: session.customerEmail,
  businessType: session.businessType,
  companyName: session.companyName,
  contactPreference: session.contactPreference,
  smsConsent: session.smsConsent,
  smsConsentConfirmed: session.smsConsentConfirmed,
  smsNumber: session.smsNumber,
});

/**
 * Process a complete transcript and extract lead info
 * @param {Array} transcript - Array of {role, content} objects
 * @returns {Object} - Extracted lead data
 */
const processTranscript = (transcript) => {
  const session = createLeadSession();

  for (const turn of transcript) {
    const isUserSpeech = turn.role === 'user';
    extractCustomerInfo(turn.content, session, isUserSpeech);
  }

  return getExtractedLead(session);
};

module.exports = {
  createLeadSession,
  validateEmail,
  normalizeEmail,
  normalizePhoneNumber,
  extractCustomerInfo,
  getExtractedLead,
  processTranscript,
};
