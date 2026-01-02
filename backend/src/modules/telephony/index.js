/**
 * Telephony Module Index
 * Central export for telephony module
 */
const telephonyRoutes = require('./telephony.routes');
const telephonyController = require('./telephony.controller');
const twilioService = require('./twilio.service');
const callHandler = require('./call.handler');
const smsHandler = require('./sms.handler');
const callLogService = require('./callLog.service');
const {
  CallLog,
  CALL_DIRECTION,
  CALL_STATUS,
} = require('./callLog.model');

module.exports = {
  telephonyRoutes,
  telephonyController,
  twilioService,
  callHandler,
  smsHandler,
  callLogService,
  CallLog,
  CALL_DIRECTION,
  CALL_STATUS,
};
