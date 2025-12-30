/**
 * Telephony Module Index
 * Central export for telephony module
 */
const telephonyRoutes = require('./telephony.routes');
const telephonyController = require('./telephony.controller');
const twilioService = require('./twilio.service');
const callHandler = require('./call.handler');
const smsHandler = require('./sms.handler');
const {
  CallLog,
  CALL_DIRECTION,
  CALL_STATUS,
} = require('./callLog.model');
const {
  SmsConsent,
  CONSENT_STATUS,
} = require('./smsConsent.model');
const {
  SmsMessage,
  MESSAGE_DIRECTION,
  MESSAGE_STATUS,
  MESSAGE_INTENT,
} = require('./smsMessage.model');

module.exports = {
  telephonyRoutes,
  telephonyController,
  twilioService,
  callHandler,
  smsHandler,
  CallLog,
  CALL_DIRECTION,
  CALL_STATUS,
  SmsConsent,
  CONSENT_STATUS,
  SmsMessage,
  MESSAGE_DIRECTION,
  MESSAGE_STATUS,
  MESSAGE_INTENT,
};
