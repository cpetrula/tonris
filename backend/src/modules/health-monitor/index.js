/**
 * Health Monitor Module
 * Self-healing database monitoring with alerting
 * 
 * Checks DB connectivity on a schedule. On failure:
 * 1. Sends alerts to configured phone numbers
 * 2. Exits process (Railway restart policy handles recovery)
 */
const cron = require('node-cron');
const { testConnection } = require('../../config/db');
const env = require('../../config/env');
const logger = require('../../utils/logger');

// Configuration from environment
const config = {
  // Comma-delimited phone numbers to alert on failure
  alertPhones: (process.env.HEALTH_ALERT_PHONES || '').split(',').map(p => p.trim()).filter(Boolean),
  
  // How often to check (cron expression, default: every 2 minutes)
  checkInterval: process.env.HEALTH_CHECK_INTERVAL || '*/2 * * * *',
  
  // How many consecutive failures before alerting/exiting
  failureThreshold: parseInt(process.env.HEALTH_FAILURE_THRESHOLD, 10) || 3,
  
  // Whether to exit on failure (let Railway restart)
  exitOnFailure: process.env.HEALTH_EXIT_ON_FAILURE !== 'false',
  
  // Twilio config (uses existing env vars)
  twilioAccountSid: env.TWILIO_SMS_ACCOUNT_SID,
  twilioAuthToken: env.TWILIO_SMS_AUTH_TOKEN,
  twilioFromNumber: env.TWILIO_SMS_PHONE_NUMBER,
};

// State
let consecutiveFailures = 0;
let isMonitoring = false;
let cronJob = null;

/**
 * Send SMS alert via Twilio
 */
const sendAlert = async (message) => {
  if (!config.twilioAccountSid || !config.twilioAuthToken || !config.twilioFromNumber) {
    logger.warn('Health monitor: Twilio not configured, cannot send SMS alerts');
    return;
  }
  
  if (config.alertPhones.length === 0) {
    logger.warn('Health monitor: No alert phones configured (HEALTH_ALERT_PHONES)');
    return;
  }
  
  const twilio = require('twilio')(config.twilioAccountSid, config.twilioAuthToken);
  
  for (const phone of config.alertPhones) {
    try {
      await twilio.messages.create({
        body: message,
        from: config.twilioFromNumber,
        to: phone.startsWith('+') ? phone : `+1${phone}`,
      });
      logger.info(`Health monitor: Alert sent to ${phone}`);
    } catch (error) {
      logger.error(`Health monitor: Failed to send alert to ${phone}:`, error.message);
    }
  }
};

/**
 * Perform health check
 */
const performCheck = async () => {
  const isHealthy = await testConnection();
  
  if (isHealthy) {
    if (consecutiveFailures > 0) {
      logger.info(`Health monitor: Database recovered after ${consecutiveFailures} failures`);
      consecutiveFailures = 0;
    }
    return true;
  }
  
  // Database is down
  consecutiveFailures++;
  logger.error(`Health monitor: Database check failed (${consecutiveFailures}/${config.failureThreshold})`);
  
  if (consecutiveFailures >= config.failureThreshold) {
    const alertMessage = `🚨 CRITON.AI DATABASE DOWN

Database health check failed ${consecutiveFailures} times.
Service will restart automatically.
Time: ${new Date().toISOString()}

If issues persist, check Railway dashboard:
https://railway.app/dashboard`;

    await sendAlert(alertMessage);
    
    if (config.exitOnFailure) {
      logger.error('Health monitor: Threshold exceeded, exiting for restart...');
      
      // Give time for alert to send, then exit
      setTimeout(() => {
        process.exit(1);
      }, 2000);
    }
  }
  
  return false;
};

/**
 * Start the health monitor
 */
const start = () => {
  if (isMonitoring) {
    logger.warn('Health monitor: Already running');
    return;
  }
  
  if (config.alertPhones.length === 0) {
    logger.info('Health monitor: No HEALTH_ALERT_PHONES configured, monitoring disabled');
    return;
  }
  
  logger.info(`Health monitor: Starting with interval "${config.checkInterval}"`);
  logger.info(`Health monitor: Alert phones: ${config.alertPhones.join(', ')}`);
  logger.info(`Health monitor: Failure threshold: ${config.failureThreshold}`);
  logger.info(`Health monitor: Exit on failure: ${config.exitOnFailure}`);
  
  cronJob = cron.schedule(config.checkInterval, performCheck, {
    scheduled: true,
    timezone: 'America/Los_Angeles',
  });
  
  isMonitoring = true;
};

/**
 * Stop the health monitor
 */
const stop = () => {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
  }
  isMonitoring = false;
  logger.info('Health monitor: Stopped');
};

/**
 * Get current status
 */
const getStatus = () => ({
  isMonitoring,
  consecutiveFailures,
  config: {
    alertPhones: config.alertPhones,
    checkInterval: config.checkInterval,
    failureThreshold: config.failureThreshold,
    exitOnFailure: config.exitOnFailure,
    twilioConfigured: !!(config.twilioAccountSid && config.twilioAuthToken && config.twilioFromNumber),
  },
});

module.exports = {
  start,
  stop,
  getStatus,
  performCheck,
};
